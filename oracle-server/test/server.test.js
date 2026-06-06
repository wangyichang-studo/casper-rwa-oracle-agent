import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeBase64Json,
  encodeBase64Json,
  mockPaymentPayloadFor,
} from "../src/x402.js";
import { createOracleServer, isDirectCliEntrypoint } from "../src/server.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert.equal(typeof address, "object");
      resolve({ port: address.port });
    });
  });
}

test("paid risk endpoint returns x402 402 challenge without payment", async (t) => {
  const server = createOracleServer({ mode: "mock" });
  t.after(() => server.close());
  const { port } = await listen(server);

  const response = await fetch(`http://127.0.0.1:${port}/api/v1/rwa-risk-score/rwa-demo-warehouse-lease-009`);
  const body = await response.json();
  const header = response.headers.get("PAYMENT-REQUIRED");

  assert.equal(response.status, 402);
  assert.equal(body.x402Version, 2);
  assert.ok(header);

  const required = decodeBase64Json(header);
  assert.equal(required.x402Version, 2);
  assert.equal(required.accepts[0].scheme, "exact");
  assert.equal(required.accepts[0].network, "casper:casper-test");
});

test("paid risk endpoint returns premium data with mock payment signature", async (t) => {
  const server = createOracleServer({ mode: "mock" });
  t.after(() => server.close());
  const { port } = await listen(server);
  const resourceUrl = `http://127.0.0.1:${port}/api/v1/rwa-risk-score/rwa-demo-warehouse-lease-009`;

  const challenge = await fetch(resourceUrl);
  const requirements = decodeBase64Json(challenge.headers.get("PAYMENT-REQUIRED")).accepts[0];
  const signature = encodeBase64Json(mockPaymentPayloadFor(resourceUrl, requirements));

  const response = await fetch(resourceUrl, {
    headers: {
      "PAYMENT-SIGNATURE": signature,
    },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.asset_id, "rwa-demo-warehouse-lease-009");
  assert.equal(body.premium_data, true);
  assert.equal(body.recommended_action, "publish_with_high_confidence");
  assert.ok(response.headers.get("PAYMENT-RESPONSE"));
});

test("isDirectCliEntrypoint accepts relative node argv path", () => {
  const metaUrl = new URL("../src/server.js", import.meta.url).href;

  assert.equal(isDirectCliEntrypoint(metaUrl, "src/server.js"), true);
});
