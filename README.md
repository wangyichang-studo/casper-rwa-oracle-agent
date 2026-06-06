# Casper RWA Oracle Agent

Agentic RWA oracle prototype for the Casper Agentic Buildathon 2026.

The project will build an autonomous oracle agent that gathers synthetic off-chain RWA signals, requests paid premium evidence through x402, runs AI-style risk and confidence scoring, and publishes verified data plus oracle reputation updates to Casper Testnet through Odra smart contracts.

## Buildathon Target

- Track: Casper Innovation Track
- Focus: Agentic AI + Real-World Assets (RWA)
- Required final artifacts:
  - Working Casper Testnet prototype with a transaction-generating on-chain component
  - Open-source GitHub/GitLab/Bitbucket repository with README and usage docs
  - Public demo video explaining the project and walkthrough

## Current Phase

Phase 3 has passed Manus review. Phase 4 adds the x402 paid evidence flow in mock/reference mode while live CSPR.cloud facilitator credentials, real Casper EIP-712 payment signing material, and Testnet publish keys remain pending.

## Planned Architecture

```mermaid
flowchart LR
  CaseData["Synthetic RWA market data"] --> Agent["RWA Oracle Agent"]
  Agent --> Policy["Risk and confidence model"]
  Agent --> Oracle["x402 Evidence Oracle"]
  Oracle --> Facilitator["CSPR.cloud x402 Facilitator or local casper-x402 fallback"]
  Agent --> Contract["OracleRegistry + DataFeed + ReputationScore"]
  Contract --> Explorer["CSPR.cloud / CSPR.live verification"]
```

## Repository Layout

- `contracts/`: Odra smart contract workspace planned for oracle registry, data feed, and reputation modules
  - `contracts/rwa-oracle/`: Phase 1 Odra contract crate and unit tests
- `agent-backend/`: TypeScript oracle agent for RWA data evaluation, evidence hashing, and mock/live transaction publishing
- `oracle-server/`: x402 evidence oracle planned for paid RWA risk and market evidence
  - `oracle-server/`: Phase 4 HTTP 402 paid RWA risk-score endpoint
- `docs/`: official rules, implementation guide, resources, and demo planning
- `checkpoints/`: Codex checkpoint reports for Manus review
- `manus_outbox/`: exact messages prepared for Manus submission
- `manus_feedback/`: saved Manus feedback and feedback log
- `skills/casper-buildathon-rwa-loop/`: project-specific Codex skill/guide

## Secret Handling

Do not commit private keys, API keys, CSPR.cloud tokens, `.env` files, or raw private asset documents. Final implementation will use environment variables and local key paths only.

## Phase 1 Contract Verification

The Odra crate uses nightly Rust because `odra-macros 2.7.2` currently requires a nightly feature. The contract crate includes `contracts/rwa-oracle/rust-toolchain.toml`.

Run:

```bash
cd contracts/rwa-oracle
cargo odra test
```

Latest local result: 7 tests passed for duplicate registration rejection, registered publish success with evidence hash, unregistered publish rejection, reputation/slash behavior, newest-first history reads, paused-oracle publish rejection, and owner-only pause enforcement.

## Phase 2 Testnet Deployment

See `docs/phase-2-deployment.md`.

```bash
cd contracts/rwa-oracle
cargo odra build -c RwaOracle
cargo run --bin deploy --features livenet
```

The deploy runner reads local Odra livenet variables from `.env`, deploys `RwaOracle`, registers the signing account as the demo oracle, publishes one sample RWA datapoint, and prints the contract package hash plus sample output. Real `.env` and key files must stay local and uncommitted.

## Phase 3 Agent Core

```bash
cd agent-backend
npm install
npm test
npm run build
npm run agent:mock
```

Mock mode logs the full perception → evidence → decision → publish path and emits mock transaction hashes plus unsigned Casper `publish_data` deploy JSON.

## Phase 4 x402 Evidence Flow

See `docs/phase-4-x402.md`.

Default mock/reference flow:

```bash
cd agent-backend
npm test
npm run build
npm run agent:mock
```

Local HTTP x402 flow:

```bash
cd oracle-server
npm test
npm start
```

Then in another shell:

```bash
cd agent-backend
X402_ORACLE_BASE_URL=http://127.0.0.1:3002 npm run agent:mock
```

The agent receives a `402 Payment Required` challenge, signs a mock/reference `PAYMENT-SIGNATURE`, receives premium evidence, and upgrades the borderline lease case to a publish decision.
