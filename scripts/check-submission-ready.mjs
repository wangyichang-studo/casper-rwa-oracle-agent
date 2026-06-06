#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const files = {
  readme: resolve(ROOT, "README.md"),
  readiness: resolve(ROOT, "docs/submission-readiness.md"),
  dorahacksDraft: resolve(ROOT, "docs/dorahacks-submission-draft.md"),
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

forbidMatch("README", contents.readme, /⏳|Contract package hash: pending|Public video URL: pending/i);
forbidMatch("Submission readiness", contents.readiness, /⏳|Pending public|Pending upload|Pending live|YOUR_/i);
forbidMatch("DoraHacks draft", contents.dorahacksDraft, /Pending public|Pending live|YOUR_ACCOUNT|YOUR_PUBLIC|YOUR_CONTRACT|YOUR_SAMPLE/i);

requireMatch("README repository URL", contents.readme, /Public repository URL: \[https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\//);
requireMatch("README demo URL", contents.readme, /Public video URL: \[Demo video\]\(https:\/\/[^)]+\)/);
requireMatch("README contract hash", contents.readme, /Contract package hash: `(?:hash-)?[0-9a-fA-F]{64}`/);
requireMatch("README contract explorer", contents.readme, /https:\/\/testnet\.cspr\.live\/contract-package\/hash-[0-9a-fA-F]{64}/);
requireMatch("README sample deploy", contents.readme, /https:\/\/testnet\.cspr\.live\/deploy\/[0-9a-fA-F]{64}/);
requireMatch("Readiness repo complete", contents.readiness, /\| Open-source repository contents \| ✅ Ready locally \| ✅ Public repo:/);
requireMatch("Readiness video complete", contents.readiness, /\| Public demo video \| ✅ Script ready \| ✅ Public video:/);
requireMatch("Readiness contract complete", contents.readiness, /\| Casper Testnet prototype path \| ✅ Deploy\/register\/publish runner implemented \| ✅ Contract package:/);
requireMatch("DoraHacks draft repo link", contents.dorahacksDraft, /## Repository Link\s+\[Public repository\]\(https:\/\/[^)]+\)/);
requireMatch("DoraHacks draft video link", contents.dorahacksDraft, /## Demo Video Link\s+\[Public demo video\]\(https:\/\/[^)]+\)/);
requireMatch("DoraHacks draft contract evidence", contents.dorahacksDraft, /## Testnet Contract Evidence\s+- Contract package: \[(?:hash-)?[0-9a-fA-F]{64}\]/);

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
