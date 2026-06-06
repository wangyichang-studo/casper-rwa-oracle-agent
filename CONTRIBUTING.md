# Contributing

This repository is prepared for the Casper Agentic Buildathon 2026 qualification package.

## Local Setup

Install the required local tools before running the full verification suite:

- Node.js 22 or newer
- Rust nightly with `wasm32-unknown-unknown`
- `cargo-odra`
- Binaryen and WABT for Odra WASM optimization

Then install Node dependencies in both JavaScript workspaces:

```bash
cd agent-backend && npm install
cd ../oracle-server && npm install
```

## Verification

Run the complete local gate:

```bash
make verify
```

The full gate runs scaffold checks, Odra tests, WASM build, livenet deploy binary check, TypeScript tests/build, the mock agent demo, the MCP smoke check, oracle-server tests, and `git diff --check`.

For smaller loops, use specific Make targets such as `make contract-test`, `make agent-test`, `make agent-demo`, or `make oracle-test`.

## Secret Handling

Never commit:

- `.env` or `.env.*` files other than `.env.example`
- `keys/`
- `*.pem` or `*.key`
- CSPR.cloud tokens
- Casper Testnet private keys
- raw RWA/KYC/private asset documents

Live Testnet deployment should use local-only materials under `contracts/rwa-oracle/` and should update README links only after hashes are public.

## Manus Review Loop

For any new phase-level change, create a checkpoint in `checkpoints/`, a matching review package in `manus_outbox/`, deliver it to Manus, save the real response in `manus_feedback/`, and update `EVOLUTION_LOG.md`.
