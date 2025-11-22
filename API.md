# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ConfluentKafkaTopic <a name="ConfluentKafkaTopic" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic"></a>

CDK Construct for creating and managing Kafka topics in Confluent Cloud.

This construct uses a Lambda-backed custom resource to interact with the
Confluent Cloud REST API v3 for topic lifecycle management (create, update, delete).

> [https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html)

*Example*

```typescript
new ConfluentKafkaTopic(this, 'OrdersTopic', {
  topicName: 'orders',
  clusterId: 'lkc-xxxxx',
  environmentId: 'env-xxxxx',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  partitions: 12,
  retentionMs: 2592000000, // 30 days
});
```


#### Initializers <a name="Initializers" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer"></a>

```typescript
import { ConfluentKafkaTopic } from 'cdk-confluent-cloud-kafka-topic'

new ConfluentKafkaTopic(scope: Construct, id: string, props: ConfluentKafkaTopicProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | - The scope in which to define this construct. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer.parameter.id">id</a></code> | <code>string</code> | - The scoped construct ID. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps">ConfluentKafkaTopicProps</a></code> | - Configuration properties for the Kafka topic. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The scope in which to define this construct.

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer.parameter.id"></a>

- *Type:* string

The scoped construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps">ConfluentKafkaTopicProps</a>

Configuration properties for the Kafka topic.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.isConstruct"></a>

```typescript
import { ConfluentKafkaTopic } from 'cdk-confluent-cloud-kafka-topic'

ConfluentKafkaTopic.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.property.topicArn">topicArn</a></code> | <code>string</code> | The ARN of the topic in Confluent format. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.property.topicName">topicName</a></code> | <code>string</code> | The name of the created Kafka topic. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `topicArn`<sup>Required</sup> <a name="topicArn" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.property.topicArn"></a>

```typescript
public readonly topicArn: string;
```

- *Type:* string

The ARN of the topic in Confluent format.

Format: arn:confluent:kafka:{environmentId}:{clusterId}:topic/{topicName}

---

##### `topicName`<sup>Required</sup> <a name="topicName" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopic.property.topicName"></a>

```typescript
public readonly topicName: string;
```

- *Type:* string

The name of the created Kafka topic.

---


## Structs <a name="Structs" id="Structs"></a>

### ConfluentKafkaTopicProps <a name="ConfluentKafkaTopicProps" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps"></a>

Properties for Confluent Cloud Kafka Topic construct.

This construct creates a Kafka topic in Confluent Cloud using a custom resource
that calls the Confluent Cloud REST API v3.

