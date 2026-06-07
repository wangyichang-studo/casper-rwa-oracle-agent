# Submission Readiness

Status timestamp: 2026-06-07 00:35 CST.

## Required DoraHacks Artifacts

| Artifact | Local Status | Public Submission Status | Human Action |
| --- | --- | --- | --- |
| Open-source repository contents | ✅ Ready locally | ⏳ Pending public remote | Create public GitHub/GitLab/Bitbucket repo and push. |
| README with usage instructions | ✅ Ready locally | ✅ Ready for public repo | Add live contract/video links after they exist. |
| Working prototype | ✅ `make verify` passes | ✅ Local prototype can be reviewed | Run the demo commands during video recording. |
| Casper Testnet prototype path | ✅ Deploy/register/publish runner implemented | ⏳ Pending live deployment | Provide funded Testnet key and run the livenet deploy command. |
| Transaction-generating on-chain component | ✅ Odra tests, WASM build, and livenet deploy binary check pass | ⏳ Pending live contract/deploy hash | Record contract package hash and sample deploy hash after deployment. |
| x402 paid evidence flow | ✅ Mock/reference, local HTTP mode, and demo evidence capture pass | ✅ Mock/reference mode is demo-ready | Optional: configure live facilitator credentials before recording. |
| CSPR.trade MCP smoke check | ✅ Graceful placeholder command ready | ✅ Non-blocking enrichment path documented | Optional: configure MCP bridge and rerun `npm run mcp:check`. |
| Public demo video | ✅ Script ready | ⏳ Pending upload | Record and upload a public 3-5 minute demo video. |

## Verified Testnet Account

- Account: `0202843d288fff484d5f70a847fb239cb428af5c7f66e878cd99b0fdbc29f618adf2`
- Account hash: `account-hash-5cc1872a3fcdd350bd6f5d5c1f491d1446ed40e0ac727d4431511d1f83af8dc0`
- Main purse: `uref-6b71adf2446a1f1d48cc97fe440dc35e760a86d26a61843bd0b39bdfc248b5d7-007`
- Latest checked balance: `5000000000000` motes, about `5000 CSPR`.
- Deployment blocker remaining: matching local `contracts/rwa-oracle/keys/secret_key.pem`.

## Final Safety Checklist

- ✅ `.gitignore` blocks `.env`, `.env.*`, `keys/`, `*.pem`, `*.key`, `node_modules/`, and generated contract `wasm/`.
- ✅ `.env.example` files describe required local variables.
- ✅ No local `.env`, PEM, or key file is present in the working tree.
- ✅ Raw RWA/KYC files are not stored in the repo.
- ✅ Manus approvals are saved through Checkpoint 05.
- ✅ Final Manus review for Phase 5 approved the local development loop.

## Project Directory Tree

```text
.
├── README.md
├── LICENSE
├── DESIGN_TRADEOFFS.md
├── EVOLUTION_LOG.md
├── agent-backend/
│   ├── src/
│   │   └── mcp-smoke.ts
│   ├── test/
│   ├── data/
│   ├── package.json
│   └── .env.example
├── contracts/
│   └── rwa-oracle/
│       ├── src/
│       ├── Cargo.toml
│       ├── Odra.toml
│       └── .env.example
├── oracle-server/
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── .env.example
├── docs/
├── checkpoints/
├── manus_outbox/
├── manus_feedback/
├── scripts/
└── skills/
```

## Remaining External Inputs

- Casper Testnet secret key path for the verified funded account.
- Contract package hash after live deploy.
- CSPR.cloud x402 facilitator authorization token if live settlement is recorded.
- Public repository URL.
- Public demo video URL.
- Optional project social link for the long-term launch plan section.

When these values exist, run `node scripts/fill-submission-artifacts.mjs` to update README and this readiness file without hand-editing final links.

Use `docs/dorahacks-submission-draft.md` as the working copy for the final BUIDL form text.

Run `make submission-check` after filling final links. It is expected to fail while public repo/video/Testnet hashes are still pending.

Run `make export-package` after committing final changes if a clean source archive/manifest is useful for review or backup.

The repository includes `.github/workflows/ci.yml`; after pushing to a public remote, GitHub Actions should run `make ci` as a portable quick gate.
