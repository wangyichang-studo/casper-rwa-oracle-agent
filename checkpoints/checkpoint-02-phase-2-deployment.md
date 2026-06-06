# Checkpoint 02 - Phase 2 Testnet Deployment Path

Timestamp: 2026-06-06 16:31:01 CST

## Stage

Phase 2: Casper Testnet deployment path for `RwaOracle`.

## Work Completed

- Added Odra livenet support to `contracts/rwa-oracle/Cargo.toml`.
- Added `contracts/rwa-oracle/build.rs` so `ODRA_MODULE` cfg is injected by `odra_build`.
- Added `contracts/rwa-oracle/.cargo/config.toml` with Casper wasm `--allow-undefined` link arg.
- Added `contracts/rwa-oracle/src/bin/rwa_oracle_build_contract.rs` as the no-std wasm builder binary expected by `cargo odra build`.
- Added `contracts/rwa-oracle/src/bin/deploy.rs`:
  - creates Odra livenet env
  - deploys `RwaOracle`
  - registers the signer as `casper-rwa-agent-demo`
  - publishes demo RWA data with evidence hash
  - prints network, caller, contract package hash, and sample output
- Added `contracts/rwa-oracle/.env.example`.
- Added `docs/phase-2-deployment.md` with local secret setup, build tools, build command, deploy command, and current blocker.
- Ignored generated `contracts/**/wasm/` artifacts.
- Updated README, project guide, design tradeoffs, and evolution log.
- Added an explicit `pause_oracle_is_owner_only` Odra test after Manus requested owner-only pause coverage.

## Self Review Against Buildathon Requirements

- On-chain component remains Odra/Casper-focused and transaction-generating once local keys are available.
- No raw KYC, private RWA documents, `.env`, PEM, API token, or wallet secret is committed.
- Deployment path is ready for Casper Testnet with the required node/events environment variables.
- The project still follows the Manus-approved RWA Oracle Agent scope.

## Current External Blocker

Live Casper Testnet deployment was not executed because the local workspace does not contain:

- `contracts/rwa-oracle/.env`
- `contracts/rwa-oracle/keys/secret_key.pem`
- a faucet-funded Testnet account

I checked only file presence and did not read or request private key material.

## Verification Output

Commands run from `contracts/rwa-oracle` unless noted.

```bash
cargo fmt --check
```

Result: passed.

```bash
cargo check --features livenet --bin deploy
```

Result: passed, finished dev profile. Warning only: `proc-macro-error2 v2.0.1` future incompatibility.

```bash
cargo odra test
```

Result: passed, 7 tests:

- duplicate oracle registration rejected
- registered oracle can publish data with evidence hash
- unregistered oracle publish rejected
- reputation updates and slash owner controls
- newest-first history reads
- paused oracle cannot publish
- non-owner pause attempt rejected while oracle remains active

```bash
DYLD_LIBRARY_PATH="$HOME/.rustup/toolchains/nightly-aarch64-apple-darwin/lib" cargo odra build -c RwaOracle
```

Result: passed, generated and optimized `wasm/RwaOracle.wasm`. Local macOS warning: Rust nightly `rust-objcopy` could not load `libLLVM.dylib`, but `cargo odra build` exited 0 after Binaryen/WABT optimization.

```bash
./scripts/verify-phase0.sh
```

Result: passed, 28 required paths present, no secret-like files, no placeholders.

## Design Tradeoffs Added

- Commit Casper wasm link config, ignore generated wasm artifacts.
- Keep deploy runner small and deterministic before building the TypeScript agent.
- Treat missing Testnet key material as an external blocker, not a failed implementation.

## Questions For Manus

1. Should Phase 2 proceed to the TypeScript agent while Testnet key material is pending, or should Codex pause until a funded Testnet key is provided?
2. Is it acceptable that the first deploy runner combines deploy, oracle registration, and one demo data publish in a single command for demo clarity?
3. Should the demo also include an owner `pause_oracle` transaction, or keep pause as tested contract functionality only?

## Next Stage Plan

- If Manus approves, implement the TypeScript agent workflow:
  - synthetic RWA cases
  - policy/risk/confidence decision
  - evidence hash generation
  - secret-redacted logs
  - transaction submission wrapper ready to call the Odra deploy/publish path
- When user provides local Testnet key material, run live deployment and record contract package hash plus transaction evidence.
