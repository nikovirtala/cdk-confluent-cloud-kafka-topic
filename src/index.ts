import * as path from "node:path";
import {
    aws_lambda,
    aws_logs,
    type aws_secretsmanager,
    CustomResource,
    custom_resources,
    Duration,
    RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";

/**
 * Properties for Confluent Cloud Kafka Topic construct.
 *
 * This construct creates a Kafka topic in Confluent Cloud using a custom resource
 * that calls the Confluent Cloud REST API v3.
 *
 * @see https://docs.confluent.io/cloud/current/api.html
 */
export interface ConfluentKafkaTopicProps {
    /**
     * The name of the Kafka topic to create.
     *
     * Topic names must be unique within a cluster and follow Kafka naming conventions.
     */
    readonly topicName: string;

    /**
     * The Confluent Cloud cluster ID where the topic will be created.
     *
     * Format: lkc-xxxxx
     */
    readonly clusterId: string;

    /**
     * The Confluent Cloud environment ID containing the cluster.
     *
     * Format: env-xxxxx
     */
    readonly environmentId: string;

    /**
     * The Confluent Cloud API key for authentication.
     *
     * This key must have permissions to create and manage topics in the specified cluster.
     * Mutually exclusive with credentialsSecret.
     *
     * @see credentialsSecret for storing credentials securely in Secrets Manager
     */
    readonly apiKey?: string;

    /**
     * The Confluent Cloud API secret for authentication.
     *
     * This secret corresponds to the API key and must be kept secure.
     * Mutually exclusive with credentialsSecret.
     *
     * @see credentialsSecret for storing credentials securely in Secrets Manager
     */
    readonly apiSecret?: string;

    /**
     * AWS Secrets Manager secret containing Confluent Cloud API credentials.
     *
     * The secret must be stored as a JSON object with the following structure:
     *
     * {
     *   "apiKey": "your-confluent-api-key",
     *   "apiSecret": "your-confluent-api-secret"
     * }
     *
     * The Lambda function will retrieve these credentials at runtime using the AWS SDK.
     * The construct automatically grants the Lambda function read permissions to this secret.
     *
     * Mutually exclusive with apiKey and apiSecret properties.
     *
     * @see https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html
     */
    readonly credentialsSecret?: aws_secretsmanager.ISecret;

    /**
     * The Confluent Cloud REST API endpoint.
     *
     * @default 'https://api.confluent.cloud'
     */
    readonly restEndpoint?: string;

    /**
     * Number of partitions for the topic.
     *
     * Partitions enable parallel processing and determine the maximum parallelism
     * for consumers. This value cannot be decreased after topic creation.
     *
     * @default 6
     */
    readonly partitions?: number;

    /**
     * Additional Kafka topic configuration properties.
     *
     * Only editable properties supported by Confluent Cloud REST API can be specified.
     * Use the actual Kafka property names (e.g., "max.message.bytes", "min.insync.replicas").
     *
     * Common editable properties:
     * - delete.retention.ms: Tombstone marker retention (default: 86400000)
     * - max.message.bytes: Maximum record batch size (default: 2097164)
     * - max.compaction.lag.ms: Maximum time before compaction (default: 9223372036854775807)
     * - message.timestamp.type: "CreateTime" or "LogAppendTime" (default: "CreateTime")
     * - min.compaction.lag.ms: Minimum time before compaction (default: 0)
     * - min.insync.replicas: "1" or "2" (default: "2")
     * - retention.bytes: Maximum partition size (default: -1)
     * - segment.bytes: Log segment file size, 52428800-1073741824 (default: 104857600)
     * - segment.ms: Segment roll time, minimum 14400000 (default: 604800000)
     *
     * @default {}
     * @see https://docs.confluent.io/cloud/current/topics/manage.html
     */
    readonly config?: Record<string, string>;

    /**
     * Message retention time in milliseconds.
     *
     * Messages older than this duration will be deleted (when cleanup.policy is 'delete').
     *
     * @default 604800000 (7 days)
     */
    readonly retentionMs?: number;

    /**
     * Topic cleanup policy determining how old messages are handled.
     *
     * - delete: Remove old messages based on retention settings
     * - compact: Keep only the latest value for each key
     * - compact,delete: Combination of both policies
     *
     * @default 'delete'
     */
    readonly cleanupPolicy?: "delete" | "compact" | "compact,delete";
}

/**
 * CDK Construct for creating and managing Kafka topics in Confluent Cloud.
 *
 * This construct uses a Lambda-backed custom resource to interact with the
 * Confluent Cloud REST API v3 for topic lifecycle management (create, update, delete).
 *
 * @example
 *
 * new ConfluentKafkaTopic(this, 'OrdersTopic', {
 *   topicName: 'orders',
 *   clusterId: 'lkc-xxxxx',
 *   environmentId: 'env-xxxxx',
 *   apiKey: 'YOUR_API_KEY',
 *   apiSecret: 'YOUR_API_SECRET',
 *   partitions: 12,
 *   retentionMs: 2592000000, // 30 days
 * });
 *
 * @see https://docs.confluent.io/cloud/current/api.html
 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html
 */
export class ConfluentKafkaTopic extends Construct {
    /**
     * The name of the created Kafka topic.
     */
    public readonly topicName: string;

    /**
     * The ARN of the topic in Confluent format.
     *
     * Format: arn:confluent:kafka:{environmentId}:{clusterId}:topic/{topicName}
     */
    public readonly topicArn: string;

    /**
     * Creates a new Confluent Cloud Kafka topic.
     *
     * @param scope - The scope in which to define this construct
     * @param id - The scoped construct ID
     * @param props - Configuration properties for the Kafka topic
     */
    constructor(scope: Construct, id: string, props: ConfluentKafkaTopicProps) {
        super(scope, id);

        /*
         * Validate that either direct credentials or Secrets Manager secret is provided.
         * Both options cannot be used simultaneously to avoid ambiguity.
         */
        const hasDirectCredentials = props.apiKey && props.apiSecret;
        const hasSecretCredentials = props.credentialsSecret;

        if (!hasDirectCredentials && !hasSecretCredentials) {
            throw new Error("Either apiKey/apiSecret or credentialsSecret must be provided");
        }

        if (hasDirectCredentials && hasSecretCredentials) {
            throw new Error(
                "Cannot specify both apiKey/apiSecret and credentialsSecret. Choose one authentication method.",
            );
        }

        /* Apply default values for optional properties */
        const restEndpoint = props.restEndpoint ?? "https://api.confluent.cloud";
        const partitions = props.partitions ?? 6;
        const retentionMs = props.retentionMs ?? 604800000; // 7 days
        const cleanupPolicy = props.cleanupPolicy ?? "delete";

        /*
         * Merge default configuration with user-provided config.
         * User-provided config takes precedence over defaults.
         */
        const config = {
            "retention.ms": retentionMs.toString(),
            "cleanup.policy": cleanupPolicy,
            ...props.config,
        };

        /*
         * Create a dedicated log group for the Lambda function with automatic cleanup.
         * Logs are retained for one week to support debugging while minimizing storage costs.
         *
         * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_logs.LogGroup.html
         */
        const logGroup = new aws_logs.LogGroup(this, "HandlerLogGroup", {
            retention: aws_logs.RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        /*
         * Lambda function that handles custom resource lifecycle events.
         * This function calls the Confluent Cloud REST API to create, update, and delete topics.
         *
         * Uses ARM64 architecture for better price-performance ratio.
         * Timeout is set to 5 minutes to handle potential API rate limiting and retries.
         *
         * Environment variables pass either direct credentials or the secret ARN.
         * When using Secrets Manager, the function retrieves credentials at runtime.
         *
         * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Function.html
         */
        const handler = new aws_lambda.Function(this, "Handler", {
            runtime: aws_lambda.Runtime.NODEJS_22_X,
            architecture: aws_lambda.Architecture.ARM_64,
            handler: "index.handler",
            code: aws_lambda.Code.fromAsset(path.join(__dirname, "..", "assets", "confluent-topic-handler.lambda")),
            timeout: Duration.minutes(5),
            logGroup,
            environment: {
                ...(props.credentialsSecret && { CREDENTIALS_SECRET_ARN: props.credentialsSecret.secretArn }),
            },
        });

        /*
         * Grant Lambda function permission to read the Secrets Manager secret.
         * This allows the function to retrieve Confluent Cloud credentials at runtime.
         */
        if (props.credentialsSecret) {
            props.credentialsSecret.grantRead(handler);
        }

        /*
         * Create a dedicated log group for the provider framework with automatic cleanup.
         * Logs are retained for one week to support debugging while minimizing storage costs.
         */
        const providerLogGroup = new aws_logs.LogGroup(this, "ProviderLogGroup", {
            retention: aws_logs.RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        /*
         * Custom resource provider framework that manages the Lambda invocation.
         * Handles CloudFormation custom resource protocol and error handling.
         *
         * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.Provider.html
         */
        const provider = new custom_resources.Provider(this, "Provider", {
            onEventHandler: handler,
            logGroup: providerLogGroup,
        });

        /*
         * CloudFormation custom resource that represents the Confluent Cloud topic.
         * Properties are passed to the Lambda handler for API calls.
         *
         * When using Secrets Manager, credentials are not passed as properties.
         * Instead, the Lambda function retrieves them from the secret ARN in environment variables.
         *
         * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.CustomResource.html
         */
        const resource = new CustomResource(this, "Resource", {
            serviceToken: provider.serviceToken,
            properties: {
                TopicName: props.topicName,
                ClusterId: props.clusterId,
                EnvironmentId: props.environmentId,
                ...(hasDirectCredentials && {
                    ApiKey: props.apiKey,
                    ApiSecret: props.apiSecret,
                }),
                RestEndpoint: restEndpoint,
                Partitions: partitions,
                Config: config,
            },
        });

        this.topicName = props.topicName;
        this.topicArn = resource.getAttString("TopicArn");
    }
}
