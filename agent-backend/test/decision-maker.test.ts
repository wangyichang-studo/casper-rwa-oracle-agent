import assert from "node:assert/strict";
import test from "node:test";

import { decideNextAction } from "../src/decision-maker.js";
import type { AssessedDataPoint, DecisionMakerOptions } from "../src/types.js";

const options: DecisionMakerOptions = {
  publishThreshold: 60,
  premiumEvidenceMinConfidence: 50,
  premiumEvidenceMaxConfidence: 70,
  x402Enabled: true,
};

function assessed(confidence: number, decision: AssessedDataPoint["decision"]): AssessedDataPoint {
  return {
    assetId: `rwa-demo-${confidence}`,
    value: 1_000_000,
    unit: "USD_CENTS",
    confidence,
    decision,
    evidenceHash: "sha256:base-evidence",
    reason: `confidence ${confidence}`,
    raw: {
      assetId: `rwa-demo-${confidence}`,
      source: "synthetic-test-feed",
      sourceKind: "invoice",
      rawValue: 1_000_000,
      unit: "USD_CENTS",
      expectedMin: 900_000,
      expectedMax: 1_100_000,
      reliability: confidence / 100,
      volatilityBps: 0,
      observedAt: "2026-06-06T00:00:00.000Z",
      evidence: {
        provider: "local-test",
        reference: "decision-maker-test",
        paid: false,
      },
    },
  };
}

test("confidence above premium evidence band publishes directly without x402", () => {
  const outcome = decideNextAction(assessed(71, "publish"), options);

  assert.equal(outcome.action, "publish_directly");
  assert.equal(outcome.shouldRequestPremiumEvidence, false);
  assert.equal(outcome.publishDecision, "publish");
});

test("confidence below premium evidence ceiling requests x402 when still salvageable", () => {
  const outcome = decideNextAction(assessed(69, "publish"), options);

  assert.equal(outcome.action, "pay_for_premium");
  assert.equal(outcome.shouldRequestPremiumEvidence, true);
  assert.equal(outcome.publishDecision, "review");
});

test("confidence exactly at premium evidence ceiling requests x402", () => {
  const outcome = decideNextAction(assessed(70, "publish"), options);

  assert.equal(outcome.action, "pay_for_premium");
  assert.equal(outcome.shouldRequestPremiumEvidence, true);
});

test("confidence below salvage band remains skipped without x402", () => {
  const outcome = decideNextAction(assessed(20, "skip"), options);

  assert.equal(outcome.action, "skip");
  assert.equal(outcome.shouldRequestPremiumEvidence, false);
  assert.equal(outcome.publishDecision, "skip");
});
