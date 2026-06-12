import { createHash } from "node:crypto";

import { hashEvidence } from "./evidence.js";
import { decideNextAction } from "./decision-maker.js";
import type {
  AssessedDataPoint,
  DecisionMakerOptions,
  Logger,
  PremiumRiskScore,
  X402Config,
  X402PaymentPayload,
  X402PaymentRequired,
  X402PaymentRequirements,
  X402PaymentTrace,
} from "./types.js";

function encodeBase64Json(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function decodeBase64Json<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64").toString("utf8")) as T;
}

function deterministicHex(seed: string, length: number): string {
  let output = "";
  let cursor = 0;
  while (output.length < length) {
    output += createHash("sha256").update(`${seed}:${cursor}`).digest("hex");
    cursor += 1;
  }
  return output.slice(0, length);
}

function resourceUrl(assetId: string, config: X402Config): string {
  const path = `/api/v1/rwa-risk-score/${encodeURIComponent(assetId)}`;
  if (config.oracleBaseUrl.startsWith("mock://")) {
    return `${config.oracleBaseUrl}${path}`;
  }
  return `${config.oracleBaseUrl.replace(/\/$/, "")}${path}`;
}

function buildPaymentRequirements(assetId: string, config: X402Config): X402PaymentRequirements {
  return {
    scheme: "exact",
    network: config.network,
    asset: config.asset,
    amount: config.amount,
    payTo: config.payTo,
    maxTimeoutSeconds: config.maxTimeoutSeconds,
    extra: {
      name: "Cep18x402",
      version: "1",
      decimals: "9",
      symbol: "CSPR",
    },
    resource: resourceUrl(assetId, config),
    description: "Premium RWA risk assessment",
  };
}

function buildPaymentRequired(assetId: string, config: X402Config): X402PaymentRequired {
  return {
    x402Version: 2,
    accepts: [buildPaymentRequirements(assetId, config)],
  };
}

function firstRequirement(paymentRequired: X402PaymentRequired): X402PaymentRequirements {
  const requirement = paymentRequired.accepts[0];
  if (!requirement) {
    throw new Error("x402 payment requirement did not include any accepted payment option");
  }
  return requirement;
}

function buildMockPaymentPayload(
  resource: string,
  accepted: X402PaymentRequirements,
): X402PaymentPayload {
  const now = Math.floor(Date.now() / 1000);
  const seed = `${resource}:${accepted.amount}:${accepted.payTo}`;
  return {
    x402Version: 2,
    resource: {
      url: resource,
      description: accepted.description,
      mimeType: "application/json",
    },
    accepted,
    payload: {
      signature: deterministicHex(`signature:${seed}`, 130),
      publicKey: `01${deterministicHex(`public-key:${seed}`, 64)}`,
      authorization: {
        from: `00${deterministicHex(`payer:${seed}`, 64)}`,
        to: accepted.payTo,
        value: accepted.amount,
        validAfter: String(now - 30),
        validBefore: String(now + accepted.maxTimeoutSeconds),
        nonce: deterministicHex(`nonce:${seed}`, 64),
      },
    },
  };
}

function mockPremiumRiskScore(assetId: string): PremiumRiskScore {
  if (assetId === "rwa-demo-warehouse-lease-009") {
    return {
      assetId,
      riskScore: 23,
      riskFactors: ["counterparty_exposure", "maturity_risk"],
      recommendedAction: "publish_with_high_confidence",
      premiumData: true,
      evidenceHash: hashEvidence({ assetId, provider: "mock-x402-premium-oracle", riskScore: 23 }),
    };
  }

  return {
    assetId,
    riskScore: 48,
    riskFactors: ["generic_rwa_uncertainty"],
    recommendedAction: "review_required",
    premiumData: true,
    evidenceHash: hashEvidence({ assetId, provider: "mock-x402-premium-oracle", riskScore: 48 }),
  };
}

function normalizePremiumRiskScore(raw: Record<string, unknown>, assetId: string): PremiumRiskScore {
  return {
    assetId: String(raw.asset_id ?? raw.assetId ?? assetId),
    riskScore: Number(raw.risk_score ?? raw.riskScore),
    riskFactors: Array.isArray(raw.risk_factors)
      ? raw.risk_factors.map(String)
      : Array.isArray(raw.riskFactors)
        ? raw.riskFactors.map(String)
        : [],
    recommendedAction: String(raw.recommended_action ?? raw.recommendedAction ?? "review_required") as PremiumRiskScore["recommendedAction"],
    premiumData: Boolean(raw.premium_data ?? raw.premiumData),
    evidenceHash: typeof raw.evidence_hash === "string"
      ? raw.evidence_hash
      : typeof raw.evidenceHash === "string"
        ? raw.evidenceHash
        : hashEvidence(raw),
  };
}

