# DoraHacks Submission Draft

Use this as the working copy for the DoraHacks BUIDL submission page after the public repository, demo video, and live Testnet hashes exist.

## Project Name

Casper RWA Oracle Agent

## Track

Casper Innovation Track

## Short Description

An autonomous Casper RWA oracle agent that evaluates off-chain asset signals, buys premium evidence through x402 when confidence is borderline, and prepares verifiable Casper Testnet data publication with evidence hashes and oracle reputation.

## Long Description

Casper RWA Oracle Agent turns off-chain real-world asset signals into auditable Casper Testnet data. The TypeScript agent loads synthetic RWA cases, scores risk and confidence, requests paid premium evidence through an x402-style oracle only when a case is uncertain, hashes evidence provenance, and prepares Casper `publish_data` transactions.

The Odra smart contract implements a single `RwaOracle` module with oracle identity, data feed history, evidence hashes, reputation updates, slashing, and owner-only pause controls. Raw private asset, KYC, or identity documents are never stored on-chain or committed to the repository; the system records only values, confidence scores, timestamps, hashes, and reputation metadata.

The project is built for the Casper Agentic Buildathon 2026 qualification round and targets the RWA oracle direction with verifiable on-chain identity and reputation.

## Problem

RWA integrations often depend on manual review, opaque off-chain evidence, and centralized data providers. This makes it hard for DeFi builders and asset participants to understand why an RWA signal was published, which evidence supported it, and which oracle identity should be accountable.

## Solution

The agent autonomously triages RWA cases, pays for premium evidence only when extra data can change the decision, and links published data to evidence hashes on Casper Testnet. This creates a reproducible flow from perception, evidence lookup, decision, and transaction preparation to explorer-verifiable contract state.

## Casper AI Toolkit Usage

- Odra: smart contract implementation, tests, WASM build, and livenet deploy/register/publish runner.
- x402: HTTP-native paid evidence flow using local mock/reference mode and the CSPR.cloud facilitator shape for future live settlement.
- CSPR.cloud / CSPR.live: Testnet endpoints and explorer-grade verification path.
- CSPR.trade MCP: optional smoke-check enrichment path via `npm run mcp:check`.

## Technical Highlights

- `RwaOracle` Odra contract with oracle registry, data feed history, evidence hash storage, reputation updates, slashing, and owner-only pause.
- TypeScript agent with deterministic synthetic data loading, risk/confidence scoring, explicit decision boundary logic, JSONL logs, and mock/live publisher modes.
- x402 oracle server that returns `402 Payment Required`, verifies a mock/reference `PAYMENT-SIGNATURE`, and returns premium risk evidence.
- Borderline-case upgrade: `rwa-demo-warehouse-lease-009` starts as uncertain, triggers x402 paid evidence, and upgrades to a publish decision.
- Secret hygiene: `.env`, PEM/private keys, CSPR.cloud tokens, and raw private documents are excluded from git.

## Demo Walkthrough

1. Show README architecture and explain the RWA oracle problem.
2. Run `make verify` or the focused agent/oracle commands.
3. Show the agent logs for `PERCEPTION`, `EVIDENCE`, `DECISION`, and `PUBLISH`.
4. Show x402 logs: `PAYMENT_REQUIRED -> PAYMENT_SIGNED -> DATA_RECEIVED`.
5. Show the upgraded publish decision and Casper `publish_data` deploy JSON.
6. If live Testnet deployment is available, show the contract package hash and sample deploy in CSPR.live.

## Repository Link

[Public repository](https://github.com/wangyichang-studo/casper-rwa-oracle-agent)

## Demo Video Link

[Public demo video](https://youtu.be/PKxla50K31s)

## Testnet Contract Evidence

- Contract package: [hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8](https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8)
- Sample deploy: [dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b](https://testnet.cspr.live/deploy/dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b)

## Local Verification Evidence

Run:

```bash
make verify
```

The gate covers:

- scaffold and secret hygiene
- 7 Odra contract tests
- Odra WASM build
- livenet deploy binary check
- 16 TypeScript agent tests
- TypeScript build
- portable GitHub Actions CI quick check
- mock agent demo
- CSPR.trade MCP smoke check
- 3 x402 oracle-server tests
- local HTTP x402 demo evidence capture
- final artifact fill dry run
- git whitespace check

## Judging Criteria Mapping

| Criterion | Evidence |
| --- | --- |
| Technical execution | Odra contract, TypeScript agent, oracle server, `make verify`, and checkpoint records. |
| Innovation and originality | Autonomous RWA oracle decision loop with x402 paid evidence for only borderline cases. |
| AI / agentic systems | Agent logs show perception, evidence lookup, decision, and publish preparation without manual intervention. |
| Real-world applicability | RWA evidence provenance, confidence scoring, and oracle reputation are directly relevant to DeFi/RWA workflows. |
| User experience and design | README, architecture/decision diagrams, generated charts, demo script, contribution guide, final artifact fill script, and one-command verification gate. |
| Working smart contracts | Odra tests, WASM build, and livenet deploy/register/publish runner. |
| Long-term launch plan | Roadmap covers Testnet deployment, live x402 settlement, CSPR.trade MCP enrichment, and multi-oracle reputation. |
| Ecosystem impact | Uses Casper Testnet, Odra, x402, CSPR.cloud/CSPR.live, and optional CSPR.trade MCP. |

## Remaining Submission Actions

- Re-run `make verify` before final DoraHacks submission.
- Run `make submission-check` and confirm it passes before pressing submit.
