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
