import assert from "node:assert/strict";
import test from "node:test";

import { assessRisk } from "../src/risk-assessor.js";
import type { RawDataPoint } from "../src/types.js";

const basePoint: RawDataPoint = {
  assetId: "rwa-demo-invoice-001",
  source: "synthetic-invoice-risk-feed",
  sourceKind: "invoice",
  rawValue: 1_250_000,
  unit: "USD_CENTS",
  expectedMin: 1_000_000,
  expectedMax: 1_500_000,
  reliability: 0.95,
  volatilityBps: 180,
  observedAt: "2026-06-06T00:00:00.000Z",
  evidence: {
    provider: "local-synthetic",
    reference: "invoice-risk-score-v1",
    paid: false,
  },
};

test("assessRisk publishes high-confidence in-range data", () => {
  const assessed = assessRisk(basePoint, {
    publishThreshold: 60,
    now: new Date("2026-06-06T00:05:00.000Z"),
  });

  assert.equal(assessed.decision, "publish");
  assert.equal(assessed.confidence, 94);
  assert.match(assessed.evidenceHash, /^sha256:/);
});

test("assessRisk sends stale anomalous data to skip", () => {
  const assessed = assessRisk(
    {
      ...basePoint,
      rawValue: 3_000_000,
      reliability: 0.55,
      volatilityBps: 1_200,
      observedAt: "2026-06-05T20:00:00.000Z",
    },
    {
      publishThreshold: 60,
      now: new Date("2026-06-06T00:05:00.000Z"),
    },
  );

  assert.equal(assessed.decision, "skip");
  assert.ok(assessed.confidence < 40);
});
