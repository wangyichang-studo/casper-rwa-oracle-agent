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

Optional gas overrides are read from `.env`:

```bash
RWA_ORACLE_DEPLOY_GAS=800000000000
RWA_ORACLE_CALL_GAS=150000000000
```

The deploy runner:

- deploys `RwaOracle`
- registers the signer account as `casper-rwa-agent-demo`
- publishes one demo RWA datapoint with an evidence hash
- prints the caller, network, contract package hash, sample asset id, value, confidence, and evidence hash

## Live Testnet Result

Deployment was completed on 2026-06-07 with the local-only wallet key provided by the user.

- Deployed signer public key: `020399f41243f45e505e1cacef3e1e40f7b6ad8cbba2d070a9fa6219beedc8ee2e00`
- Account hash: `account-hash-341bdc1af1a371921c41558795c780827bb3b37ef4afb79882e5d32a48548cad`
- Contract package hash: [`hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8`](https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8)
- Deploy transaction: [`0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0`](https://testnet.cspr.live/transaction/0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0)
- Register transaction: [`d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490`](https://testnet.cspr.live/transaction/d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490)
- Publish transaction: [`dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b`](https://testnet.cspr.live/transaction/dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b)

The first attempt with `300_000_000_000` deploy gas was submitted but failed out-of-gas. The successful retry used `800_000_000_000` deploy gas, which stays below the Testnet block gas limit observed during deployment.

No private key, `.env`, CSPR.cloud API key, or PEM file should be committed or sent to Manus.
