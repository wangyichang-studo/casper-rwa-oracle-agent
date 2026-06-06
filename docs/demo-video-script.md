# Demo Video Script

Target length: 3 to 5 minutes.

Recording mode: use mock/reference x402 by default. If the Testnet key, funded account, and deployed contract package hash are available before recording, add the live CSPR.live proof segment.

## Shot Plan

| Time | Screen | Narration |
| --- | --- | --- |
| 0:00-0:30 | README title and architecture diagram | "This is Casper RWA Oracle Agent, an autonomous agent that evaluates real-world asset data, buys premium evidence only when needed, and prepares verifiable Casper Testnet updates." |
| 0:30-1:10 | Terminal in `agent-backend`, run `npm run agent:mock` | "The agent starts with synthetic RWA cases. It hashes evidence metadata, scores each case, and decides whether to publish, review, or block." |
| 1:10-2:00 | Terminal logs around `rwa-demo-warehouse-lease-009` | "This warehouse lease is borderline. Instead of blindly publishing or rejecting, the agent requests premium evidence from an x402 paid oracle." |
| 2:00-2:45 | x402 logs: `PAYMENT_REQUIRED`, `PAYMENT_SIGNED`, `DATA_RECEIVED` | "The oracle replies with HTTP 402. The agent builds a Casper x402 payment payload, retries with `PAYMENT-SIGNATURE`, and receives premium risk evidence." |
| 2:45-3:30 | Publish decision and Casper deploy JSON | "With the premium risk score, the agent upgrades the case to publish and prepares a Casper `publish_data` transaction containing the value, confidence, timestamp, and evidence hash." |
| 3:30-4:00 | Odra contract file or test output | "The Odra contract tracks oracle identity, data feed history, evidence hashes, reputation, slashing, and owner-only pause controls. The test suite verifies the security rules." |
| 4:00-4:30 | CSPR.live or README Smart Contract section | "When the local Testnet key is available, the same runner deploys, registers the oracle, publishes data, and prints the contract package hash for explorer verification." |
| 4:30-5:00 | Roadmap section | "The next steps are real facilitator settlement, additional RWA data providers, CSPR.trade MCP enrichment, and a multi-oracle reputation network on Casper." |

## Terminal Commands To Record

Contract tests:

```bash
cd contracts/rwa-oracle
cargo odra test
```

Agent mock run:

```bash
cd agent-backend
npm test
npm run build
npm run agent:mock
```

Local HTTP x402 run:

```bash
make demo-evidence
```

This writes ignored evidence logs under `tmp/` and confirms `PAYMENT_REQUIRED`, `PAYMENT_SIGNED`, `DATA_RECEIVED`, `TRANSACTION_PREPARED`, and `COMPLETE`.

Optional live Testnet segment after keys are available:

```bash
cd contracts/rwa-oracle
DYLD_LIBRARY_PATH="$(rustc --print sysroot)/lib" cargo odra build -c RwaOracle
cargo run --bin deploy --features livenet
```

## Lines To Emphasize

- The agent pays only for borderline cases, which keeps the workflow economically rational.
- x402 is used as an HTTP-native evidence purchase flow, not as a decorative integration.
- Raw RWA or KYC documents stay off-chain; the contract stores evidence hashes and scores.
- The current local demo is deterministic and credential-safe. Live Casper settlement is prepared but requires local secrets that are intentionally not committed.

## Required Before Upload

- Replace the README demo URL status with the public video URL.
- If live Testnet deployment is available, add the contract package hash and at least one deploy hash to the README.
- Keep private keys, `.env` files, facilitator tokens, and raw documents out of the recording.
