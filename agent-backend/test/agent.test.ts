import assert from "node:assert/strict";
import test from "node:test";

import { isDirectCliEntrypoint, runAgentOnce } from "../src/agent.js";
import { createLogger } from "../src/logger.js";
import type { AgentConfig } from "../src/types.js";

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

test("runAgentOnce logs perception, evidence, decision, and transaction hash", async () => {
  const lines: string[] = [];
  const logger = createLogger((line) => lines.push(line), () => new Date("2026-06-06T00:00:00.000Z"));

  const result = await runAgentOnce(config, logger);

  assert.equal(result.assessed.length, 4);
  assert.ok(result.published.length >= 3);
  assert.ok(result.skipped.length >= 1);
  assert.match(lines.join("\n"), /\[PERCEPTION\] \[DATA_LOADED\]/);
  assert.match(lines.join("\n"), /\[EVIDENCE\] \[HASHED\]/);
  assert.match(lines.join("\n"), /\[X402\] \[PAYMENT_REQUIRED\]/);
  assert.match(lines.join("\n"), /\[X402\] \[DATA_RECEIVED\]/);
  assert.match(lines.join("\n"), /\[DECISION\] \[PUBLISH\]/);
  assert.match(lines.join("\n"), /mock-[a-f0-9]+/);
});

test("runAgentOnce degrades gracefully when x402 oracle is unavailable", async () => {
  const lines: string[] = [];
  const logger = createLogger((line) => lines.push(line), () => new Date("2026-06-06T00:00:00.000Z"), "json");

  const result = await runAgentOnce(
    {
      ...config,
      x402: {
        ...config.x402,
        oracleBaseUrl: "http://127.0.0.1:9",
      },
    },
    logger,
  );

  const parsed = lines.map((line) => JSON.parse(line) as Record<string, unknown>);

  assert.equal(result.assessed.length, 4);
  assert.ok(result.published.length >= 2);
  assert.ok(result.skipped.length >= 1);
  assert.ok(parsed.some((line) => line.module_name === "X402" && line.action === "ERROR"));
  assert.ok(parsed.some((line) => line.module_name === "DECISION_GATE" && line.decision === "pay_for_premium"));
});

test("isDirectCliEntrypoint accepts relative tsx argv path", () => {
  const metaUrl = new URL("../src/agent.ts", import.meta.url).href;

  assert.equal(isDirectCliEntrypoint(metaUrl, "src/agent.ts"), true);
});
