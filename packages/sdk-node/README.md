# @darkdeploy/node-sdk

Official Node.js SDK for **DarkDeploy** — Feature Flagging, Live A/B Experimentation, and Dynamic AI Configs with real-time SSE streaming.

## Installation

```bash
npm install @darkdeploy/node-sdk
```

## Quick Start

```typescript
import { DarkDeployClient } from "@darkdeploy/node-sdk";

const client = new DarkDeployClient({
  apiKey: "YOUR_ENVIRONMENT_API_KEY",
  baseUrl: "https://your-darkdeploy-api.com",
});

await client.initialize();

const isEnabled = client.isEnabled("new-checkout-flow", {
  id: "user_123",
  attributes: { plan: "enterprise" },
});

const variant = client.getVariant("checkout-button-experiment", {
  id: "user_123",
});

await client.track(
  "checkout-button-experiment",
  { id: "user_123" },
  "CONVERSION",
  49.99
);

const aiConfig = client.getAIConfig(
  "support-agent-prompt",
  { id: "user_123", attributes: { plan: "enterprise" } },
  { model: "gpt-4o", temperature: 0.7 }
);
```

## Features

- **Zero-Latency In-Memory Evaluation**: Local deterministic hashing.
- **Real-Time Synchronization**: Instant SSE push updates when flags or experiments change in the dashboard.
- **Built-in A/B Testing**: Auto-exposure logging and conversion tracking.
- **Dynamic AI Prompt Management**: Real-time LLM prompt and temperature updates without redeployment.
