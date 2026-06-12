export type AgentMode = "mock" | "live";

export type SourceKind = "invoice" | "treasury" | "commodity" | "lease";

export type PublishDecision = "publish" | "review" | "skip";

export type X402Mode = "mock" | "live";

export type StructuredLogFormat = "pretty" | "json";

export type DecisionOutcomeAction =
  | "pay_for_premium"
  | "publish_directly"
  | "human_review"
  | "skip";

export interface DecisionMakerOptions {
  publishThreshold: number;
  premiumEvidenceMinConfidence: number;
  premiumEvidenceMaxConfidence: number;
  x402Enabled: boolean;
}

export interface DecisionOutcome {
  action: DecisionOutcomeAction;
  shouldRequestPremiumEvidence: boolean;
  publishDecision: PublishDecision;
  confidenceScore: number;
  reason: string;
}

export interface X402Config {
  enabled: boolean;
  mode: X402Mode;
  oracleBaseUrl: string;
  facilitatorUrl?: string;
  facilitatorToken?: string;
  network: "casper:casper" | "casper:casper-test";
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  premiumEvidenceMinConfidence: number;
  premiumEvidenceMaxConfidence: number;
}

export interface AgentConfig {
  mode: AgentMode;
  chainName: string;
  nodeAddress: string;
  contractPackageHash: string;
  secretKeyPath?: string;
  publishThreshold: number;
  intervalSeconds: number;
  x402: X402Config;
}

export interface EvidenceMetadata {
  provider: string;
  reference: string;
  paid: boolean;
}

export interface RawDataPoint {
  assetId: string;
  source: string;
  sourceKind: SourceKind;
  rawValue: number;
  unit: string;
  expectedMin: number;
  expectedMax: number;
  reliability: number;
  volatilityBps: number;
  observedAt: string;
  evidence: EvidenceMetadata;
}

export interface AssessedDataPoint {
  assetId: string;
  value: number;
  unit: string;
  confidence: number;
  decision: PublishDecision;
  evidenceHash: string;
  reason: string;
  raw: RawDataPoint;
  premiumEvidence?: PremiumRiskScore;
  x402Payment?: X402PaymentTrace;
}

export interface X402PaymentRequirements {
  scheme: "exact";
  network: "casper:casper" | "casper:casper-test";
  asset: string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra: {
    name: string;
    version: string;
    decimals?: string;
    symbol?: string;
  };
  resource?: string;
  description?: string;
}

export interface X402PaymentRequired {
  x402Version: 2;
  accepts: X402PaymentRequirements[];
}

export interface X402PaymentPayload {
  x402Version: 2;
  resource: {
    url: string;
    description?: string;
    mimeType?: string;
  };
  accepted: X402PaymentRequirements;
  payload: {
    signature: string;
    publicKey: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

export type PremiumRecommendedAction =
  | "publish_with_high_confidence"
  | "review_required"
  | "block";

export interface PremiumRiskScore {
  assetId: string;
  riskScore: number;
  riskFactors: string[];
  recommendedAction: PremiumRecommendedAction;
  premiumData: boolean;
  evidenceHash?: string;
}

export interface X402PaymentTrace {
  mode: X402Mode;
  resource: string;
  paymentRequirement: X402PaymentRequirements;
  paymentPayloadHash: string;
  settlementTransaction?: string;
}

export interface UnsignedDeployJson {
  chainName: string;
  contractPackageHash: string;
  entryPoint: "publish_data";
  args: {
    asset_id: string;
    value: string;
    timestamp: number;
    confidence: number;
    evidence_hash: string;
  };
}

export interface PublishResult {
  mode: AgentMode;
  submitted: boolean;
  transactionHash?: string;
  contractPackageHash: string;
  unsignedDeployJson: UnsignedDeployJson;
  message: string;
}

export interface AgentLoopResult {
  assessed: AssessedDataPoint[];
  published: PublishResult[];
  skipped: AssessedDataPoint[];
}

export interface Logger {
  event(module: string, action: string, detail?: Record<string, unknown>): string;
}
