import assert from "node:assert/strict";
import test from "node:test";

import { canonicalJson, hashEvidence } from "../src/evidence.js";

test("canonicalJson sorts object keys recursively", () => {
  assert.equal(
    canonicalJson({ z: 1, a: { y: 2, b: 3 } }),
    '{"a":{"b":3,"y":2},"z":1}',
  );
});

test("hashEvidence is deterministic for equivalent objects", () => {
  const left = hashEvidence({ source: "demo", value: 42 });
  const right = hashEvidence({ value: 42, source: "demo" });

  assert.equal(left, right);
  assert.match(left, /^sha256:[a-f0-9]{64}$/);
});
