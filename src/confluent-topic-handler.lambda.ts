import * as https from "node:https";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import type { CloudFormationCustomResourceEvent, CloudFormationCustomResourceResponse } from "aws-lambda";

/**
 * Properties passed from the CloudFormation custom resource.
 */
interface ResourceProperties {
    /** The name of the Kafka topic */
    TopicName: string;

    /** The Confluent Cloud cluster ID (format: lkc-xxxxx) */
    ClusterId: string;

    /** The Confluent Cloud environment ID (format: env-xxxxx) */
    EnvironmentId: string;

    /** Confluent Cloud API key for authentication (optional if using Secrets Manager) */
    ApiKey?: string;

    /** Confluent Cloud API secret for authentication (optional if using Secrets Manager) */
    ApiSecret?: string;

    /** Confluent Cloud REST API endpoint */
    RestEndpoint: string;

    /** Number of partitions for the topic */
    Partitions: number;

    /** Kafka topic configuration properties */
    Config: Record<string, string>;
}

/**
 * Confluent Cloud credentials structure stored in Secrets Manager.
 */
interface ConfluentCredentials {
    /** Confluent Cloud API key */
    apiKey: string;

    /** Confluent Cloud API secret */
    apiSecret: string;
}

/* Secrets Manager client for retrieving credentials */
const secretsManager = new SecretsManagerClient({});

/**
 * Retrieves Confluent Cloud credentials from AWS Secrets Manager.
 *
 * The secret must contain a JSON object with apiKey and apiSecret properties.
 *
 * @param secretArn - ARN of the Secrets Manager secret
 * @returns Confluent Cloud credentials
 * @throws Error if secret cannot be retrieved or parsed
 *
 * @see https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets.html
 */
async function getCredentialsFromSecret(secretArn: string): Promise<ConfluentCredentials> {
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const response = await secretsManager.send(command);

    if (!response.SecretString) {
        throw new Error(`Secret ${secretArn} does not contain a string value`);
    }

    const credentials = JSON.parse(response.SecretString) as ConfluentCredentials;

    if (!credentials.apiKey || !credentials.apiSecret) {
        throw new Error(`Secret ${secretArn} must contain apiKey and apiSecret properties`);
    }

    return credentials;
}

/**
 * Lambda handler for Confluent Cloud Kafka topic custom resource.
 *
 * Handles CloudFormation custom resource lifecycle events (Create, Update, Delete)
 * by calling the Confluent Cloud REST API v3.
 *
 * @param event - CloudFormation custom resource event
 * @returns CloudFormation custom resource response
 *
 * @see https://docs.confluent.io/cloud/current/api.html
 */
