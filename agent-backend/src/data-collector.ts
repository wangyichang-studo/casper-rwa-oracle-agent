import { readFile } from "node:fs/promises";

import type { RawDataPoint, SourceKind } from "./types.js";

interface RwaCaseFileEntry {
  assetId: string;
  source: string;
  sourceKind: SourceKind;
  rawValue: number;
  unit: string;
  expectedMin: number;
  expectedMax: number;
  reliability: number;
  volatilityBps: number;
  stalenessMinutes: number;
  evidence: {
    provider: string;
    reference: string;
    paid: boolean;
  };
}

const DEFAULT_CASES_URL = new URL("../data/rwa-cases.json", import.meta.url);

function observedAtFromStaleness(stalenessMinutes: number, now: Date): string {
  return new Date(now.getTime() - stalenessMinutes * 60_000).toISOString();
}

export async function loadSyntheticRwaCases(
  fileUrl: URL = DEFAULT_CASES_URL,
  now: Date = new Date(),
): Promise<RawDataPoint[]> {
  const raw = await readFile(fileUrl, "utf8");
  const entries = JSON.parse(raw) as RwaCaseFileEntry[];

  return entries.map((entry) => ({
    assetId: entry.assetId,
    source: entry.source,
    sourceKind: entry.sourceKind,
    rawValue: entry.rawValue,
    unit: entry.unit,
    expectedMin: entry.expectedMin,
    expectedMax: entry.expectedMax,
    reliability: entry.reliability,
    volatilityBps: entry.volatilityBps,
    observedAt: observedAtFromStaleness(entry.stalenessMinutes, now),
    evidence: entry.evidence,
  }));
}
