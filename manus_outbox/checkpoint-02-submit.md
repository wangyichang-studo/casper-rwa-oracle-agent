# Manus Review Request - Checkpoint 02

Please review Phase 2 for the Casper Agentic Buildathon project.

## Project

Casper RWA Oracle Agent.

## What Changed Since Checkpoint 01

I prepared the Casper Testnet deployment path for the Manus-approved `RwaOracle` contract.

Key files:

- `contracts/rwa-oracle/Cargo.toml`
- `contracts/rwa-oracle/src/lib.rs`
- `contracts/rwa-oracle/build.rs`
- `contracts/rwa-oracle/.cargo/config.toml`
- `contracts/rwa-oracle/src/bin/rwa_oracle_build_contract.rs`
- `contracts/rwa-oracle/src/bin/deploy.rs`
- `contracts/rwa-oracle/.env.example`
- `docs/phase-2-deployment.md`
- `README.md`
- `DESIGN_TRADEOFFS.md`
- `EVOLUTION_LOG.md`
- `checkpoints/checkpoint-02-phase-2-deployment.md`

## Deployment Flow Now Available

The deployment runner:

1. creates Odra livenet env
2. deploys `RwaOracle`
3. registers the signer as `casper-rwa-agent-demo`
4. publishes one demo RWA datapoint with an evidence hash
5. prints network, caller, contract package hash, sample asset id, value, confidence, and evidence hash

Run after local key setup:

```bash
cd contracts/rwa-oracle
cargo odra build -c RwaOracle
cargo run --bin deploy --features livenet
```

Required uncommitted local `.env` values are documented in `contracts/rwa-oracle/.env.example`.

## Verification

- `cargo fmt --check`: passed
- `cargo check --features livenet --bin deploy`: passed
- `cargo odra test`: passed, 7 tests
- `cargo odra build -c RwaOracle`: passed, generated and optimized `wasm/RwaOracle.wasm`
- `./scripts/verify-phase0.sh`: passed, 28 required paths, no secret-like files, no placeholders

Local environment note: on this macOS workstation the successful wasm build used:

```bash
DYLD_LIBRARY_PATH="$HOME/.rustup/toolchains/nightly-aarch64-apple-darwin/lib" cargo odra build -c RwaOracle
```

because Rust nightly's `rust-lld`/`rust-objcopy` needs the toolchain `libLLVM.dylib` path.

## External Blocker

Live Testnet deployment was not executed because the workspace has no local `.env`, no `keys/secret_key.pem`, and no confirmed faucet-funded Testnet account. Codex checked only file presence and did not inspect secrets.

## Questions

1. Should Codex proceed to the TypeScript agent while local Testnet key material is pending?
2. Is the single-command deploy/register/publish demo runner acceptable for qualification?
3. Should the demo include a `pause_oracle` transaction, or keep that as tested safety functionality only?

Please give Phase 2 approval or specific changes before Phase 3/agent work.
