# Phase 2 Casper Testnet Deployment

This phase prepares the Odra livenet deployment path for `RwaOracle`.

## Local Secret Setup

Create `contracts/rwa-oracle/.env` from `contracts/rwa-oracle/.env.example` and keep it uncommitted.

Required local materials:

- Casper Testnet secret key at `contracts/rwa-oracle/keys/secret_key.pem`
- Funded Testnet account for deploy gas
- Access to `https://node.testnet.cspr.cloud` or another Casper Testnet node/events endpoint

Required build tools:

- Rust nightly with `wasm32-unknown-unknown`
- `cargo-odra`
- Binaryen `wasm-opt`
- WABT `wasm-strip`

On macOS with Homebrew:

```bash
brew install binaryen wabt
```

## Build Wasm

```bash
cd contracts/rwa-oracle
cargo odra build -c RwaOracle
```

This writes `wasm/RwaOracle.wasm`, which the livenet deploy script loads.

On this macOS workstation, Rust nightly's `rust-lld` may need the toolchain library path:

```bash
DYLD_LIBRARY_PATH="$(rustc --print sysroot)/lib" cargo odra build -c RwaOracle
```

## Deploy And Publish Demo Data

```bash
cd contracts/rwa-oracle
cargo run --bin deploy --features livenet
```

The deploy runner:

- deploys `RwaOracle`
- registers the signer account as `casper-rwa-agent-demo`
- publishes one demo RWA datapoint with an evidence hash
- prints the caller, network, contract package hash, sample asset id, value, confidence, and evidence hash

## Current Blocker

Live Testnet deployment is blocked until the user provides local Testnet key material and enough faucet CSPR. No private key, `.env`, or PEM file should be committed or sent to Manus.
