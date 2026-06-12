import assert from "node:assert/strict";
import test from "node:test";

import { createLogger, redactSecrets } from "../src/logger.js";

test("redactSecrets hides secret-like keys and inline values", () => {
  const redacted = redactSecrets({
    token: "abc",
    nested: { secretKeyPath: "../keys/secret_key.pem" },
    message: "api_key=abc123 ok=true",
  });

  assert.deepEqual(redacted, {
    token: "[REDACTED]",
    nested: { secretKeyPath: "[REDACTED]" },
    message: "api_key=[REDACTED] ok=true",
  });
});

test("logger emits structured redacted lines", () => {
  const lines: string[] = [];
  const logger = createLogger((line) => lines.push(line), () => new Date("2026-06-06T00:00:00.000Z"));

  logger.event("AGENT", "START", { password: "not-for-log", assetId: "rwa-demo" });

  assert.equal(lines.length, 1);
  assert.match(lines[0] ?? "", /^\[2026-06-06T00:00:00.000Z\] \[AGENT\] \[START\]/);
  assert.match(lines[0] ?? "", /"password":"\[REDACTED\]"/);
});

test("logger emits parseable JSONL lines when JSON format is requested", () => {
  const lines: string[] = [];
  const logger = createLogger(
    (line) => lines.push(line),
    () => new Date("2026-06-06T00:00:00.000Z"),
    "json",
  );

  logger.event("DECISION_GATE", "EVALUATED", {
    assetId: "rwa-demo-warehouse-lease-009",
    confidence_score: 70,
    decision: "pay_for_premium",
    tx_hash: "mock-abc123",
    token: "not-for-log",
  });

  const parsed = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;

  assert.equal(parsed.timestamp, "2026-06-06T00:00:00.000Z");
  assert.equal(parsed.module_name, "DECISION_GATE");
  assert.equal(parsed.action, "EVALUATED");
  assert.equal(parsed.confidence_score, 70);
  assert.equal(parsed.decision, "pay_for_premium");
  assert.equal(parsed.tx_hash, "mock-abc123");
  assert.equal(parsed.token, "[REDACTED]");
});