export async function handler(event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> {
    console.log("Event:", JSON.stringify(event, null, 2));

    const props = event.ResourceProperties as unknown as ResourceProperties;
    const { TopicName, ClusterId, EnvironmentId, RestEndpoint, Partitions, Config } = props;

    const requestType = event.RequestType;

    /*
     * Physical resource ID uniquely identifies this topic in CloudFormation.
     * Format includes cluster ID to ensure uniqueness across clusters.
     */
    const physicalResourceId = `confluent-topic-${ClusterId}-${TopicName}`;

    try {
        /*
         * Retrieve credentials either from resource properties or Secrets Manager.
         * The CREDENTIALS_SECRET_ARN environment variable is set when using Secrets Manager.
         */
        let apiKey: string;
        let apiSecret: string;

        const secretArn = process.env.CREDENTIALS_SECRET_ARN;
        if (secretArn) {
            const credentials = await getCredentialsFromSecret(secretArn);
            apiKey = credentials.apiKey;
            apiSecret = credentials.apiSecret;
        } else if (props.ApiKey && props.ApiSecret) {
            apiKey = props.ApiKey;
            apiSecret = props.ApiSecret;
        } else {
            throw new Error("No credentials provided. Either ApiKey/ApiSecret or CREDENTIALS_SECRET_ARN must be set.");
        }
        if (requestType === "Create") {
            await createTopic({
                topicName: TopicName,
                clusterId: ClusterId,
                environmentId: EnvironmentId,
                apiKey,
                apiSecret,
                restEndpoint: RestEndpoint,
                partitions: Partitions,
                config: Config,
            });

            return {
                Status: "SUCCESS",
                PhysicalResourceId: physicalResourceId,
                StackId: event.StackId,
                RequestId: event.RequestId,
                LogicalResourceId: event.LogicalResourceId,
                Data: {
                    TopicName,
                    TopicArn: `arn:confluent:kafka:${EnvironmentId}:${ClusterId}:topic/${TopicName}`,
                },
            };
        }

        if (requestType === "Update") {
            const oldProps = event.OldResourceProperties as unknown as ResourceProperties;
            const oldTopicName = oldProps?.TopicName;

            /* If topic name changed, delete old and create new */
            if (oldTopicName && oldTopicName !== TopicName) {
                await deleteTopic({
                    topicName: oldTopicName,
                    clusterId: ClusterId,
                    environmentId: EnvironmentId,
                    apiKey,
                    apiSecret,
                    restEndpoint: RestEndpoint,
                });

                await createTopic({
                    topicName: TopicName,
                    clusterId: ClusterId,
                    environmentId: EnvironmentId,
                    apiKey,
                    apiSecret,
                    restEndpoint: RestEndpoint,
                    partitions: Partitions,
                    config: Config,
                });
            } else {
                /* Update topic configuration */
                await updateTopic({
                    topicName: TopicName,
                    clusterId: ClusterId,
                    environmentId: EnvironmentId,
                    apiKey,
                    apiSecret,
                    restEndpoint: RestEndpoint,
                    config: Config,
                });
            }

            return {
                Status: "SUCCESS",
                PhysicalResourceId: physicalResourceId,
                StackId: event.StackId,
                RequestId: event.RequestId,
                LogicalResourceId: event.LogicalResourceId,
                Data: {
                    TopicName,
                    TopicArn: `arn:confluent:kafka:${EnvironmentId}:${ClusterId}:topic/${TopicName}`,
                },
            };
        }

        if (requestType === "Delete") {
            await deleteTopic({
                topicName: TopicName,
                clusterId: ClusterId,
                environmentId: EnvironmentId,
                apiKey,
                apiSecret,
                restEndpoint: RestEndpoint,
            });

            return {
                Status: "SUCCESS",
                PhysicalResourceId: physicalResourceId,
                StackId: event.StackId,
                RequestId: event.RequestId,
                LogicalResourceId: event.LogicalResourceId,
            };
        }

        throw new Error(`Unknown request type: ${requestType}`);
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Parameters for creating a Kafka topic.
 */
interface CreateTopicParams {
    /** The name of the topic to create */
    topicName: string;

    /** The Confluent Cloud cluster ID */
    clusterId: string;

    /** The Confluent Cloud environment ID */
    environmentId: string;

    /** API key for authentication */
    apiKey: string;

    /** API secret for authentication */
    apiSecret: string;

    /** REST API endpoint */
    restEndpoint: string;

    /** Number of partitions */
    partitions: number;

    /** Topic configuration properties */
    config: Record<string, string>;
}

/**
 * Creates a new Kafka topic in Confluent Cloud.
 *
 * Calls the Confluent Cloud REST API v3 to create a topic with the specified
 * configuration. The partition count cannot be decreased after creation.
 *
 * @param params - Topic creation parameters
 * @returns API response from Confluent Cloud
 *
 * @see https://docs.confluent.io/cloud/current/api.html#tag/Topic-(v3)/operation/createKafkaTopic
 */
async function createTopic(params: CreateTopicParams): Promise<unknown> {
    const { topicName, clusterId, apiKey, apiSecret, restEndpoint, partitions, config } = params;

    const url = `${restEndpoint}/kafka/v3/clusters/${clusterId}/topics`;

    const configEntries = Object.entries(config).map(([name, value]) => ({
        name,
        value,
    }));

    const body = JSON.stringify({
        topic_name: topicName,
        partitions_count: partitions,
        configs: configEntries,
    });

    const response = await makeRequest(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        body,
    });

    console.log("Topic created:", response);
    return response;
}

/**
 * Parameters for updating a Kafka topic configuration.
 */
interface UpdateTopicParams {
    /** The name of the topic to update */
    topicName: string;

    /** The Confluent Cloud cluster ID */
    clusterId: string;

    /** The Confluent Cloud environment ID */
    environmentId: string;

    /** API key for authentication */
    apiKey: string;

    /** API secret for authentication */
    apiSecret: string;

    /** REST API endpoint */
    restEndpoint: string;

    /** Topic configuration properties to update */
    config: Record<string, string>;
}

/**
 * Updates configuration properties for an existing Kafka topic.
 *
 * Iterates through each configuration property and updates it individually
 * via the Confluent Cloud REST API v3. Some properties may not be updatable
 * after topic creation (e.g., partition count).
 *
 * @param params - Topic update parameters
 *
 * @see https://docs.confluent.io/cloud/current/api.html#tag/Configs-(v3)/operation/updateKafkaTopicConfig
 */
async function updateTopic(params: UpdateTopicParams): Promise<void> {
    const { topicName, clusterId, apiKey, apiSecret, restEndpoint, config } = params;

    const configEntries = Object.entries(config).map(([name, value]) => ({
        name,
        value,
    }));

    for (const { name, value } of configEntries) {
        const url = `${restEndpoint}/kafka/v3/clusters/${clusterId}/topics/${topicName}/configs/${name}`;

        const body = JSON.stringify({ value });

        await makeRequest(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
            },
            body,
        });
    }

    console.log("Topic updated");
}

