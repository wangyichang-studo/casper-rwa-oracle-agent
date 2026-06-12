import type { AssessedDataPoint, DecisionMakerOptions, DecisionOutcome } from "./types.js";

function inPremiumEvidenceBand(confidence: number, options: DecisionMakerOptions): boolean {
  return confidence >= options.premiumEvidenceMinConfidence &&
    confidence <= options.premiumEvidenceMaxConfidence;
}

export function decideNextAction(
  assessed: AssessedDataPoint,
  options: DecisionMakerOptions,
): DecisionOutcome {
  if (assessed.decision === "skip") {
    return {
      action: "skip",
      shouldRequestPremiumEvidence: false,
      publishDecision: "skip",
      confidenceScore: assessed.confidence,
      reason: `confidence ${assessed.confidence} is below the salvage band`,
    };
  }

  if (options.x402Enabled && inPremiumEvidenceBand(assessed.confidence, options)) {
    return {
      action: "pay_for_premium",
      shouldRequestPremiumEvidence: true,
      publishDecision: "review",
      confidenceScore: assessed.confidence,
      reason: `confidence ${assessed.confidence} is within the premium evidence band ${options.premiumEvidenceMinConfidence}-${options.premiumEvidenceMaxConfidence}`,
    };
  }

  if (assessed.decision === "publish" && assessed.confidence >= options.publishThreshold) {
    return {
      action: "publish_directly",
      shouldRequestPremiumEvidence: false,
      publishDecision: "publish",
      confidenceScore: assessed.confidence,
      reason: `confidence ${assessed.confidence} is above the premium evidence band`,
    };
  }

  return {
    action: "human_review",
    shouldRequestPremiumEvidence: false,
    publishDecision: "review",
    confidenceScore: assessed.confidence,
    reason: `confidence ${assessed.confidence} requires review without premium evidence`,
  };
}
