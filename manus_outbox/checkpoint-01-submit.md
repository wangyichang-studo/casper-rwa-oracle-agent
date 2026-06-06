# Manus Checkpoint 01 Submission - Phase 1 Odra Contract

Please review Phase 1 for the Casper Agentic Buildathon project.

## What Changed

Implemented the Odra contract crate at:

- `contracts/rwa-oracle`

The contract is named `RwaOracle` and covers the three Phase 1 surfaces you requested:

- Oracle registry
- Data feed
- Reputation and slashing

## Files To Inspect

- `contracts/rwa-oracle/Cargo.toml`
- `contracts/rwa-oracle/Cargo.lock`
- `contracts/rwa-oracle/Odra.toml`
- `contracts/rwa-oracle/rust-toolchain.toml`
- `contracts/rwa-oracle/src/lib.rs`
- `checkpoints/checkpoint-01-phase-1-contracts.md`
- `DESIGN_TRADEOFFS.md`
- `EVOLUTION_LOG.md`
- `README.md`

## Verification Evidence

Command:

```bash
cd contracts/rwa-oracle
cargo odra test
```

Result:

```text
running 5 tests
test tests::registered_oracle_can_publish_data ... ok
test tests::history_returns_newest_data_first ... ok
test tests::duplicate_oracle_registration_is_rejected ... ok
test tests::unregistered_oracle_publish_is_rejected ... ok
test tests::reputation_updates_and_slash_are_owner_controlled ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.40s
```

Also ran:

```bash
cd contracts/rwa-oracle
cargo fmt --check
```

Result: passed.

## Design Notes

- Implemented registry/feed/reputation inside a single Odra module for Phase 1 speed and simpler deployment.
- `register_oracle(name, public_key)` requires `public_key == caller`.
- `update_reputation` and `slash` are owner-only.
- History storage uses a structured `HistoryKey`.
- `DataPoint` does not yet include `evidence_hash`; intended to add when x402 evidence flow lands unless you recommend adding it now.
- Added `rust-toolchain.toml` because Odra 2.7.2 requires nightly.

## Questions

1. Pass/fail: does Phase 1 satisfy your requested contract milestone?
2. Should Phase 2 keep self-registration, or should agent/owner allowlisting be added now?
3. Should `DataPoint` include `evidence_hash` before the x402 service exists?
4. Should we keep the single `RwaOracle` contract for qualification, or split into separate Odra modules before Testnet deployment?

Please provide explicit approval or required changes before Codex starts Phase 2.
