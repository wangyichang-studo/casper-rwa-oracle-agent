#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const README = resolve(ROOT, "README.md");
const READINESS = resolve(ROOT, "docs/submission-readiness.md");
const DORAHACKS_DRAFT = resolve(ROOT, "docs/dorahacks-submission-draft.md");

const { values } = parseArgs({
  options: {
    "repo-url": { type: "string" },
    "demo-url": { type: "string" },
    "contract-package-hash": { type: "string" },
    "deploy-hash": { type: "string" },
    "social-url": { type: "string" },
    "dry-run": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

function printHelp() {
  console.log(`Usage:
  node scripts/fill-submission-artifacts.mjs [options]

Options:
  --repo-url URL                 Public GitHub/GitLab/Bitbucket repository URL
  --demo-url URL                 Public demo video URL
  --contract-package-hash HASH   Casper Testnet contract package hash
  --deploy-hash HASH             Sample Casper Testnet deploy hash
  --social-url URL               Optional project social/community URL
  --dry-run                      Validate and preview without writing files
  -h, --help                     Show this help
`);
}

if (values.help) {
  printHelp();
  process.exit(0);
}

const repoUrl = values["repo-url"];
const demoUrl = values["demo-url"];
const contractPackageHash = values["contract-package-hash"];
const deployHash = values["deploy-hash"];
const socialUrl = values["social-url"];
const dryRun = values["dry-run"];

function fail(message) {
  console.error(`fill-submission-artifacts: ${message}`);
  process.exit(1);
}

function validateUrl(label, value, allowedHosts) {
  if (!value) {
    return;
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${label} must be a valid URL`);
  }
  if (!["https:"].includes(url.protocol)) {
    fail(`${label} must use https`);
  }
  if (allowedHosts.length > 0 && !allowedHosts.some((host) => url.hostname.endsWith(host))) {
    fail(`${label} host must be one of: ${allowedHosts.join(", ")}`);
  }
}

function validateHash(label, value) {
  if (!value) {
    return;
  }
  if (!/^(hash-)?[0-9a-fA-F]{64}$/.test(value)) {
    fail(`${label} must be 64 hex characters, with optional hash- prefix`);
  }
}

validateUrl("repo-url", repoUrl, ["github.com", "gitlab.com", "bitbucket.org"]);
validateUrl("demo-url", demoUrl, []);
validateUrl("social-url", socialUrl, []);
validateHash("contract-package-hash", contractPackageHash);
validateHash("deploy-hash", deployHash);

if (!repoUrl && !demoUrl && !contractPackageHash && !deployHash && !socialUrl) {
  printHelp();
  fail("provide at least one artifact value");
}

function contractExplorerUrl(hash) {
  const normalized = hash.startsWith("hash-") ? hash : `hash-${hash}`;
  return `https://testnet.cspr.live/contract-package/${normalized}`;
}

function deployExplorerUrl(hash) {
  const normalized = hash.startsWith("hash-") ? hash.slice(5) : hash;
  return `https://testnet.cspr.live/deploy/${normalized}`;
}

function replaceLine(text, prefix, replacement) {
  const lines = text.split("\n");
  const index = lines.findIndex((line) => line.startsWith(prefix));
  if (index === -1) {
    fail(`could not find line starting with '${prefix}'`);
  }
  lines[index] = replacement;
  return lines.join("\n");
}

function upsertSectionLines(text, heading, linesToAdd) {
  if (linesToAdd.length === 0) {
    return text;
  }
  const marker = `## ${heading}`;
  const start = text.indexOf(marker);
  if (start === -1) {
    fail(`could not find section '${marker}'`);
  }
  const next = text.indexOf("\n## ", start + marker.length);
  const end = next === -1 ? text.length : next;
  const prefix = text.slice(0, start);
  const section = text.slice(start, end);
  const rest = text.slice(end);
  const filtered = section
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("- Public repository URL:") &&
        !line.startsWith("- Contract explorer:") &&
        !line.startsWith("- Sample deploy:") &&
        !line.startsWith("- Project social:"),
    );
  const insertionIndex = filtered.findIndex((line) => line.startsWith("- Explorer base:"));
  const insertAt = insertionIndex === -1 ? filtered.length : insertionIndex + 1;
  filtered.splice(insertAt, 0, ...linesToAdd);
  return `${prefix}${filtered.join("\n")}${rest}`;
}

function updateReadme(text) {
  let next = text;
  const artifactLines = [];

  if (repoUrl) {
    artifactLines.push(`- Public repository URL: [${repoUrl}](${repoUrl})`);
  }
  if (contractPackageHash) {
    next = replaceLine(
      next,
      "- Contract package hash:",
      `- Contract package hash: \`${contractPackageHash}\``,
    );
    artifactLines.push(
      `- Contract explorer: [CSPR.live contract package](${contractExplorerUrl(contractPackageHash)})`,
    );
  }
  if (deployHash) {
    artifactLines.push(`- Sample deploy: [CSPR.live deploy](${deployExplorerUrl(deployHash)})`);
  }
  if (socialUrl) {
    artifactLines.push(`- Project social: [${socialUrl}](${socialUrl})`);
  }

  next = upsertSectionLines(next, "Smart Contract (Testnet)", artifactLines);

  if (demoUrl) {
    next = replaceLine(next, "Public video URL:", `Public video URL: [Demo video](${demoUrl})`);
  }

  if (repoUrl) {
    next = next.replace(
      "- ⏳ Public GitHub/GitLab/Bitbucket remote URL",
      "- ✅ Public GitHub/GitLab/Bitbucket remote URL",
    );
  }
  if (contractPackageHash) {
    next = next.replace(
      "- ⏳ Live Testnet contract hash after key material is provided",
      "- ✅ Live Testnet contract hash",
    );
  }
  if (demoUrl) {
    next = next.replace("- ⏳ Public demo video URL", "- ✅ Public demo video URL");
  }

  return next;
}

function replaceReadinessRow(text, artifactPrefix, replacement) {
  const lines = text.split("\n");
  const index = lines.findIndex((line) => line.startsWith(`| ${artifactPrefix}`));
  if (index === -1) {
    fail(`could not find readiness row '${artifactPrefix}'`);
  }
  lines[index] = replacement;
  return lines.join("\n");
}

function updateReadiness(text) {
  let next = text;

  if (repoUrl) {
    next = replaceReadinessRow(
      next,
      "Open-source repository contents",
      `| Open-source repository contents | ✅ Ready locally | ✅ Public repo: [link](${repoUrl}) | Keep repo public through judging. |`,
    );
  }
  if (contractPackageHash) {
    next = replaceReadinessRow(
      next,
      "Casper Testnet prototype path",
      `| Casper Testnet prototype path | ✅ Deploy/register/publish runner implemented | ✅ Contract package: [${contractPackageHash}](${contractExplorerUrl(contractPackageHash)}) | Keep Testnet account funded for any re-demo. |`,
    );
  }
  if (contractPackageHash || deployHash) {
    const proof = [
      contractPackageHash
        ? `contract [${contractPackageHash}](${contractExplorerUrl(contractPackageHash)})`
        : undefined,
      deployHash ? `deploy [${deployHash}](${deployExplorerUrl(deployHash)})` : undefined,
    ]
      .filter(Boolean)
      .join(", ");
    next = replaceReadinessRow(
      next,
      "Transaction-generating on-chain component",
      `| Transaction-generating on-chain component | ✅ Odra tests, WASM build, and livenet deploy binary check pass | ✅ ${proof} | Preserve deploy logs for final submission evidence. |`,
    );
  }
  if (demoUrl) {
    next = replaceReadinessRow(
      next,
      "Public demo video",
      `| Public demo video | ✅ Script ready | ✅ Public video: [link](${demoUrl}) | Keep the video URL public through judging. |`,
    );
  }

  const remaining = [];
  if (!contractPackageHash) {
    remaining.push("- Casper Testnet key path and funded account.");
    remaining.push("- Contract package hash after live deploy.");
  }
  if (!repoUrl) {
    remaining.push("- Public repository URL.");
  }
  if (!demoUrl) {
    remaining.push("- Public demo video URL.");
  }
  remaining.push("- CSPR.cloud x402 facilitator authorization token if live settlement is recorded.");
  if (!socialUrl) {
    remaining.push("- Optional project social link for the long-term launch plan section.");
  }

  next = next.replace(
    /## Remaining External Inputs\n[\s\S]*$/,
    `## Remaining External Inputs\n\n${remaining.join("\n")}\n`,
  );

  return next;
}

function replaceSectionBody(text, heading, body) {
  const marker = `## ${heading}`;
  const start = text.indexOf(marker);
  if (start === -1) {
    fail(`could not find section '${marker}'`);
  }
  const next = text.indexOf("\n## ", start + marker.length);
  const end = next === -1 ? text.length : next;
  const prefix = text.slice(0, start);
  const rest = text.slice(end);
  return `${prefix}${marker}\n\n${body.trim()}\n${rest}`;
}

function updateDorahacksDraft(text) {
  let next = text;

  if (repoUrl) {
    next = replaceSectionBody(
      next,
      "Repository Link",
      `[Public repository](${repoUrl})`,
    );
  }

  if (demoUrl) {
    next = replaceSectionBody(
      next,
      "Demo Video Link",
      `[Public demo video](${demoUrl})`,
    );
  }

  if (contractPackageHash || deployHash) {
    const lines = [];
    if (contractPackageHash) {
      lines.push(`- Contract package: [${contractPackageHash}](${contractExplorerUrl(contractPackageHash)})`);
    }
    if (deployHash) {
      lines.push(`- Sample deploy: [${deployHash}](${deployExplorerUrl(deployHash)})`);
    }
    next = replaceSectionBody(next, "Testnet Contract Evidence", lines.join("\n"));
  }

  if (repoUrl || demoUrl || contractPackageHash || deployHash) {
    const actions = [];
    if (!repoUrl) {
      actions.push("- Create and push to a public GitHub/GitLab/Bitbucket repository.");
    }
    if (!contractPackageHash || !deployHash) {
      actions.push("- Provide Casper Testnet key material and a funded account for live deployment.");
    }
    if (!demoUrl) {
      actions.push("- Record and upload the public demo video.");
    }
    actions.push("- Re-run `make verify` before final DoraHacks submission.");
    actions.push("- Run `make submission-check` and confirm it passes before pressing submit.");
    next = replaceSectionBody(next, "Remaining Submission Actions", actions.join("\n"));
  }

  return next;
}

const readmeBefore = readFileSync(README, "utf8");
const readinessBefore = readFileSync(READINESS, "utf8");
const dorahacksDraftBefore = readFileSync(DORAHACKS_DRAFT, "utf8");
const readmeAfter = updateReadme(readmeBefore);
const readinessAfter = updateReadiness(readinessBefore);
const dorahacksDraftAfter = updateDorahacksDraft(dorahacksDraftBefore);

if (dryRun) {
  console.log("Dry run passed. Files that would change:");
  if (readmeAfter !== readmeBefore) {
    console.log(`- ${README}`);
  }
  if (readinessAfter !== readinessBefore) {
    console.log(`- ${READINESS}`);
  }
  if (dorahacksDraftAfter !== dorahacksDraftBefore) {
    console.log(`- ${DORAHACKS_DRAFT}`);
  }
  process.exit(0);
}

writeFileSync(README, readmeAfter);
writeFileSync(READINESS, readinessAfter);
writeFileSync(DORAHACKS_DRAFT, dorahacksDraftAfter);
console.log("Updated submission artifacts:");
if (readmeAfter !== readmeBefore) {
  console.log(`- ${README}`);
}
if (readinessAfter !== readinessBefore) {
  console.log(`- ${READINESS}`);
}
if (dorahacksDraftAfter !== dorahacksDraftBefore) {
  console.log(`- ${DORAHACKS_DRAFT}`);
}
