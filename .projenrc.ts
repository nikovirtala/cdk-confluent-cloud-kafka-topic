import { AwsCdkConstructLibraryProject } from "@nikovirtala/projen-constructs";

const project = new AwsCdkConstructLibraryProject({
    author: "Niko Virtala",
    authorAddress: "niko.virtala@hey.com",
    cdkVersion: "2.227.0",
    defaultReleaseBranch: "main",
    devDeps: ["@nikovirtala/projen-constructs"],
    jsiiVersion: "~5.9.0",
    name: "cdk-confluent-cloud-kafka-topic",
    projenrcTs: true,
    repositoryUrl: "https://github.com/niko.virtala/cdk-confluent-cloud-kafka-topic.git",

    // deps: [],                /* Runtime dependencies of this module. */
    // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
    // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
