import assert from "node:assert/strict";
import test from "node:test";

import { createLogger } from "../src/logger.js";
import {
  applyPremiumRiskEvidence,
  fetchPremiumRiskScore,
  shouldRequestPremiumEvidence,
} from "../src/x402-client.js";
import { assessRisk } from "../src/risk-assessor.js";
import type { AgentConfig, RawDataPoint } from "../src/types.js";

const config: AgentConfig = {
  mode: "mock",
  chainName: "casper-test",
  nodeAddress: "https://node.testnet.cspr.cloud",
  contractPackageHash: "mock-contract-package-hash",
  publishThreshold: 60,
  intervalSeconds: 60,
  x402: {
    enabled: true,
    mode: "mock",
    oracleBaseUrl: "mock://local-rwa-oracle",
    network: "casper:casper-test",
    amount: "1000000000",
    asset: "9824d60dc3a5c44a20b9fd260a412437933835b52fc683d8ae36e4ec2114843e",
    payTo: "009e5669b070545e2b32bc66363b9d3d4390fca56bf52a05f1411b7fa18ca311c7",
    maxTimeoutSeconds: 900,
    premiumEvidenceMinConfidence: 50,
    premiumEvidenceMaxConfidence: 70,
  },
};

const borderlinePoint: RawDataPoint = {
  assetId: "rwa-demo-warehouse-lease-009",
  source: "synthetic-lease-index-feed",
  sourceKind: "lease",
  rawValue: 7_800_000,
  unit: "USD_CENTS",
  expectedMin: 2_500_000,
  expectedMax: 7_500_000,
  reliability: 0.86,
  volatilityBps: 480,
  observedAt: "2026-06-06T00:00:00.000Z",
  evidence: {
    provider: "local-synthetic",
    reference: "warehouse-lease-review-v1",
    paid: false,
  },
};

test("fetchPremiumRiskScore performs mock x402 retry flow with structured logs", async () => {
  const lines: string[] = [];
  const logger = createLogger((line) => lines.push(line), () => new Date("2026-06-06T00:00:00.000Z"));

  const premium = await fetchPremiumRiskScore("rwa-demo-warehouse-lease-009", config.x402, logger);

  assert.equal(premium.assetId, "rwa-demo-warehouse-lease-009");
  assert.equal(premium.premiumData, true);
  assert.equal(premium.recommendedAction, "publish_with_high_confidence");
  assert.match(lines.join("\n"), /\[X402\] \[PAYMENT_REQUIRED\]/);
  assert.match(lines.join("\n"), /\[X402\] \[PAYMENT_SIGNED\]/);
  assert.match(lines.join("\n"), /\[X402\] \[DATA_RECEIVED\]/);
});

test("premium x402 evidence upgrades borderline review data into publish decision", () => {
  const assessed = assessRisk(borderlinePoint, {
    publishThreshold: 60,
    now: new Date("2026-06-06T00:30:00.000Z"),
  });
  assert.equal(shouldRequestPremiumEvidence(assessed, config.x402), true);

  const upgraded = applyPremiumRiskEvidence(assessed, {
    assetId: assessed.assetId,
    riskScore: 23,
    riskFactors: ["counterparty_exposure", "maturity_risk"],
    recommendedAction: "publish_with_high_confidence",
    premiumData: true,
    evidenceHash: "sha256:premium-risk-evidence",
  });

  assert.equal(upgraded.decision, "publish");
  assert.ok(upgraded.confidence >= config.publishThreshold);
  assert.equal(upgraded.premiumEvidence?.premiumData, true);
});
