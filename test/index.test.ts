import { App, aws_secretsmanager, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { ConfluentKafkaTopic } from "../src/index";

describe("ConfluentKafkaTopic", () => {
    it("should create a custom resource with default properties", () => {
        const app = new App();
        const stack = new Stack(app, "TestStack");

        new ConfluentKafkaTopic(stack, "TestTopic", {
            topicName: "test-topic",
            clusterId: "lkc-12345",
            environmentId: "env-12345",
            apiKey: "test-key",
            apiSecret: "test-secret",
        });

        const template = Template.fromStack(stack);

        /*
         * Verify Lambda functions are created:
         * - 1 handler function
         * - 1 provider framework function
         */
        template.resourceCountIs("AWS::Lambda::Function", 2);

        // Verify custom resource is created with correct service token
        template.hasResourceProperties("AWS::CloudFormation::CustomResource", {
            TopicName: "test-topic",
            ClusterId: "lkc-12345",
            EnvironmentId: "env-12345",
            Partitions: 6,
            RestEndpoint: "https://api.confluent.cloud",
        });
    });

    it("should create a custom resource with custom configuration", () => {
        const app = new App();
        const stack = new Stack(app, "TestStack");

        new ConfluentKafkaTopic(stack, "TestTopic", {
            topicName: "custom-topic",
            clusterId: "lkc-67890",
            environmentId: "env-67890",
            apiKey: "custom-key",
            apiSecret: "custom-secret",
            partitions: 12,
            retentionMs: 86400000,
            cleanupPolicy: "compact",
            config: {
                "compression.type": "gzip",
                "max.message.bytes": "1048576",
            },
        });

        const template = Template.fromStack(stack);

        template.hasResourceProperties("AWS::CloudFormation::CustomResource", {
            TopicName: "custom-topic",
            Partitions: 12,
            Config: Match.objectLike({
                "retention.ms": "86400000",
                "cleanup.policy": "compact",
                "compression.type": "gzip",
                "max.message.bytes": "1048576",
            }),
        });
    });

    it("should use custom REST endpoint", () => {
        const app = new App();
        const stack = new Stack(app, "TestStack");

        new ConfluentKafkaTopic(stack, "TestTopic", {
            topicName: "test-topic",
            clusterId: "lkc-12345",
            environmentId: "env-12345",
            apiKey: "test-key",
            apiSecret: "test-secret",
            restEndpoint: "https://custom.confluent.cloud",
        });

        const template = Template.fromStack(stack);

        template.hasResourceProperties("AWS::CloudFormation::CustomResource", {
            RestEndpoint: "https://custom.confluent.cloud",
        });
    });

    it("should use Secrets Manager for credentials", () => {
        const app = new App();
        const stack = new Stack(app, "TestStack");

        const secret = aws_secretsmanager.Secret.fromSecretNameV2(stack, "ConfluentSecret", "confluent/credentials");

        new ConfluentKafkaTopic(stack, "TestTopic", {
            topicName: "test-topic",
            clusterId: "lkc-12345",
            environmentId: "env-12345",
            credentialsSecret: secret,
        });

        const template = Template.fromStack(stack);

        // Verify Lambda has environment variable for secret ARN
        template.hasResourceProperties("AWS::Lambda::Function", {
            Environment: {
                Variables: {
                    CREDENTIALS_SECRET_ARN: Match.anyValue(),
                },
            },
        });

        // Verify Lambda has permission to read the secret
        template.hasResourceProperties("AWS::IAM::Policy", {
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({
                        Action: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
                        Effect: "Allow",
                    }),
                ]),
            },
        });

        // Verify custom resource does not have credentials in properties
        template.hasResourceProperties("AWS::CloudFormation::CustomResource", {
            TopicName: "test-topic",
            ApiKey: Match.absent(),
            ApiSecret: Match.absent(),
        });
    });
});
