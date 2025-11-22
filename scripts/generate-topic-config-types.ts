#!/usr/bin/env node

/**
 * Script to generate TypeScript types for Confluent Cloud topic configuration.
 *
 * This script scrapes the official Confluent Cloud documentation to extract
 * topic configuration properties and generates type-safe TypeScript interfaces.
 *
 * The generated types include:
 * - Property names with proper TypeScript formatting
 * - JSDoc comments with descriptions, defaults, and constraints
 * - String literal types for enum-like values
 * - Links to official documentation
 *
 * @see https://docs.confluent.io/cloud/current/topics/manage.html
 */

import * as fs from "node:fs";
import * as https from "node:https";
import * as path from "node:path";

/* URL of the Confluent Cloud topic configuration documentation */
const DOCS_URL = "https://docs.confluent.io/cloud/current/topics/manage.html";

/* Output file path for generated reference documentation */
const OUTPUT_FILE = path.join(__dirname, "..", "docs", "topic-config-reference.md");

/**
 * Topic configuration property metadata extracted from documentation.
 */
interface PropertyMetadata {
    /** Property name (e.g., "delete.retention.ms") */
    name: string;

    /** Human-readable description */
    description: string;

    /** Default value */
    default: string;

    /** Whether the property is editable after topic creation */
    editable: boolean;

    /** Whether the property is supported by Kafka REST API and Terraform */
    apiSupported: boolean;

    /** Additional constraints or notes */
    constraints?: string;
}

/**
 * Fetches the Confluent Cloud documentation page.
 *
 * @returns HTML content of the documentation page
 */
async function fetchDocumentation(): Promise<string> {
    return new Promise((resolve, reject) => {
        https
            .get(DOCS_URL, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    resolve(data);
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}

/**
 * Extracts property metadata from HTML content.
 *
 * Parses the documentation HTML to extract configuration properties,
 * their descriptions, defaults, and editability status.
 *
 * @param html - HTML content from documentation page
 * @returns Array of property metadata
 */
function extractProperties(html: string): PropertyMetadata[] {
    const properties: PropertyMetadata[] = [];

    /* Match sections with property names as IDs */
    const sectionRegex = /<section id=["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/section>/g;
    let match: RegExpExecArray | null;

    while ((match = sectionRegex.exec(html)) !== null) {
        const propertyName = match[1];
        const sectionContent = match[2];

        /* Skip non-property sections */
        if (
            propertyName === "configuration-reference-for-topics-in-ccloud" ||
            !propertyName.includes("-")
        ) {
            continue;
        }

        /* Convert kebab-case to dot notation (e.g., "cleanup-policy" -> "cleanup.policy") */
        const dotNotationName = propertyName.replace(/-/g, ".");

        /* Extract description from first paragraph */
        const descMatch = /<p[^>]*>(.*?)<\/p>/s.exec(sectionContent);
        const description = descMatch
            ? descMatch[1]
                  .replace(/<[^>]+>/g, "")
                  .replace(/\s+/g, " ")
                  .trim()
            : "";

        /* Extract default value */
        const defaultMatch = /<li[^>]*><p[^>]*>Default:\s*([^<]+)<\/p><\/li>/i.exec(sectionContent);
        const defaultValue = defaultMatch ? defaultMatch[1].trim() : "";

        /* Extract editability status */
        const editableMatch = /<li[^>]*><p[^>]*>Editable:\s*([^<]+)<\/p><\/li>/i.exec(
            sectionContent,
        );
        const editable = editableMatch ? editableMatch[1].trim().toLowerCase() === "yes" : false;

        /* Extract API support status */
        const apiMatch =
            /<li[^>]*><p[^>]*>Kafka REST API and Terraform Provider Support:\s*([^<]+)<\/p><\/li>/i.exec(
                sectionContent,
            );
        const apiSupported = apiMatch ? apiMatch[1].trim().toLowerCase() === "yes" : false;

        /* Extract constraints (minimum, maximum values) */
        const constraintsMatch = /Minimum[^<]*|Maximum[^<]*/gi.exec(description);
        const constraints = constraintsMatch ? constraintsMatch[0] : undefined;

        /* Only include editable properties supported by the API */
        if (editable && apiSupported) {
            properties.push({
                name: dotNotationName,
                description,
                default: defaultValue,
                editable,
                apiSupported,
                constraints,
            });
        }
    }

    return properties;
}



/**
 * Generates markdown documentation from property metadata.
 *
 * @param properties - Array of property metadata
 * @returns Markdown documentation
 */
function generateMarkdownDocumentation(properties: PropertyMetadata[]): string {
    const lines: string[] = [
        "# Confluent Cloud topic configuration reference",
        "",
        "This document lists all editable topic configuration properties supported by the Confluent Cloud REST API.",
        "",
        "**Auto-generated from Confluent Cloud documentation**",
        "",
        "Do not edit manually - run `npm run generate:types` to regenerate.",
        "",
        "**Source:** https://docs.confluent.io/cloud/current/topics/manage.html",
        "",
        "## Available properties",
        "",
    ];

    /* Sort properties alphabetically */
    const sortedProperties = [...properties].sort((a, b) => a.name.localeCompare(b.name));

    for (const property of sortedProperties) {
        lines.push(`### \`${property.name}\``);
        lines.push("");
        lines.push(property.description);
        lines.push("");

        if (property.constraints) {
            lines.push(`**Constraints:** ${property.constraints}`);
            lines.push("");
        }

        lines.push(`**Default:** ${property.default}`);
        lines.push("");

        /* Add type information for special cases */
        if (property.name === "min.insync.replicas") {
            lines.push("**Valid values:** `1` or `2`");
            lines.push("");
        }

        if (property.name === "message.timestamp.type") {
            lines.push("**Valid values:** `CreateTime` or `LogAppendTime`");
            lines.push("");
        }

        lines.push("---");
        lines.push("");
    }

    return lines.join("\n");
}

/**
 * Main execution function.
 *
 * Fetches documentation, extracts properties, generates TypeScript types,
 * and writes the output file.
 */
async function main(): Promise<void> {
    console.log("Fetching Confluent Cloud documentation...");
    const html = await fetchDocumentation();

    console.log("Extracting property metadata...");
    const properties = extractProperties(html);

    console.log(`Found ${properties.length} editable properties supported by REST API`);

    console.log("Generating markdown documentation...");
    const markdownDoc = generateMarkdownDocumentation(properties);

    /* Ensure output directory exists */
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Writing documentation to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, markdownDoc, "utf-8");

    console.log("✓ Documentation generation complete");
}

main().catch((error) => {
    console.error("Error generating types:", error);
    process.exit(1);
});
