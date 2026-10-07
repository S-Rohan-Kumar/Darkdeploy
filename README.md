# DarkDeploy

> **The Modern, High-Performance Feature Flagging, Live A/B Experimentation, and Dynamic AI Configuration Platform.**

[![npm core](https://img.shields.io/npm/v/@darkdeploy/core.svg?label=@darkdeploy/core)](https://www.npmjs.com/package/@darkdeploy/core)
[![npm sdk](https://img.shields.io/npm/v/@darkdeploy/node-sdk.svg?label=@darkdeploy/node-sdk)](https://www.npmjs.com/package/@darkdeploy/node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-26%2F26%20passing-brightgreen.svg)]()

DarkDeploy is an open-source, developer-first alternative to LaunchDarkly, Optimizely, and Statsig. It combines a **sub-microsecond deterministic evaluation engine**, a **real-time Server-Sent Events (SSE) streaming backbone**, an **A/B experimentation framework with frequentist z-test statistical rigor**, and **dynamic AI configuration management** to hot-swap LLM models and prompts without code redeployments.

---

## Live Cloud Endpoints

- **Live Production API**: [`https://darkdeploy-api.onrender.com`](https://darkdeploy-api.onrender.com)
- **API Health Check**: [`https://darkdeploy-api.onrender.com/health`](https://darkdeploy-api.onrender.com/health)
- **SSE Live Stream**: [`https://darkdeploy-api.onrender.com/api/stream`](https://darkdeploy-api.onrender.com/api/stream)
- **npm SDK Package**: [`@darkdeploy/node-sdk`](https://www.npmjs.com/package/@darkdeploy/node-sdk)
- **npm Core Package**: [`@darkdeploy/core`](https://www.npmjs.com/package/@darkdeploy/core)

---

## Keywords

`feature flags`, `feature toggles`, `a/b testing`, `experimentation platform`, `split testing`, `launchdarkly alternative`, `optimizely alternative`, `statsig alternative`, `server sent events`, `sse streaming`, `dynamic llm prompts`, `ai configs`, `prompt management`, `prompt injection`, `two proportion z-test`, `statistical significance`, `p-value calculator`, `deterministic hashing`, `sha-1 bucketing`, `zero latency`, `react dashboard`, `prisma orm`, `neon postgresql`, `node sdk`, `typescript monorepo`.

---

## System Architecture

```mermaid
graph TD
    subgraph Clients ["Application Layer"]
        A[Next.js App / Node Server] -->|npm i @darkdeploy/node-sdk| SDK[DarkDeploy Node SDK]
    end

    subgraph CoreEngine ["In-Memory Zero-Latency Layer"]
        SDK --> Cache[(In-Memory Cache)]
        SDK --> EvalEngine[@darkdeploy/core Evaluator]
    end

    subgraph CloudInfra ["DarkDeploy Cloud Platform"]
        SDK -.->|SSE Live Updates| Stream[SSE Stream Hub :4000]
        SDK -.->|POST /events| Analytics[Telemetry Ingestion]
        Dashboard[React 18 Dashboard :3000] -->|JWT Auth / CRUD| ServerAPI[Express Backend Engine]
        Stream --> ServerAPI
        Analytics --> ServerAPI
        ServerAPI --> DB[(Neon Serverless PostgreSQL)]
    end
```

---

## Core Capabilities

### 1. Zero-Latency Feature Flags & Percentage Rollouts
- **Local In-Memory Evaluation**: Evaluates in sub-microseconds without making blocking network requests on every user interaction.
- **Deterministic SHA-1 Bucketing**: Guarantees that user $X$ consistently experiences the same rollout bucket across different servers and restarts.
- **Complex Targeting Rules**: Target by user attributes (`plan`, `role`, `country`, `version`) using operators: `EQUALS`, `NOT_EQUALS`, `IN`, `NOT_IN`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `GREATER_THAN`, `LESS_THAN`.

### 2. A/B Testing & Frequentist Statistical Engine
- **Multi-Variant Weighted Allocation**: Deterministically distributes traffic across control and custom variants (`50/50`, `33/33/34`, etc.).
- **Automatic Telemetry Ingestion**: Seamless exposure tracking on evaluation and conversion metric ingestion (`client.track(...)`).
- **Mathematical Significance Engine**: Live two-proportion z-test calculation with $p$-value approximation (via Abramowitz & Stegun normal CDF) and relative lift % with 95% confidence intervals.

$$\hat{p} = \frac{c_A + c_B}{n_A + n_B}, \quad Z = \frac{\hat{p}_B - \hat{p}_A}{\sqrt{\hat{p}(1-\hat{p})\left(\frac{1}{n_A} + \frac{1}{n_B}\right)}}$$

### 3. AI Configs & Dynamic LLM Prompts
- **Foundation Model Hot-Swapping**: Switch foundation models (`gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`) on the fly.
- **Runtime Hyperparameters**: Adjust temperature sliders (`0.0` - `2.0`), maximum token limits, and system prompt text in the dashboard.
- **Zero Redeployment**: Your AI agents, chatbots, and pipelines adapt immediately via the live SSE connection.

### 4. Real-Time Push Delivery via SSE
- Zero polling. Whenever a flag is toggled or an experiment is adjusted in the dashboard, the backend broadcasts an instant SSE push event (`flag_updated`, `experiment_updated`).
- SDK clients update their local memory cache in milliseconds.

### 5. Enterprise Environment Isolation & Audit Logging
- Dedicated environment isolation (`Development`, `Staging`, `Production`).
- Automatic audit log capture with before-and-after JSON diffs for every configuration edit.
- One-click API key copying directly from the dashboard header.

---

## Monorepo Structure

```text
Darkdeploy/
├── packages/
│   ├── core/           # @darkdeploy/core: Deterministic hashing, rules, z-test stats
│   ├── server/         # @darkdeploy/server: Express, Prisma, SSE stream hub, telemetry
│   ├── sdk-node/       # @darkdeploy/node-sdk: Client SDK with local cache & SSE sync
│   └── dashboard/      # @darkdeploy/dashboard: LaunchDarkly pitch-black React 18 admin UI
├── examples/
│   ├── store-demo.ts   # Live real-time terminal store showcase
│   └── demo-app.ts     # Minimal continuous polling evaluation demo
├── package.json
└── tsconfig.base.json
```

---

## Quickstart (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database (or free [Neon](https://neon.tech) connection string)

### 1. Clone & Install
```bash
git clone https://github.com/S-Rohan-Kumar/Darkdeploy.git
cd Darkdeploy
npm install
```

### 2. Configure Environment Variables
Create `packages/server/.env`:
```env
PORT=4000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="super-secure-random-jwt-secret-key"
```

### 3. Initialize & Seed Database
```bash
npm run build
npx prisma db push --schema=packages/server/prisma/schema.prisma
npm run db:seed --workspace=@darkdeploy/server
```

Default credentials created:
- **Admin Email**: `admin@darkdeploy.io`
- **Password**: `admin123456`
- **Dev API Key**: `dd_dev_d934289e58292e134bcde54fbf153aa7`

### 4. Start Development Servers
```bash
# Terminal 1: Backend API & SSE Engine
npm run dev:server

# Terminal 2: React Dashboard
npm run dev:dashboard
```
- **Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **SSE Stream**: `http://localhost:4000/api/stream`

### 5. Run the Real-Time Showcase Demo
```bash
npm run demo:store
```
Watch flags, A/B experiments, and AI configs evaluate in real time, and toggle flags in the dashboard to see immediate terminal stream updates!

---

## Production Deployment ($0 Cost)

| Service | Platform | Tier | Setup |
| :--- | :--- | :--- | :--- |
| **Database** | [Neon](https://neon.tech) | Free Tier (0.5GB Autoscaling Postgres) | Copy pooled connection string into `DATABASE_URL` |
| **Backend & SSE** | [Render](https://render.com) | Free Web Service (512MB RAM Node.js) | Build: `npm ci --include=dev && npm run build --workspace=@darkdeploy/core && npm run build --workspace=@darkdeploy/server`<br>Start: `node packages/server/dist/index.js` |
| **Dashboard** | [Vercel](https://vercel.com) | Hobby Tier (Global CDN Edge) | Root: `packages/dashboard`<br>Build: `npm run build`<br>Output: `dist` |
| **Node SDK** | [npm](https://npmjs.com) | Free Public Registry | `npm publish --access public` |

---

## SDK Usage Guide

### Install
```bash
npm install @darkdeploy/node-sdk
```

### Feature Flags
```typescript
import { DarkDeployClient } from "@darkdeploy/node-sdk";

const client = new DarkDeployClient({
  apiKey: "dd_dev_d934289e58292e134bcde54fbf153aa7",
  baseUrl: "https://darkdeploy-api.onrender.com",
});

await client.initialize();

const isEligible = client.isEnabled("vip-pricing", {
  id: "usr_42",
  attributes: { plan: "enterprise", country: "US" },
});
```

### A/B Testing & Tracking
```typescript
// Deterministic variant assignment (auto-tracks EXPOSURE)
const variant = client.getVariant("checkout-color-exp", { id: "usr_42" });
console.log("Assigned variant:", variant?.key);

// Record CONVERSION event
await client.track("checkout-color-exp", { id: "usr_42" }, "CONVERSION", 99.00);
```

### Dynamic AI Prompts
```typescript
const aiConfig = client.getAIConfig("support-agent-prompt", { id: "usr_42" }, {
  model: "gpt-4o",
  temperature: 0.7,
  systemPrompt: "You are a standard helpful assistant.",
});

console.log("Active Model:", aiConfig.model);
console.log("System Prompt:", aiConfig.systemPrompt);
```

---

## Running Test Suite

```bash
npm test
```
- **22/22 tests passing** in `@darkdeploy/core` (Hashing, Rules, Evaluations, Stats, Experiments).
- **4/4 tests passing** in `@darkdeploy/node-sdk` (Init, Graceful fallbacks, AI configs).
- **Total: 26/26 unit tests passing**.

---

## License

MIT License. Designed and maintained for production-scale engineering teams.
