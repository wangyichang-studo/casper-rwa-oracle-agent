#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const files = {
  readme: resolve(ROOT, "README.md"),
  readiness: resolve(ROOT, "docs/submission-readiness.md"),
  dorahacksDraft: resolve(ROOT, "docs/dorahacks-submission-draft.md"),
  testnetEvidence: resolve(ROOT, "docs/testnet_evidence.md"),
  architecture: resolve(ROOT, "docs/architecture.mmd"),
  decisionFlow: resolve(ROOT, "docs/decision_flow.mmd"),
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, "utf8")]),
);

const failures = [];

function requireMatch(label, text, pattern) {
  if (!pattern.test(text)) {
    failures.push(`${label}: missing ${pattern}`);
  }
}

function forbidMatch(label, text, pattern) {
  if (pattern.test(text)) {
    failures.push(`${label}: forbidden pending/placeholder text matched ${pattern}`);
  }
}

function requireFile(label, path, minBytes = 1) {
  if (!existsSync(path)) {
    failures.push(`${label}: missing file ${path}`);
    return;
  }
  const size = statSync(path).size;
  if (size < minBytes) {
    failures.push(`${label}: file too small ${path} (${size} bytes)`);
  }
}

forbidMatch("README", contents.readme, /⏳|Contract package hash: pending|Public video URL: pending/i);
forbidMatch("Submission readiness", contents.readiness, /⏳|Pending public|Pending upload|Pending live|YOUR_/i);
forbidMatch("DoraHacks draft", contents.dorahacksDraft, /Pending public|Pending live|YOUR_ACCOUNT|YOUR_PUBLIC|YOUR_CONTRACT|YOUR_SAMPLE/i);

requireMatch("README repository URL", contents.readme, /Public repository URL: \[https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\//);
requireMatch("README demo URL", contents.readme, /Public video URL: \[Demo video\]\(https:\/\/[^)]+\)/);
requireMatch("README contract hash", contents.readme, /Contract package hash: `(?:hash-)?[0-9a-fA-F]{64}`/);
requireMatch("README contract explorer", contents.readme, /https:\/\/testnet\.cspr\.live\/contract-package\/hash-[0-9a-fA-F]{64}/);
requireMatch("README sample deploy", contents.readme, /https:\/\/testnet\.cspr\.live\/deploy\/[0-9a-fA-F]{64}/);
requireMatch("README architecture source", contents.readme, /docs\/architecture\.mmd/);
requireMatch("README confidence chart", contents.readme, /docs\/confidence_distribution\.png/);
requireMatch("README x402 chart", contents.readme, /docs\/x402_trigger_rate\.png/);
requireMatch("README timeline chart", contents.readme, /docs\/agent_timeline\.png/);
requireMatch("README JSONL command", contents.readme, /npm run agent:json/);
requireMatch("README honest batch statement", contents.readme, /does not claim 20\+ live transactions/);
requireMatch("Readiness repo complete", contents.readiness, /\| Open-source repository contents \| ✅ Ready locally \| ✅ Public repo:/);
requireMatch("Readiness video complete", contents.readiness, /\| Public demo video \| ✅ Script ready \| ✅ Public video:/);
requireMatch("Readiness contract complete", contents.readiness, /\| Casper Testnet prototype path \| ✅ Deploy\/register\/publish runner implemented \| ✅ Contract package:/);
requireMatch("DoraHacks draft repo link", contents.dorahacksDraft, /## Repository Link\s+\[Public repository\]\(https:\/\/[^)]+\)/);
requireMatch("DoraHacks draft video link", contents.dorahacksDraft, /## Demo Video Link\s+\[Public demo video\]\(https:\/\/[^)]+\)/);
requireMatch("DoraHacks draft contract evidence", contents.dorahacksDraft, /## Testnet Contract Evidence\s+- Contract package: \[(?:hash-)?[0-9a-fA-F]{64}\]/);
requireMatch("Testnet evidence has deploy tx", contents.testnetEvidence, /0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0/);
requireMatch("Testnet evidence has register tx", contents.testnetEvidence, /d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490/);
requireMatch("Testnet evidence has publish tx", contents.testnetEvidence, /dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b/);
requireMatch("Architecture includes decision gate", contents.architecture, /Decision Gate/);
requireMatch("Decision flow includes x402 action", contents.decisionFlow, /pay_for_premium/);

requireFile("Confidence distribution chart", resolve(ROOT, "docs/confidence_distribution.png"), 1024);
requireFile("x402 trigger chart", resolve(ROOT, "docs/x402_trigger_rate.png"), 1024);
requireFile("Agent timeline chart", resolve(ROOT, "docs/agent_timeline.png"), 1024);

if (failures.length > 0) {
  console.error("Submission readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("\nFill external artifacts first, then rerun:");
  console.error("node scripts/fill-submission-artifacts.mjs --repo-url ... --demo-url ... --contract-package-hash ... --deploy-hash ...");
  process.exit(1);
}

console.log("Submission readiness check passed.");
