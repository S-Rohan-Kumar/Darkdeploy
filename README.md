# DarkDeploy

DarkDeploy is a production-oriented feature flagging and experimentation platform built for teams shipping safer releases, running A/B tests, and adapting product behavior in real time. The project combines a secure backend, an admin dashboard, a reusable evaluation engine, and a Node SDK that can react to live configuration changes via Server-Sent Events (SSE).

## Why DarkDeploy

Modern product teams need a way to:

- roll out features gradually with targeted rules and percentage-based rollout controls
- run experiments with weighted variants and measurable conversion outcomes
- update configuration in real time without redeploying application code
- manage environment-scoped settings for development, staging, and production
- support AI-powered feature flags with model-specific runtime configuration

DarkDeploy brings all of that into a single monorepo designed for experimentation and rapid iteration.

## Core capabilities

- Feature flags with:
  - boolean enable/disable gating
  - rule-based targeting using attributes such as plan, role, or country
  - rollout percentages with deterministic bucketing
  - AI configuration payloads for model-driven experiences
- A/B experimentation with:
  - weighted variants
  - deterministic assignment by user/context
  - exposure and conversion event tracking
  - statistical result summaries for experiment analysis
- Real-time delivery with SSE streams for instant flag and experiment updates
- Environment isolation and API-key based SDK access
- Audit logging for configuration changes
- Node SDK with local caching, evaluation helpers, and automatic reconnect handling

## System overview

DarkDeploy is structured as a monorepo with four main packages:

- `packages/server` — Express API, Prisma data layer, authentication, SSE stream, experiment tracking
- `packages/dashboard` — React + Vite admin UI for managing flags, experiments, and environments
- `packages/core` — shared evaluation logic for rules, bucketing, experiments, and stats
- `packages/sdk-node` — Node SDK used by apps to evaluate flags and fetch live updates

## Repository structure

```text
DarkDeploy/
├── package.json
├── package-lock.json
├── README.md
├── examples/
│   └── store-demo.ts
├── packages/
│   ├── core/
│   │   ├── src/
│   │   └── package.json
│   ├── dashboard/
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── sdk-node/
│   │   ├── src/
│   │   └── package.json
│   └── server/
│       ├── prisma/
│       ├── src/
│       └── package.json
└── tsconfig.base.json
```

## Tech stack

- Node.js 18+
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- React + Vite
- SSE for real-time updates
- JWT-based admin auth
- API-key-based SDK auth

## Getting started

### Prerequisites

Before running DarkDeploy, ensure you have:

- Node.js 18 or newer
- npm
- PostgreSQL database instance

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file inside `packages/server`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/darkdeploy"
JWT_SECRET="replace-with-a-strong-secret"
PORT=4000
```

If you are using a different database URL format or host, adjust the Prisma connection string accordingly.

### 3) Initialize the database

From the repository root:

```bash
npx prisma migrate dev --schema=packages/server/prisma/schema.prisma
npm run db:seed --workspace @darkdeploy/server
```

The seed script creates:

- an admin user with email `admin@darkdeploy.io`
- default password: `admin123456`
- a development environment with a generated API key
- a sample flag for demo configurations

### 4) Start the backend

```bash
npm run dev:server
```

This starts the Express API on:

- http://localhost:4000
- SSE stream: http://localhost:4000/api/stream

### 5) Start the dashboard

In a second terminal:

```bash
npm run dev:dashboard
```

This serves the admin dashboard at:

- http://localhost:3000

### 6) Run the demo

The repo includes a Node.js showcase that demonstrates flag evaluation and experiment tracking:

```bash
npm run demo:store
```

This script uses the Node SDK to evaluate live feature flags and assign experiment variants against mock customer profiles.

## Available scripts

From the project root:

```bash
npm run dev:server
npm run dev:dashboard
npm run build
npm run test
npm run lint
```

Package-level scripts are also available through the workspace setup, including Prisma migrations and database generation for the server.

## Application behavior

### Feature flags

Flags can be created and managed in the dashboard, and each flag may define:

- a key and friendly name
- environment scope
- default value
- rollout percentage
- targeting rules based on user attributes
- optional AI configuration payloads

The evaluation engine applies rules first, then rollout logic, then default behavior when no rule matches.

### Experimentation engine

Experiments support:

- multiple weighted variants
- deterministic assignment using a hash of the user/context identifier
- exposure and conversion event recording
- result aggregation and conversion-rate comparison across variants

### Real-time updates

When flags or experiments change, the backend broadcasts SSE events to connected SDK clients. This allows application code to update in memory immediately without polling or manual refreshes.

## Security model

DarkDeploy uses a layered approach:

- admin authentication via JWT for dashboard users
- environment API keys for SDK access
- environment-scoped data separation
- Prisma-backed persistence for audit logs and configuration changes

For production deployment, it is strongly recommended to replace default secrets and configure secure environment variables and database credentials.

## Suggested production hardening

Before deploying to production, consider:

- using a secure secret management solution for `JWT_SECRET`
- configuring a strong PostgreSQL connection pool and backup strategy
- limiting or rotating API keys per environment
- enabling encryption in transit and at rest
- adding robustness around rate limiting, request validation, and monitoring

## License

This project is provided as a source repository for development and evaluation. Add a formal license before production deployment if you intend to distribute or commercialize the code.

## Quick start summary

```bash
npm install
# create packages/server/.env
npx prisma migrate dev --schema=packages/server/prisma/schema.prisma
npm run db:seed --workspace @darkdeploy/server
npm run dev:server
npm run dev:dashboard
```

Then open:

- Dashboard: http://localhost:3000
- API: http://localhost:4000
- Demo: `npm run demo:store`

This project is designed to provide a complete, modern foundation for feature flags, experiments, and real-time configuration delivery in a single codebase.
