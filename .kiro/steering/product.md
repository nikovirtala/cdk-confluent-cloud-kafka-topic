# Product Overview

AWS CDK construct library for managing Kafka topics in Confluent Cloud.

## Purpose

Provides infrastructure-as-code for creating and managing Kafka topics in Confluent Cloud using AWS CDK. The construct uses a Lambda-backed custom resource to interact with the Confluent Cloud REST API v3.

## Key Features

- Declarative topic management through CDK
- Support for topic configuration (partitions, retention, cleanup policies)
- Secure credential management via AWS Secrets Manager or direct API keys
- Automatic lifecycle management (create, update, delete)
- CloudFormation integration via custom resources

## Target Users

Developers and DevOps engineers building event-driven architectures on AWS that use Confluent Cloud for Kafka messaging.