/**
 * Parameters for deleting a Kafka topic.
 */
interface DeleteTopicParams {
    /** The name of the topic to delete */
    topicName: string;

    /** The Confluent Cloud cluster ID */
    clusterId: string;

    /** The Confluent Cloud environment ID */
    environmentId: string;

    /** API key for authentication */
    apiKey: string;

    /** API secret for authentication */
    apiSecret: string;

    /** REST API endpoint */
    restEndpoint: string;
}

/**
 * Deletes a Kafka topic from Confluent Cloud.
 *
 * This operation is irreversible and will delete all messages in the topic.
 * The topic name can be reused after deletion.
 *
 * @param params - Topic deletion parameters
 * @returns API response from Confluent Cloud
 *
 * @see https://docs.confluent.io/cloud/current/api.html#tag/Topic-(v3)/operation/deleteKafkaTopic
 */
async function deleteTopic(params: DeleteTopicParams): Promise<unknown> {
    const { topicName, clusterId, apiKey, apiSecret, restEndpoint } = params;

    const url = `${restEndpoint}/kafka/v3/clusters/${clusterId}/topics/${topicName}`;

    const response = await makeRequest(url, {
        method: "DELETE",
        headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
    });

    console.log("Topic deleted:", response);
    return response;
}

/**
 * HTTP request options for Confluent Cloud API calls.
 */
interface RequestOptions {
    /** HTTP method (GET, POST, PUT, DELETE) */
    method: string;

    /** HTTP headers including authentication */
    headers: Record<string, string>;

    /** Optional request body for POST/PUT requests */
    body?: string;
}

/**
 * Makes an HTTPS request to the Confluent Cloud REST API.
 *
 * Uses Node.js built-in https module to avoid external dependencies.
 * Handles response parsing and error cases based on HTTP status codes.
 *
 * @param url - Full URL for the API endpoint
 * @param options - HTTP request options
 * @returns Parsed JSON response from the API
 * @throws Error if the HTTP status code indicates failure (not 2xx)
 */
function makeRequest(url: string, options: RequestOptions): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);

        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method,
            headers: options.headers || {},
        };

        const req = https.request(reqOptions, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : {});
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on("error", reject);

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}
