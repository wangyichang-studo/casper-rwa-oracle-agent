# Checkpoint 07 - Live Testnet Deployment

Timestamp: 2026-06-07 22:25 CST

## Stage

Post-Phase 5 external artifact closure: Casper Testnet deployment.

## Work Completed

- Used the user-provided local wallet export to deploy `RwaOracle` to Casper Testnet.
- Kept wallet material local-only and removed the temporary PEM copy from the repository workspace before verification.
- Preserved the user-provided CSPR.cloud API key as an uncommitted secret for future CSPR.cloud/x402 work; it was not needed for the successful public Testnet RPC deployment.
- Updated deployment gas defaults in `contracts/rwa-oracle/src/bin/deploy.rs`:
  - deploy gas default: `800_000_000_000`
  - call gas default: `150_000_000_000`
  - optional env overrides: `RWA_ORACLE_DEPLOY_GAS`, `RWA_ORACLE_CALL_GAS`
- Updated README, submission readiness, DoraHacks draft, Phase 2 deployment docs, project guide, `.env.example`, and evolution log with true live-chain evidence.
- Removed accidental placeholder public repo/video URLs from docs.

## Live Testnet Evidence

- Deployed signer public key: `020399f41243f45e505e1cacef3e1e40f7b6ad8cbba2d070a9fa6219beedc8ee2e00`
- Account hash: `account-hash-341bdc1af1a371921c41558795c780827bb3b37ef4afb79882e5d32a48548cad`
- Contract package hash: `hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8`
- Contract explorer: `https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8`
- Deploy transaction: `0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0`
- Register transaction: `d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490`
- Publish transaction: `dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b`
- Demo asset: `rwa-demo-invoice-001`
- Demo value: `1250000`
- Demo confidence: `91`
- Demo evidence hash: `sha256:9d9c4b27d7ec8f245fbe28f5ac6f1d3a75b8a6d4b13f8a932dc4c4b84ddf2f4f`

## Deployment Notes

- First submitted deploy attempt used `300_000_000_000` gas and failed out-of-gas at transaction `f3586938855b1b0665cfbf0ad183ba118f89c7bf595b2573f8798b84d7c9ad11`.
- A later `1_200_000_000_000` gas setting exceeded the Testnet block gas limit before submission.
- The successful deploy used `800_000_000_000` gas, which is below the observed Testnet block gas limit.

## Self-Review Against Project Requirements

- Casper Testnet prototype: complete.
- Transaction-generating on-chain component: complete, with deploy/register/publish transactions.
- Open-source repo readiness: ready locally, pending public remote URL and push.
- Public demo video: script ready, pending recording/upload.
- Secret handling: no `.env`, PEM, private key, API key, or raw RWA/KYC document is committed or sent to Manus.

## Verification Output

- `git diff --check`: passed.
- `cd contracts/rwa-oracle && cargo check --features livenet --bin deploy`: passed.
- `make ci`: passed.
  - scaffold and secret hygiene passed with 76 required paths
  - agent tests: 10 passed
  - agent TypeScript build passed
  - CSPR.trade MCP smoke check skipped gracefully
  - x402 oracle-server tests: 3 passed
  - artifact fill dry run passed
  - git whitespace check passed
- `make submission-check`: expected failure until public repo and public demo video URLs are available.

## Remaining Submission Actions

- Create/push public GitHub/GitLab/Bitbucket repository.
- Record and upload the public demo video.
- Re-run `scripts/fill-submission-artifacts.mjs` with the public repo/video URLs.
- Re-run `make submission-check` before DoraHacks submission.

## Questions For Manus

1. Does the live Testnet deploy/register/publish evidence satisfy the remaining Casper on-chain submission requirement?
2. Is the documentation now correctly balanced between true live-chain evidence and still-pending public repo/video links?
3. Should the demo video emphasize the successful deploy/register/publish hashes or keep the local x402 agent loop as the main story and show CSPR.live proof briefly?
