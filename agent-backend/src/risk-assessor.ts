import { hashEvidence } from "./evidence.js";
import type { AssessedDataPoint, PublishDecision, RawDataPoint } from "./types.js";

export interface RiskAssessorOptions {
  publishThreshold: number;
  reviewThreshold?: number;
  now?: Date;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function ageMinutes(observedAt: string, now: Date): number {
  const observed = Date.parse(observedAt);
  if (!Number.isFinite(observed)) {
    return 24 * 60;
  }
  return Math.max(0, (now.getTime() - observed) / 60_000);
}

function rangePenalty(point: RawDataPoint): number {
  if (point.rawValue >= point.expectedMin && point.rawValue <= point.expectedMax) {
    return 0;
  }

  const range = Math.max(1, point.expectedMax - point.expectedMin);
  const distance =
    point.rawValue < point.expectedMin
      ? point.expectedMin - point.rawValue
      : point.rawValue - point.expectedMax;

  return clamp(25 + (distance / range) * 30, 25, 55);
}

function decisionForScore(score: number, publishThreshold: number, reviewThreshold: number): PublishDecision {
  if (score >= publishThreshold) {
    return "publish";
  }
  if (score >= reviewThreshold) {
    return "review";
  }
  return "skip";
}

function reasonForDecision(decision: PublishDecision, confidence: number): string {
  if (decision === "publish") {
    return `confidence ${confidence} meets publish threshold`;
  }
  if (decision === "review") {
    return `confidence ${confidence} requires human review`;
  }
  return `confidence ${confidence} is too low to publish`;
}

export function assessRisk(
  point: RawDataPoint,
  options: RiskAssessorOptions,
): AssessedDataPoint {
  const now = options.now ?? new Date();
  const reviewThreshold = options.reviewThreshold ?? 40;
  const freshnessPenalty = ageMinutes(point.observedAt, now) > 60
    ? clamp((ageMinutes(point.observedAt, now) - 60) / 8, 0, 30)
    : 0;
  const volatilityPenalty = clamp(point.volatilityBps / 120, 0, 25);
  const anomalyPenalty = rangePenalty(point);
  const confidence = Math.round(
    clamp(point.reliability * 100 - freshnessPenalty - volatilityPenalty - anomalyPenalty, 0, 100),
  );
  const decision = decisionForScore(confidence, options.publishThreshold, reviewThreshold);

  const evidenceHash = hashEvidence({
    assetId: point.assetId,
    evidence: point.evidence,
    observedAt: point.observedAt,
    rawValue: point.rawValue,
    source: point.source,
    unit: point.unit,
  });

  return {
    assetId: point.assetId,
    value: Math.round(point.rawValue),
    unit: point.unit,
    confidence,
    decision,
    evidenceHash,
    reason: reasonForDecision(decision, confidence),
    raw: point,
  };
}

export function assessBatch(
  points: RawDataPoint[],
  options: RiskAssessorOptions,
): AssessedDataPoint[] {
  return points.map((point) => assessRisk(point, options));
}
