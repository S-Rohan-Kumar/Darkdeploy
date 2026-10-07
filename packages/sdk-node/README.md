# @darkdeploy/node-sdk

The official Node.js SDK for **DarkDeploy** — Enterprise Feature Flagging, Live A/B Experimentation, and Dynamic AI Prompt Configurations with Real-Time Server-Sent Events (SSE) Streaming.

[![npm version](https://img.shields.io/npm/v/@darkdeploy/node-sdk.svg)](https://www.npmjs.com/package/@darkdeploy/node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- ⚡ **Zero-Latency In-Memory Evaluation**: Evaluates flags and experiments locally in microseconds using `@darkdeploy/core`.
- 🔄 **Real-Time Push Updates via SSE**: Flag toggles, rollout changes, and prompt edits stream instantly without polling.
- 🛡️ **Fault-Tolerant & Offline-First**: Automatic reconnects with exponential backoff & jitter. Graceful fallbacks ensure your app never crashes.
- 🧪 **Full A/B Experimentation**: Automatic exposure logging and conversion metric tracking (`client.track`).
- 🤖 **Dynamic AI Hyperparameters & Prompts**: Update LLM foundation models, temperature, token limits, and system prompts on the fly without redeployment.

---

## Installation

```bash
npm install @darkdeploy/node-sdk
```

---

## Quickstart

```typescript
import { DarkDeployClient } from "@darkdeploy/node-sdk";

const client = new DarkDeployClient({
  apiKey: "dd_dev_d934289e58292e134bcde54fbf153aa7",
  baseUrl: "https://darkdeploy-api.onrender.com",
});

await client.initialize();
console.log("Connected to DarkDeploy Engine via SSE");
```

---

## Usage Guide

### 1. Feature Flag Evaluation

Evaluate whether a feature is active for a specific user based on percentage rollouts or custom targeting rules:

```typescript
const isEnabled = client.isEnabled("new-checkout-flow", {
  id: "usr_9812",
  attributes: {
    plan: "enterprise",
    country: "US",
  },
});

if (isEnabled) {
  renderCheckoutV2();
}
```

Detailed evaluation with explanation:

```typescript
const result = client.evaluate("new-checkout-flow", { id: "usr_9812" });
console.log(result.value);
console.log(result.reason);
```

---

### 2. A/B Testing & Variant Tracking

Assign users to experiment variants and track conversion goals:

```typescript
const experimentKey = "checkout-button-experiment";

const variant = client.getVariant(experimentKey, { id: "usr_9812" });
console.log(`Variant assigned: ${variant?.key} (${variant?.name})`);

await client.track(
  experimentKey,
  { id: "usr_9812" },
  "CONVERSION",
  49.99
);
```

---

### 3. AI Configs & Dynamic LLM Prompts

Dynamically retrieve and hot-swap LLM models, hyperparameters, and prompts at runtime:

```typescript
const aiConfig = client.getAIConfig(
  "customer-support-agent",
  { id: "usr_9812", attributes: { plan: "enterprise" } },
  {
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: "You are a professional enterprise support agent.",
  }
);

console.log("Model:", aiConfig.model);
console.log("Temperature:", aiConfig.temperature);
console.log("Prompt:", aiConfig.systemPrompt);
```

---

## API Reference

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `initialize()` | None | `Promise<void>` | Fetches snapshots from API and establishes SSE stream. |
| `isEnabled()` | `flagKey, context, defaultValue?` | `boolean` | Quick boolean flag evaluation. |
| `evaluate()` | `flagKey, context, defaultValue?` | `EvaluationResult` | Full evaluation result including `reason` and matched rule. |
| `getVariant()` | `experimentKey, context` | `Variant \| null` | Assigns variant and fires background `EXPOSURE` event. |
| `track()` | `experimentKey, context, type?, value?` | `Promise<void>` | Records exposure or conversion telemetry event. |
| `getAIConfig()` | `flagKey, context, fallback?` | `AIConfig \| null` | Evaluates dynamic LLM model configuration and system prompt. |
| `close()` | None | `void` | Closes SSE connection and flushes local cache. |

---

## License

MIT
