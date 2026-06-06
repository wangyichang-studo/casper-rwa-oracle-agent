export type AgentMode = "mock" | "live";

export type SourceKind = "invoice" | "treasury" | "commodity" | "lease";

export type PublishDecision = "publish" | "review" | "skip";

export interface AgentConfig {
  mode: AgentMode;
  chainName: string;
  nodeAddress: string;
  contractPackageHash: string;
  secretKeyPath?: string;
  publishThreshold: number;
  intervalSeconds: number;
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
