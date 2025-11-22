# CDK Confluent Cloud Kafka topic

AWS CDK construct for managing Kafka topics in Confluent Cloud.

## Installation

```bash
npm install cdk-confluent-cloud-kafka-topic
```

## Usage

### Basic example

```typescript
import { aws_secretsmanager } from 'aws-cdk-lib';
import { ConfluentKafkaTopic } from 'cdk-confluent-cloud-kafka-topic';

const credentials = aws_secretsmanager.Secret.fromSecretNameV2(
  this,
  'ConfluentCredentials',
  'confluent/credentials',
);

new ConfluentKafkaTopic(this, 'OrdersTopic', {
  topicName: 'orders',
  clusterId: 'lkc-xxxxx',
  environmentId: 'env-xxxxx',
  credentialsSecret: credentials,
});
```

### Custom configuration

```typescript
new ConfluentKafkaTopic(this, 'EventsTopic', {
  topicName: 'events',
  clusterId: 'lkc-xxxxx',
  environmentId: 'env-xxxxx',
  credentialsSecret: credentials,
  partitions: 12,
  retentionMs: 2592000000, // 30 days
  cleanupPolicy: 'delete',
  config: {
    'max.message.bytes': '10485760',
    'min.insync.replicas': '2',
  },
});
```

### Compacted topic

```typescript
new ConfluentKafkaTopic(this, 'StateTopic', {
  topicName: 'user-state',
  clusterId: 'lkc-xxxxx',
  environmentId: 'env-xxxxx',
  credentialsSecret: credentials,
  cleanupPolicy: 'compact',
  config: {
    'min.compaction.lag.ms': '0',
    'delete.retention.ms': '86400000',
  },
});
```

## Credentials

Store Confluent Cloud credentials in AWS Secrets Manager as JSON:

```json
{
  "apiKey": "YOUR_CONFLUENT_API_KEY",
  "apiSecret": "YOUR_CONFLUENT_API_SECRET"
}
```

The construct grants the Lambda function read access to the secret.

## Configuration reference

See [topic configuration reference](docs/topic-config-reference.md) for all available topic properties.

The reference is auto-generated from Confluent Cloud documentation on every build.

## API documentation

See [API.md](API.md) for complete API reference.
