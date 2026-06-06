# Checkpoint 01 - Phase 1 Odra Contract

Timestamp: 2026-06-06 15:33:04 CST

## Stage

Phase 1: Casper/Odra smart contract implementation and local test verification.

## Work Completed

- Created Odra crate: `contracts/rwa-oracle`.
- Added `RwaOracle` contract with Manus-requested contract surfaces:
  - `register_oracle(name: String, public_key: Address)`
  - `get_oracle_info(oracle_id: Address) -> OracleInfo`
  - `is_registered(address: Address) -> bool`
  - `publish_data(asset_id: String, value: U256, timestamp: u64, confidence: u8)`
  - `get_latest_data(asset_id: String) -> DataPoint`
  - `get_history(asset_id: String, count: u32) -> Vec<DataPoint>`
  - `update_reputation(oracle_id: Address, accuracy_delta: i32)`
  - `get_reputation(oracle_id: Address) -> u64`
  - `slash(oracle_id: Address, reason: String)`
- Added Odra custom types:
  - `OracleInfo`
  - `DataPoint`
  - internal `HistoryKey`
- Added owner capture on init, owner-only reputation/slash operations, and self-registration invariant `public_key == caller`.
- Added `rust-toolchain.toml` because `odra-macros 2.7.2` requires nightly Rust.
- Added unit tests for duplicate registration, registered publish success, unregistered publish rejection, reputation/slash behavior, and newest-first history reads.

## Self-Review Against Requirements

- Official track fit: still aligned to Casper Innovation Track, RWA + Agentic AI.
- On-chain component: Phase 1 contract is transaction-generating when deployed and called.
- Privacy: no raw KYC/private asset documents stored; Phase 1 only stores oracle identity, values, confidence, timestamp, and reputation.
- Casper AI Toolkit fit: Odra is used directly for contract implementation and test gate.
- Manus feedback fit: implements the requested registry, data feed, and reputation functions in one cohesive Odra contract.

## Design Tradeoffs

- Implemented the three requested modules inside a single `RwaOracle` Odra contract for speed and testability. The public API still preserves the requested module boundaries.
- Oracle identity is self-registered to avoid third-party impersonation; owner governance is limited to reputation and slashing.
- Used structured `HistoryKey` for history storage instead of string-concatenated keys.
- Kept x402 evidence hashes out of Phase 1; the data feed can be extended in Phase 2/3 to include `evidence_hash` once the paid evidence service exists.

## Theme Drift Risk

Low. The contract is directly on the RWA oracle direction Manus recommended and leaves room for agentic evidence gathering and x402 in later phases.

## Blockers And Evidence

- No external blocker for Phase 1 local contract tests.
- Environment note: `odra-macros 2.7.2` failed on stable Rust due `#![feature(box_patterns)]`; fixed by installing nightly and adding `contracts/rwa-oracle/rust-toolchain.toml`.
- Network note: crates.io raw/index access was slow locally. A temporary `.cargo/config.toml` pointing to USTC sparse registry was used to resolve dependencies, then removed before commit. `Cargo.lock` uses standard crates.io sources.

## Verification

Command:

```bash
cd contracts/rwa-oracle
cargo odra test
```

Latest output summary:

```text
Finished `test` profile [unoptimized + debuginfo] target(s) in 1.89s
running 5 tests
test tests::registered_oracle_can_publish_data ... ok
test tests::history_returns_newest_data_first ... ok
test tests::duplicate_oracle_registration_is_rejected ... ok
test tests::unregistered_oracle_publish_is_rejected ... ok
test tests::reputation_updates_and_slash_are_owner_controlled ... ok
test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.40s
```

Additional check:

```bash
cd contracts/rwa-oracle
cargo fmt --check
```

Result: passed.

Residual warning: Cargo reports future-incompatibility warning for dependency `proc-macro-error2 v2.0.1`. This is upstream dependency noise, not project code.

## Files For Review

- `contracts/rwa-oracle/Cargo.toml`
- `contracts/rwa-oracle/Cargo.lock`
- `contracts/rwa-oracle/Odra.toml`
- `contracts/rwa-oracle/rust-toolchain.toml`
- `contracts/rwa-oracle/src/lib.rs`
- `DESIGN_TRADEOFFS.md`
- `EVOLUTION_LOG.md`
- `README.md`

## Questions For Manus

1. Should Phase 2 keep self-registration, or switch to owner/agent-managed oracle registration?
2. Should `DataPoint` gain `evidence_hash` now, before the x402 service exists, or wait until Phase 3?
3. Is a single `RwaOracle` contract acceptable for qualification, or should Phase 1 be split into separate Odra modules before Testnet deployment?

## Next-Stage Plan

If Manus approves, Phase 2 will implement the TypeScript RWA oracle agent:

- Load synthetic RWA cases.
- Score risk/value/confidence.
- Produce explainable log trace: perception -> evidence lookup -> decision -> transaction payload.
- Prepare Casper transaction submission wiring with local keys only.

## Post-Manus Addendum

Manus reviewed this checkpoint and marked Phase 1 as passed with two small pre-Phase2 changes:

- Add `evidence_hash: Option<String>` to `DataPoint` and `publish_data`.
- Add owner-only `pause_oracle(oracle_id)` and a paused-oracle publish rejection test.

Both changes were implemented after review. Updated local result:

```text
running 6 tests
test tests::paused_oracle_cannot_publish_data ... ok
test tests::registered_oracle_can_publish_data ... ok
test tests::duplicate_oracle_registration_is_rejected ... ok
test tests::unregistered_oracle_publish_is_rejected ... ok
test tests::history_returns_newest_data_first ... ok
test tests::reputation_updates_and_slash_are_owner_controlled ... ok
test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.41s
```