function paymentTrace(
  config: X402Config,
  resource: string,
  paymentRequirement: X402PaymentRequirements,
  paymentPayload: X402PaymentPayload,
  settlementTransaction?: string,
): X402PaymentTrace {
  return {
    mode: config.mode,
    resource,
    paymentRequirement,
    paymentPayloadHash: hashEvidence(paymentPayload),
    settlementTransaction,
  };
}

export function shouldRequestPremiumEvidence(
  assessed: AssessedDataPoint,
  config: X402Config,
): boolean {
  const options: DecisionMakerOptions = {
    publishThreshold: 60,
    premiumEvidenceMinConfidence: config.premiumEvidenceMinConfidence ?? 50,
    premiumEvidenceMaxConfidence: config.premiumEvidenceMaxConfidence ?? 70,
    x402Enabled: config.enabled,
  };
  return decideNextAction(assessed, options).shouldRequestPremiumEvidence;
}

export function applyPremiumRiskEvidence(
  assessed: AssessedDataPoint,
  premium: PremiumRiskScore,
  trace?: X402PaymentTrace,
): AssessedDataPoint {
  if (premium.recommendedAction === "publish_with_high_confidence") {
    const confidence = Math.max(assessed.confidence, Math.min(95, 100 - premium.riskScore));
    return {
      ...assessed,
      confidence,
      decision: "publish",
      reason: `premium x402 evidence recommends ${premium.recommendedAction}`,
      evidenceHash: hashEvidence({
        baseEvidenceHash: assessed.evidenceHash,
        premiumEvidenceHash: premium.evidenceHash,
        premiumRiskScore: premium.riskScore,
        recommendedAction: premium.recommendedAction,
      }),
      premiumEvidence: premium,
      x402Payment: trace,
    };
  }

  return {
    ...assessed,
    decision: premium.recommendedAction === "block" ? "skip" : assessed.decision,
    reason: `premium x402 evidence recommends ${premium.recommendedAction}`,
    premiumEvidence: premium,
    x402Payment: trace,
  };
}

export async function fetchPremiumRiskScore(
  assetId: string,
  config: X402Config,
  logger?: Logger,
): Promise<PremiumRiskScore> {
  const resource = resourceUrl(assetId, config);
  let paymentRequired: X402PaymentRequired;

  if (config.oracleBaseUrl.startsWith("mock://")) {
    paymentRequired = buildPaymentRequired(assetId, config);
  } else {
    const firstResponse = await fetch(resource);
    if (firstResponse.status !== 402) {
      throw new Error(`expected x402 oracle to return 402, got ${firstResponse.status}`);
    }
    const requiredHeader = firstResponse.headers.get("PAYMENT-REQUIRED");
    paymentRequired = requiredHeader
      ? decodeBase64Json<X402PaymentRequired>(requiredHeader)
      : await firstResponse.json() as X402PaymentRequired;
  }

  const requirement = firstRequirement(paymentRequired);
  logger?.event("X402", "PAYMENT_REQUIRED", {
    assetId,
    scheme: requirement.scheme,
    network: requirement.network,
    amount: requirement.amount,
    resource,
  });

  const payload = buildMockPaymentPayload(resource, requirement);
  logger?.event("X402", "PAYMENT_SIGNED", {
    assetId,
    mode: config.mode,
    payloadHash: hashEvidence(payload),
    publicKey: payload.payload.publicKey,
  });

  if (config.oracleBaseUrl.startsWith("mock://")) {
    const premium = mockPremiumRiskScore(assetId);
    logger?.event("X402", "DATA_RECEIVED", {
      assetId,
      riskScore: premium.riskScore,
      recommendedAction: premium.recommendedAction,
      premiumData: premium.premiumData,
    });
    return {
      ...premium,
      evidenceHash: premium.evidenceHash ?? hashEvidence(premium),
    };
  }

  const retryResponse = await fetch(resource, {
    headers: {
      "PAYMENT-SIGNATURE": encodeBase64Json(payload),
    },
  });
  if (!retryResponse.ok) {
    throw new Error(`x402 premium oracle retry failed with ${retryResponse.status}`);
  }

  const raw = await retryResponse.json() as Record<string, unknown>;
  const premium = normalizePremiumRiskScore(raw, assetId);
  logger?.event("X402", "DATA_RECEIVED", {
    assetId,
    riskScore: premium.riskScore,
    recommendedAction: premium.recommendedAction,
    premiumData: premium.premiumData,
  });

  return {
    ...premium,
    evidenceHash: premium.evidenceHash ?? hashEvidence(premium),
  };
}

export async function enrichWithPremiumEvidence(
  assessed: AssessedDataPoint,
  config: X402Config,
  logger?: Logger,
): Promise<AssessedDataPoint> {
  const resource = resourceUrl(assessed.assetId, config);
  const requirement = buildPaymentRequirements(assessed.assetId, config);
  const payload = buildMockPaymentPayload(resource, requirement);
  const premium = await fetchPremiumRiskScore(assessed.assetId, config, logger);
  return applyPremiumRiskEvidence(
    assessed,
    premium,
    paymentTrace(config, resource, requirement, payload),
  );
}
