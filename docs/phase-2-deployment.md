# Phase 2 Casper Testnet Deployment

This phase prepares the Odra livenet deployment path for `RwaOracle`.

## Local Secret Setup

Create `contracts/rwa-oracle/.env` from `contracts/rwa-oracle/.env.example` and keep it uncommitted.

Required local materials:

- Casper Testnet secret key at `contracts/rwa-oracle/keys/secret_key.pem`
- Funded Testnet account for deploy gas
- Access to `https://node.testnet.casper.network` or another Casper Testnet node/events endpoint

The public Casper Testnet node works without an API token. CSPR.cloud endpoints can still be used when a CSPR.cloud API authorization setup is available.

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

The account `0202843d288fff484d5f70a847fb239cb428af5c7f66e878cd99b0fdbc29f618adf2` is visible on Casper Testnet as `account-hash-5cc1872a3fcdd350bd6f5d5c1f491d1446ed40e0ac727d4431511d1f83af8dc0` and has sufficient faucet CSPR for the demo gas budget.

Live Testnet deployment is blocked only until the matching local Testnet secret key exists at `contracts/rwa-oracle/keys/secret_key.pem`. No private key, `.env`, or PEM file should be committed or sent to Manus.
