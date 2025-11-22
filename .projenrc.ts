import { AwsCdkConstructLibraryProject } from "@nikovirtala/projen-constructs";

const project = new AwsCdkConstructLibraryProject({
    author: "Niko Virtala",
    authorAddress: "niko.virtala@hey.com",
    cdkVersion: "2.227.0",
    defaultReleaseBranch: "main",
    devDeps: ["@nikovirtala/projen-constructs", "@types/aws-lambda", "@types/node"],
    bundledDeps: ["@aws-sdk/client-secrets-manager"],
    jsiiVersion: "~5.9.0",
    name: "cdk-confluent-cloud-kafka-topic",
    projenrcTs: true,
    repositoryUrl: "https://github.com/niko.virtala/cdk-confluent-cloud-kafka-topic.git",

    // deps: [],                /* Runtime dependencies of this module. */
    // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
    // packageName: undefined,  /* The "name" in package.json. */
});

/*
 * Add task to generate topic configuration types from Confluent Cloud documentation.
 * This task runs before compilation to ensure types are always up-to-date.
 */
const generateTypesTask = project.addTask("generate:types", {
    description: "Generate TypeScript types from Confluent Cloud documentation",
    exec: "tsx scripts/generate-topic-config-types.ts",
});

/* Run type generation before compilation */
project.preCompileTask.spawn(generateTypesTask);

/* Add generated documentation to gitignore */
project.gitignore.addPatterns("/docs/topic-config-reference.md");

project.synth();
