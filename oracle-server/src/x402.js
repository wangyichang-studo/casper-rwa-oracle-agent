import { createHash } from "node:crypto";

const DEFAULT_ASSET = "9824d60dc3a5c44a20b9fd260a412437933835b52fc683d8ae36e4ec2114843e";
const DEFAULT_PAY_TO = "009e5669b070545e2b32bc66363b9d3d4390fca56bf52a05f1411b7fa18ca311c7";

export function encodeBase64Json(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

export function decodeBase64Json(value) {
  if (!value) {
    throw new Error("missing base64 JSON value");
  }
  return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
}

function deterministicHex(seed, length) {
  let output = "";
  let cursor = 0;
  while (output.length < length) {
    output += createHash("sha256").update(`${seed}:${cursor}`).digest("hex");
    cursor += 1;
  }
  return output.slice(0, length);
}

export function buildPaymentRequirements(resourceUrl, options = {}) {
  return {
    scheme: "exact",
    network: options.network ?? "casper:casper-test",
    asset: options.asset ?? DEFAULT_ASSET,
    amount: options.amount ?? "1000000000",
    payTo: options.payTo ?? DEFAULT_PAY_TO,
    maxTimeoutSeconds: options.maxTimeoutSeconds ?? 900,
    extra: {
      name: options.tokenName ?? "Cep18x402",
      version: options.tokenVersion ?? "1",
      decimals: options.decimals ?? "9",
      symbol: options.symbol ?? "CSPR",
    },
    resource: resourceUrl,
    description: "Premium RWA risk assessment",
  };
}

export function buildPaymentRequired(resourceUrl, options = {}) {
  return {
    x402Version: 2,
    accepts: [buildPaymentRequirements(resourceUrl, options)],
  };
}

export function mockPaymentPayloadFor(resourceUrl, requirements) {
  const now = Math.floor(Date.now() / 1000);
  const seed = `${resourceUrl}:${requirements.amount}:${requirements.payTo}`;
  return {
    x402Version: 2,
    resource: {
      url: resourceUrl,
      description: requirements.description,
      mimeType: "application/json",
    },
    accepted: {
      scheme: requirements.scheme,
      network: requirements.network,
      asset: requirements.asset,
      amount: requirements.amount,
      payTo: requirements.payTo,
      maxTimeoutSeconds: requirements.maxTimeoutSeconds,
      extra: requirements.extra,
    },
    payload: {
      signature: deterministicHex(`signature:${seed}`, 130),
      publicKey: `01${deterministicHex(`public-key:${seed}`, 64)}`,
      authorization: {
        from: `00${deterministicHex(`payer:${seed}`, 64)}`,
        to: requirements.payTo,
        value: requirements.amount,
        validAfter: String(now - 30),
        validBefore: String(now + requirements.maxTimeoutSeconds),
        nonce: deterministicHex(`nonce:${seed}`, 64),
      },
    },
  };
}

export function isWellFormedPaymentPayload(payload, requirements) {
  return Boolean(
    payload &&
      payload.x402Version === 2 &&
      payload.accepted?.scheme === "exact" &&
      payload.accepted?.network === requirements.network &&
      payload.accepted?.asset === requirements.asset &&
      payload.accepted?.amount === requirements.amount &&
      payload.payload?.signature &&
      payload.payload?.publicKey &&
      payload.payload?.authorization?.to === requirements.payTo,
  );
}

export function buildMockPremiumRiskScore(assetId) {
  const knownScores = {
    "rwa-demo-warehouse-lease-009": {
      risk_score: 23,
      risk_factors: ["counterparty_exposure", "maturity_risk"],
      recommended_action: "publish_with_high_confidence",
    },
    "rwa-demo-invoice-001": {
      risk_score: 18,
      risk_factors: ["counterparty_history", "invoice_age"],
      recommended_action: "publish_with_high_confidence",
    },
  };
  const score = knownScores[assetId] ?? {
    risk_score: 48,
    risk_factors: ["generic_rwa_uncertainty"],
    recommended_action: "review_required",
  };

  return {
    asset_id: assetId,
    ...score,
    premium_data: true,
  };
}

export function buildSettlementResponse(assetId, payer = "mock-payer") {
  return {
    success: true,
    transaction: deterministicHex(`settlement:${assetId}:${payer}`, 64),
    network: "casper:casper-test",
    payer,
    mode: "mock",
  };
}
