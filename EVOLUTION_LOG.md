# Evolution Log

## 2026-06-06 - Checkpoint 00 Manus Pivot

- Phase 0 passed Manus review.
- Manus recommended pivoting from pure RWA/KYC compliance to **RWA Oracle Agent with Verifiable On-Chain Identity**.
- Rationale:
  - Better matches DoraHacks example direction 2.
  - Avoids zero-knowledge-heavy KYC implementation risk.
  - Makes the transaction-generating chain workflow clearer.
  - Creates a natural fit for x402 evidence payments, MCP state reads, and on-chain reputation.
- Implementation impact:
  - Phase 1 now targets `OracleRegistry`, `DataFeed`, and `ReputationScore`.
  - Compliance/KYC wording remains only as future extension or privacy constraint.

## 2026-06-06 - Phase 1 Odra Contract Ready For Manus

- Implemented `contracts/rwa-oracle` as a single Odra module named `RwaOracle`.
- Contract behavior maps Manus' requested modules into one deployable contract surface:
  - Oracle registry: `register_oracle`, `get_oracle_info`, `is_registered`.
  - Data feed: `publish_data`, `get_latest_data`, `get_history`.
  - Reputation: `update_reputation`, `get_reputation`, `slash`.
- Added nightly `rust-toolchain.toml` because `odra-macros 2.7.2` requires nightly.
- Verified with `cargo odra test`: 5 tests passed.
- Local network note: a temporary project-local Cargo registry mirror was used only while resolving/downloading dependencies, then removed before committing.

## 2026-06-06 - Checkpoint 01 Manus Review

- Phase 1 passed Manus review.
- Manus confirmed the single-contract approach is correct for qualification.
- Manus requested two small changes before Phase 2:
  - Add `evidence_hash: Option<String>` to `DataPoint` and `publish_data`.
  - Add owner-only `pause_oracle(oracle_id)` and a test that paused oracles cannot publish.
- Implemented both changes and updated local verification to 6 passing tests.
- Next phase is Testnet deployment preparation, pending user-provided Testnet key material and CSPR.cloud access where needed.

## 2026-06-06 - Phase 2 Testnet Deployment Path Ready

- Added Odra livenet support for `contracts/rwa-oracle`.
- Added `build.rs`, `rwa_oracle_build_contract`, `.cargo/config.toml` wasm rustflags, and `src/bin/deploy.rs`.
- Deploy runner performs the first end-to-end chain workflow once keys are available:
  - deploy `RwaOracle`
  - register the signer as `casper-rwa-agent-demo`
  - publish one demo RWA datapoint with an evidence hash
  - print contract package hash and sample output
- Added `.env.example` and `docs/phase-2-deployment.md`.
- Verified `cargo check --features livenet --bin deploy`, `cargo odra test`, and `cargo odra build -c RwaOracle`.
- Live Testnet execution is blocked only by missing local `.env`, Testnet secret key, and faucet-funded account.

## 2026-06-06 - Checkpoint 02 Manus Review

- Phase 2 passed Manus review after resubmitting the complete checkpoint package.
- Added one extra owner-only pause test before the final resend to align with Manus' `>= 7` test expectation.
- Fresh Odra result: 7 tests passed.
- Manus approved moving into Phase 3 Agent core while Testnet key material remains pending.
- Manus confirmed the single-command deploy/register/publish runner satisfies the qualification need for a transaction-generating on-chain component.
- Manus advised keeping `pause_oracle` as tested README/code functionality, not a demo-video transaction, so the demo can focus on data collection, AI assessment, and on-chain publishing.

## 2026-06-06 - Phase 3 Agent Core Ready For Manus

- Implemented `agent-backend/` TypeScript agent core.
- Agent loop now loads synthetic RWA data, hashes evidence metadata, assesses risk/confidence, and prepares mock Casper `publish_data` deploy JSON.
- Mock mode emits transaction-like hashes for demo flow while live Testnet keys remain pending.
- Verified `npm test` with 8 tests, `npm run build`, and `npm run agent:mock`.
- Checkpoint 03 is ready for Manus review.

## 2026-06-06 - Checkpoint 03 Manus Delivery Blocked

- `manus_outbox/checkpoint-03-submit.md` is prepared and copied-ready.
- Manus desktop app could not expose a window: Computer Use returned `cgWindowNotFound`, and AppleScript repeatedly reported `count of windows = 0`.
- Tried app activation, Cmd+N, quit/reopen, and direct activation without restoring a window.
- No Manus approval is claimed for Checkpoint 03.
- Resume by sending the existing outbox when Manus UI recovers.

## 2026-06-06 - Checkpoint 03 Verification Refreshed

- Refreshed Phase 3 verification before resubmitting to Manus:
  - `npm test`: 8 tests passed.
  - `npm run build`: passed.
  - `npm run agent:mock`: passed with perception, evidence, decision, unsigned deploy JSON, mock transaction hashes, and summary logs.
  - `./scripts/verify-phase0.sh`: passed.
  - `git diff --check`: passed.
- Manus UI is available again, but the final send action is waiting for the user-required Computer Use confirmation for representational communication.
- No Manus approval is claimed for Checkpoint 03 until the outbox is actually sent and feedback is saved.
