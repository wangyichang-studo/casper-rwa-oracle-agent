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
};

test("runAgentOnce logs perception, evidence, decision, and transaction hash", async () => {
  const lines: string[] = [];
  const logger = createLogger((line) => lines.push(line), () => new Date("2026-06-06T00:00:00.000Z"));

  const result = await runAgentOnce(config, logger);

  assert.equal(result.assessed.length, 3);
  assert.ok(result.published.length >= 2);
  assert.ok(result.skipped.length >= 1);
  assert.match(lines.join("\n"), /\[PERCEPTION\] \[DATA_LOADED\]/);
  assert.match(lines.join("\n"), /\[EVIDENCE\] \[HASHED\]/);
  assert.match(lines.join("\n"), /\[DECISION\] \[PUBLISH\]/);
  assert.match(lines.join("\n"), /mock-[a-f0-9]+/);
});

test("isDirectCliEntrypoint accepts relative tsx argv path", () => {
  const metaUrl = new URL("../src/agent.ts", import.meta.url).href;

  assert.equal(isDirectCliEntrypoint(metaUrl, "src/agent.ts"), true);
});
