# @darkdeploy/core

The zero-dependency, microsecond evaluation, hashing, and statistical significance engine powering **DarkDeploy**.

[![npm version](https://img.shields.io/npm/v/@darkdeploy/core.svg)](https://www.npmjs.com/package/@darkdeploy/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@darkdeploy/core` is a lightweight, pure TypeScript library providing deterministic evaluation algorithms for:
- **Feature Flags & Targeting Rules**: Sub-microsecond local evaluations with custom attribute matching.
- **Deterministic Traffic Bucketing**: SHA-1 percentage allocation without persistent state or cache thrashing.
- **A/B Testing Multi-Variant Hashing**: Consistent variant distribution across experiments.
- **Frequentist Statistical Engine**: Two-proportion hypothesis z-test with $p$-value calculation and confidence intervals.

---

## Installation

```bash
npm install @darkdeploy/core
```

---

## Capabilities & Usage

### 1. Deterministic Percentage Rollouts (SHA-1 Bucketing)

Computes a deterministic float between `0.00` and `100.00` for any unique user ID and flag key:

```typescript
import { computeBucket } from "@darkdeploy/core";

const bucket = computeBucket("user_98234", "new-checkout-flow");
console.log(`User assigned to bucket: ${bucket.toFixed(2)}%`);

if (bucket < 25.0) {
  console.log("User is in the 25% rollout group");
}
```

### 2. Multi-Attribute Targeting Engine

Evaluates complex rules with full operator support (`EQUALS`, `NOT_EQUALS`, `IN`, `NOT_IN`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `GREATER_THAN`, `LESS_THAN`):

```typescript
import { evaluate, Flag } from "@darkdeploy/core";

const flag: Flag = {
  id: "flg_123",
  key: "vip-discount",
  name: "VIP Discount",
  enabled: true,
  defaultValue: false,
  rolloutPercentage: 0,
  rules: [
    {
      attribute: "plan",
      operator: "IN",
      values: ["enterprise", "pro"],
      serveValue: true,
      priority: 1,
    },
    {
      attribute: "spend",
      operator: "GREATER_THAN",
      values: ["500"],
      serveValue: true,
      priority: 2,
    },
  ],
};

const result = evaluate(flag, {
  id: "usr_42",
  attributes: { plan: "enterprise", spend: 750 },
});

console.log(result.value);
console.log(result.reason);
```

### 3. A/B Experiment Variant Allocation

Deterministically assigns users across multiple weighted variants:

```typescript
import { assignVariant, Experiment } from "@darkdeploy/core";

const experiment: Experiment = {
  id: "exp_checkout",
  key: "checkout-cta-color",
  name: "Checkout CTA Test",
  enabled: true,
  environmentId: "env_prod",
  variants: [
    { key: "control", name: "Original Blue", weight: 50 },
    { key: "emerald", name: "High Contrast Green", weight: 50 },
  ],
};

const assignment = assignVariant(experiment, { id: "user_101" });
console.log(`Assigned variant: ${assignment.variant.key}`);
```

### 4. Frequentist Z-Test & Statistical Significance

Evaluates whether an experiment variant shows a statistically significant conversion lift over baseline:

$$\hat{p} = \frac{c_A + c_B}{n_A + n_B}, \quad Z = \frac{\hat{p}_B - \hat{p}_A}{\sqrt{\hat{p}(1-\hat{p})\left(\frac{1}{n_A} + \frac{1}{n_B}\right)}}$$

```typescript
import { calculateZTest } from "@darkdeploy/core";

const stats = calculateZTest(
  1000, 100,
  1000, 145
);

console.log(`Relative Lift: ${stats.relativeLift}%`);
console.log(`Z-Score: ${stats.zScore.toFixed(3)}`);
console.log(`P-Value: ${stats.pValue.toFixed(4)}`);
console.log(`Significant (95% CI): ${stats.isSignificant}`);
```

---

## License

MIT
