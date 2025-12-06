# Technology Stack

## ⚠️ Projen-Managed Project

This project is **entirely managed by projen**. Key implications:

- **DO NOT** manually edit generated files (package.json, tsconfig.json, etc.)
- **ALL** configuration changes must be made in `.projenrc.ts`
- After modifying `.projenrc.ts`, run `npx projen` to regenerate files
- Dependencies, scripts, and tooling are defined in `.projenrc.ts`, not package.json

## Build System

- **Projen**: Project configuration and task management (`.projenrc.ts`)
- **JSII**: Multi-language CDK construct compilation
- **pnpm**: Package manager
- **TypeScript**: Primary language (v5.9.3)
- **esbuild**: Lambda function bundling

## Core Dependencies

- **aws-cdk-lib**: ^2.227.0 (peer dependency)
- **constructs**: ^10.4.3 (peer dependency)
- **@aws-sdk/client-secrets-manager**: Bundled for Lambda runtime

## Development Tools

- **Vitest**: Testing framework with coverage (v8 provider)
- **Biome**: Code formatting and linting
- **tsx**: TypeScript execution for scripts
- **jsii-docgen**: API documentation generation

## Runtime

- **Node.js**: >= 24.11.1
- **Lambda Runtime**: nodejs22.x on ARM64 architecture

## Common Commands

### Build & Compile
```bash
pnpm build              # Full build (compile + bundle + package)
pnpm compile            # TypeScript compilation only
pnpm bundle             # Bundle Lambda functions
```

### Testing
```bash
pnpm test               # Run tests with coverage
pnpm test:watch         # Run tests in watch mode
pnpm test:update        # Update test snapshots
```

### Code Quality
```bash
pnpm biome              # Format and lint code
```

### Type Generation
```bash
pnpm generate:types     # Generate topic config types from Confluent docs
```

### Documentation
```bash
pnpm docgen             # Generate API.md documentation
```

### Package Management
```bash
pnpm package            # Create distributable packages
pnpm package-all        # Package for all JSII targets
```

## Pre-compile Hook

The `generate:types` task runs automatically before compilation to ensure topic configuration types are up-to-date from Confluent Cloud documentation.
