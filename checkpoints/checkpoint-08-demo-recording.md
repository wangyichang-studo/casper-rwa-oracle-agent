# Checkpoint 08 - Automated Demo Recording

Timestamp: 2026-06-07 23:00 CST

## Stage

Post-deployment demo packaging and video recording.

## Work Completed

- Added `scripts/demo.sh`, a one-command terminal demo with colored output, section titles, typewriter narration, graceful fallbacks, and no secret requirements.
- Added `docs/how-to-record-demo.md`, a short manual recording guide.
- Added `scripts/render-demo-video.sh` and `scripts/render-terminal-video.swift`, which render the demo transcript into a terminal-style MP4 for quick review and backup submission use.
- Added `.gitignore` entries for local demo video artifacts:
  - `demo/*.mp4`
  - `demo/*.mov`
- Generated a recorded demo video:
  - `/Users/wangyichang/Documents/黑客松/demo/casper-rwa-oracle-agent-demo.mp4`

## Demo Script Runtime

Default script runtime:

```text
139 seconds
```

The default pacing is suitable for a 2-3 minute recording. `--fast` is available only for automated transcript/video rendering.

## Recorded Video Evidence

- File: `/Users/wangyichang/Documents/黑客松/demo/casper-rwa-oracle-agent-demo.mp4`
- Duration: `146.000000` seconds
- Resolution: `2560x1440`
- Frame rate: `5/1`
- Size: `30,792,881` bytes, about `29 MB`
- Thumbnail checked at 45 seconds; frame is readable and nonblank.

## Script Coverage

The demo shows:

- Project intro and Casper Agentic Buildathon positioning.
- Odra smart contract tests, including 7 passing tests.
- Agent autonomous decision loop: data loaded, evidence hashed, publish/skip decisions, unsigned deploy JSON.
- x402 evidence flow: `PAYMENT_REQUIRED`, `PAYMENT_SIGNED`, `DATA_RECEIVED`, and decision upgrade.
- Live Casper Testnet deployment evidence:
  - contract package `hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8`
  - deploy transaction `0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0`
  - register transaction `d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490`
  - publish transaction `dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b`
- Casper AI Toolkit usage summary.

## Truncated Runtime Log

### First 50 Lines

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏗️  Casper RWA Oracle Agent — Live Demo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

An autonomous AI agent that:
• Collects off-chain RWA data (real estate, invoices, bonds)
• Runs AI risk assessment with confidence scoring
• Pays for premium data via x402 micropayments
• Publishes verified results to Casper Testnet

Built for: Casper Agentic Buildathon 2026
Track:     Casper Innovation Track (RWA + Agentic AI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📜 Phase 1: Smart Contract Tests (Rust / Odra Framework)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running 7 unit tests covering: Oracle registry, data feed, reputation, and slashing

  $ cd contracts/rwa-oracle && cargo odra test 2>&1 | tail -10

running 7 tests
test tests::registered_oracle_can_publish_data ... ok
test tests::history_returns_newest_data_first ... ok
test tests::unregistered_oracle_publish_is_rejected ... ok
test tests::duplicate_oracle_registration_is_rejected ... ok
test tests::paused_oracle_cannot_publish_data ... ok
test tests::pause_oracle_is_owner_only ... ok
test tests::reputation_updates_and_slash_are_owner_controlled ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.57s

  ✅ Odra contract tests passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🤖 Phase 2: AI Agent Autonomous Decision Loop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The agent autonomously: collects data → assesses risk → decides to publish or skip → builds Casper transactions

  $ cd agent-backend && npm run agent:mock 2>&1 | sed -n '1,90p'

> casper-rwa-oracle-agent-backend@0.1.0 agent:mock
> tsx src/agent.ts --once

[2026-06-07T14:57:35.737Z] [AGENT] [START] {"mode":"mock","chainName":"casper-test","nodeAddress":"https://node.testnet.cspr.cloud","contractPackageHash":"mock-contract-package-hash","secretKeyPath":"[REDACTED]"}
[2026-06-07T14:57:35.739Z] [PERCEPTION] [DATA_LOADED] {"count":4,"assets":["rwa-demo-invoice-001","rwa-demo-tbill-13w","rwa-demo-warehouse-lease-009","rwa-demo-gold-bars-404"]}
[2026-06-07T14:57:35.748Z] [EVIDENCE] [HASHED] {"assetId":"rwa-demo-invoice-001","source":"synthetic-invoice-risk-feed","evidenceHash":"sha256:90bc311bec6649854cffd48095a3684cdd777f4632dd6ed58c160285f5707a76"}
[2026-06-07T14:57:35.748Z] [DECISION] [PUBLISH] {"assetId":"rwa-demo-invoice-001","confidence":94,"reason":"confidence 94 meets publish threshold"}
```

### Last 20 Lines

```text
  Explorer:
    https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🧰 Casper AI Toolkit Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Odra Framework     — Smart contract development & deployment
  ✅ CSPR.cloud         — Testnet node access & API
  ✅ x402 Protocol      — Agent-to-agent micropayments
  ✅ CSPR.click         — Wallet integration (planned)
  ✅ MCP Server         — On-chain data queries (integrated)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✨ Demo Complete — Casper RWA Oracle Agent
  📧 Built by: Wang Yichang
  🏆 Casper Agentic Buildathon 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Demo runtime: 139 seconds
```

## Verification

- `./scripts/demo.sh --plain --fast`: passed.
- `./scripts/demo.sh --plain`: passed, 139 seconds.
- `./scripts/render-demo-video.sh`: passed.
- `ffprobe demo/casper-rwa-oracle-agent-demo.mp4`: 146 seconds, 2560x1440.
- `ffmpeg` thumbnail extraction at 45 seconds: passed, readable nonblank frame.
- `git diff --check`: passed.
- `make ci`: passed.

## Remaining Submission Actions

- Push public repository.
- Upload the generated MP4 or a manually recorded terminal version to YouTube as unlisted.
- Fill public repo/video URL and rerun `make submission-check`.