> [https://docs.confluent.io/cloud/current/api.html](https://docs.confluent.io/cloud/current/api.html)

#### Initializer <a name="Initializer" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.Initializer"></a>

```typescript
import { ConfluentKafkaTopicProps } from 'cdk-confluent-cloud-kafka-topic'

const confluentKafkaTopicProps: ConfluentKafkaTopicProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.clusterId">clusterId</a></code> | <code>string</code> | The Confluent Cloud cluster ID where the topic will be created. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.environmentId">environmentId</a></code> | <code>string</code> | The Confluent Cloud environment ID containing the cluster. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.topicName">topicName</a></code> | <code>string</code> | The name of the Kafka topic to create. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.apiKey">apiKey</a></code> | <code>string</code> | The Confluent Cloud API key for authentication. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.apiSecret">apiSecret</a></code> | <code>string</code> | The Confluent Cloud API secret for authentication. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.cleanupPolicy">cleanupPolicy</a></code> | <code>string</code> | Topic cleanup policy determining how old messages are handled. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.config">config</a></code> | <code>{[ key: string ]: string}</code> | Additional Kafka topic configuration properties. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.credentialsSecret">credentialsSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | AWS Secrets Manager secret containing Confluent Cloud API credentials. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.partitions">partitions</a></code> | <code>number</code> | Number of partitions for the topic. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.restEndpoint">restEndpoint</a></code> | <code>string</code> | The Confluent Cloud REST API endpoint. |
| <code><a href="#cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.retentionMs">retentionMs</a></code> | <code>number</code> | Message retention time in milliseconds. |

---

##### `clusterId`<sup>Required</sup> <a name="clusterId" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.clusterId"></a>

```typescript
public readonly clusterId: string;
```

- *Type:* string

The Confluent Cloud cluster ID where the topic will be created.

Format: lkc-xxxxx

---

##### `environmentId`<sup>Required</sup> <a name="environmentId" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

The Confluent Cloud environment ID containing the cluster.

Format: env-xxxxx

---

##### `topicName`<sup>Required</sup> <a name="topicName" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.topicName"></a>

```typescript
public readonly topicName: string;
```

- *Type:* string

The name of the Kafka topic to create.

Topic names must be unique within a cluster and follow Kafka naming conventions.

---

##### `apiKey`<sup>Optional</sup> <a name="apiKey" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.apiKey"></a>

```typescript
public readonly apiKey: string;
```

- *Type:* string

The Confluent Cloud API key for authentication.

This key must have permissions to create and manage topics in the specified cluster.
Mutually exclusive with credentialsSecret.

> [credentialsSecret for storing credentials securely in Secrets Manager](credentialsSecret for storing credentials securely in Secrets Manager)

---

##### `apiSecret`<sup>Optional</sup> <a name="apiSecret" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.apiSecret"></a>

```typescript
public readonly apiSecret: string;
```

- *Type:* string

The Confluent Cloud API secret for authentication.

This secret corresponds to the API key and must be kept secure.
Mutually exclusive with credentialsSecret.

> [credentialsSecret for storing credentials securely in Secrets Manager](credentialsSecret for storing credentials securely in Secrets Manager)

---

##### `cleanupPolicy`<sup>Optional</sup> <a name="cleanupPolicy" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.cleanupPolicy"></a>

```typescript
public readonly cleanupPolicy: string;
```

- *Type:* string
- *Default:* 'delete'

Topic cleanup policy determining how old messages are handled.

delete: Remove old messages based on retention settings
- compact: Keep only the latest value for each key
- compact,delete: Combination of both policies

---

##### `config`<sup>Optional</sup> <a name="config" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.config"></a>

```typescript
public readonly config: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

Additional Kafka topic configuration properties.

Only editable properties supported by Confluent Cloud REST API can be specified.
Use the actual Kafka property names (e.g., "max.message.bytes", "min.insync.replicas").

Common editable properties:
- delete.retention.ms: Tombstone marker retention (default: 86400000)
- max.message.bytes: Maximum record batch size (default: 2097164)
- max.compaction.lag.ms: Maximum time before compaction (default: 9223372036854775807)
- message.timestamp.type: "CreateTime" or "LogAppendTime" (default: "CreateTime")
- min.compaction.lag.ms: Minimum time before compaction (default: 0)
- min.insync.replicas: "1" or "2" (default: "2")
- retention.bytes: Maximum partition size (default: -1)
- segment.bytes: Log segment file size, 52428800-1073741824 (default: 104857600)
- segment.ms: Segment roll time, minimum 14400000 (default: 604800000)

> [https://docs.confluent.io/cloud/current/topics/manage.html](https://docs.confluent.io/cloud/current/topics/manage.html)

---

##### `credentialsSecret`<sup>Optional</sup> <a name="credentialsSecret" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.credentialsSecret"></a>

```typescript
public readonly credentialsSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

AWS Secrets Manager secret containing Confluent Cloud API credentials.

The secret must be stored as a JSON object with the following structure:

{
  "apiKey": "your-confluent-api-key",
  "apiSecret": "your-confluent-api-secret"
}

The Lambda function will retrieve these credentials at runtime using the AWS SDK.
The construct automatically grants the Lambda function read permissions to this secret.

Mutually exclusive with apiKey and apiSecret properties.

> [https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

---

##### `partitions`<sup>Optional</sup> <a name="partitions" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.partitions"></a>

```typescript
public readonly partitions: number;
```

- *Type:* number
- *Default:* 6

Number of partitions for the topic.

Partitions enable parallel processing and determine the maximum parallelism
for consumers. This value cannot be decreased after topic creation.

---

##### `restEndpoint`<sup>Optional</sup> <a name="restEndpoint" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.restEndpoint"></a>

```typescript
public readonly restEndpoint: string;
```

- *Type:* string
- *Default:* 'https://api.confluent.cloud'

The Confluent Cloud REST API endpoint.

---

##### `retentionMs`<sup>Optional</sup> <a name="retentionMs" id="cdk-confluent-cloud-kafka-topic.ConfluentKafkaTopicProps.property.retentionMs"></a>

```typescript
public readonly retentionMs: number;
```

- *Type:* number
- *Default:* 604800000 (7 days)

Message retention time in milliseconds.

Messages older than this duration will be deleted (when cleanup.policy is 'delete').

---



