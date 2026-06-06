import { access } from "node:fs/promises";

import { hashEvidence } from "./evidence.js";
import type { AgentConfig, AssessedDataPoint, PublishResult, UnsignedDeployJson } from "./types.js";

export class ExternalBlockerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternalBlockerError";
  }
}

function unixTimestampSecs(date = new Date()): number {
  return Math.floor(date.getTime() / 1000);
}

function buildUnsignedDeployJson(
  assessed: AssessedDataPoint,
  config: AgentConfig,
): UnsignedDeployJson {
  return {
    chainName: config.chainName,
    contractPackageHash: config.contractPackageHash,
    entryPoint: "publish_data",
    args: {
      asset_id: assessed.assetId,
      value: String(assessed.value),
      timestamp: unixTimestampSecs(),
      confidence: assessed.confidence,
      evidence_hash: assessed.evidenceHash,
    },
  };
}

async function assertLocalKeyAvailable(secretKeyPath?: string): Promise<void> {
  if (!secretKeyPath) {
    throw new ExternalBlockerError("CASPER_SECRET_KEY_PATH is required for live mode");
  }
  await access(secretKeyPath).catch(() => {
    throw new ExternalBlockerError("local Casper Testnet secret key file is missing");
  });
}

export async function publishAssessedData(
  assessed: AssessedDataPoint,
  config: AgentConfig,
): Promise<PublishResult> {
  const unsignedDeployJson = buildUnsignedDeployJson(assessed, config);

  if (assessed.decision !== "publish") {
    return {
      mode: config.mode,
      submitted: false,
      contractPackageHash: config.contractPackageHash,
      unsignedDeployJson,
      message: `skipped ${assessed.assetId}: ${assessed.reason}`,
    };
  }

  if (config.mode === "mock") {
    const transactionHash = `mock-${hashEvidence(unsignedDeployJson).slice("sha256:".length, 40)}`;
    return {
      mode: "mock",
      submitted: true,
      transactionHash,
      contractPackageHash: config.contractPackageHash,
      unsignedDeployJson,
      message: `would publish to contract ${config.contractPackageHash}`,
    };
  }

  await assertLocalKeyAvailable(config.secretKeyPath);
  await import("casper-js-sdk");

  throw new ExternalBlockerError(
    "live Casper SDK submission is waiting on a deployed contract package hash and funded local key",
  );
}
