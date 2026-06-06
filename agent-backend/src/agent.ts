import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadAgentConfig } from "./config.js";
import { loadSyntheticRwaCases } from "./data-collector.js";
import { createLogger } from "./logger.js";
import { assessBatch } from "./risk-assessor.js";
import { publishAssessedData } from "./chain-publisher.js";
import { enrichWithPremiumEvidence, shouldRequestPremiumEvidence } from "./x402-client.js";
import type { AgentConfig, AgentLoopResult, Logger } from "./types.js";

export async function runAgentOnce(
  config: AgentConfig = loadAgentConfig(),
  logger: Logger = createLogger(),
): Promise<AgentLoopResult> {
  logger.event("AGENT", "START", {
    mode: config.mode,
    chainName: config.chainName,
    nodeAddress: config.nodeAddress,
    contractPackageHash: config.contractPackageHash,
    secretKeyPath: config.secretKeyPath,
  });

  const rawPoints = await loadSyntheticRwaCases();
  logger.event("PERCEPTION", "DATA_LOADED", {
    count: rawPoints.length,
    assets: rawPoints.map((point) => point.assetId),
  });

  const initialAssessments = assessBatch(rawPoints, { publishThreshold: config.publishThreshold });
  const assessed = [];
  const published = [];
  const skipped = [];

  for (const initialPoint of initialAssessments) {
    let point = initialPoint;
    if (shouldRequestPremiumEvidence(point, config.x402)) {
      try {
        point = await enrichWithPremiumEvidence(point, config.x402, logger);
      } catch (error) {
        logger.event("X402", "ERROR", {
          assetId: point.assetId,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
    assessed.push(point);

    logger.event("EVIDENCE", "HASHED", {
      assetId: point.assetId,
      source: point.raw.source,
      evidenceHash: point.evidenceHash,
      premiumEvidenceHash: point.premiumEvidence?.evidenceHash,
    });
    logger.event("DECISION", point.decision.toUpperCase(), {
      assetId: point.assetId,
      confidence: point.confidence,
      reason: point.reason,
    });

    const result = await publishAssessedData(point, config);
    if (result.submitted) {
      published.push(result);
      logger.event("PUBLISH", "TRANSACTION_PREPARED", {
        assetId: point.assetId,
        mode: result.mode,
        transactionHash: result.transactionHash,
        contractPackageHash: result.contractPackageHash,
        unsignedDeployJson: result.unsignedDeployJson,
      });
    } else {
      skipped.push(point);
      logger.event("PUBLISH", "SKIPPED", {
        assetId: point.assetId,
        message: result.message,
      });
    }
  }

  logger.event("AGENT", "COMPLETE", {
    assessed: assessed.length,
    published: published.length,
    skipped: skipped.length,
  });

  return { assessed, published, skipped };
}

export function isDirectCliEntrypoint(metaUrl: string, argvEntry: string | undefined): boolean {
  return argvEntry !== undefined && fileURLToPath(metaUrl) === resolve(argvEntry);
}

async function main(): Promise<void> {
  const once = process.argv.includes("--once");
  const config = loadAgentConfig();
  const logger = createLogger();

  await runAgentOnce(config, logger);

  if (!once) {
    logger.event("AGENT", "SLEEP", {
      intervalSeconds: config.intervalSeconds,
      note: "repeat loop disabled in this prototype run; pass --once for demo mode",
    });
  }
}

if (isDirectCliEntrypoint(import.meta.url, process.argv[1])) {
  main().catch((error: unknown) => {
    const logger = createLogger();
    logger.event("AGENT", "ERROR", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
    });
    process.exitCode = 1;
  });
}
