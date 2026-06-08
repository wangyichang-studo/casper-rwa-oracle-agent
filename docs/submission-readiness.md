# Submission Readiness

Status timestamp: 2026-06-08 12:45 CST.

## Required DoraHacks Artifacts

| Artifact | Local Status | Public Submission Status | Human Action |
| --- | --- | --- | --- |
| Open-source repository contents | ✅ Ready locally | ✅ Public repo: [link](https://github.com/wangyichang-studo/casper-rwa-oracle-agent) | Keep repo public through judging. |
| README with usage instructions | ✅ Ready locally | ✅ Ready for public repo | Add live contract/video links after they exist. |
| Working prototype | ✅ `make verify` passes | ✅ Local prototype can be reviewed | Run the demo commands during video recording. |
| Casper Testnet prototype path | ✅ Deploy/register/publish runner implemented | ✅ Contract package: [hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8](https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8) | Keep Testnet account funded for any re-demo. |
| Transaction-generating on-chain component | ✅ Odra tests, WASM build, and livenet deploy binary check pass | ✅ contract [hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8](https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8), deploy [dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b](https://testnet.cspr.live/deploy/dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b) | Preserve deploy logs for final submission evidence. |
| x402 paid evidence flow | ✅ Mock/reference, local HTTP mode, and demo evidence capture pass | ✅ Mock/reference mode is demo-ready | Optional: configure live facilitator credentials before recording. |
| CSPR.trade MCP smoke check | ✅ Graceful placeholder command ready | ✅ Non-blocking enrichment path documented | Optional: configure MCP bridge and rerun `npm run mcp:check`. |
| Public demo video | ✅ Script ready | ✅ Public video: [link](https://youtu.be/dlEN2rdP9WU) | Keep the video URL public through judging. |

## Verified Testnet Account

- Deployed signer public key: `020399f41243f45e505e1cacef3e1e40f7b6ad8cbba2d070a9fa6219beedc8ee2e00`
- Account hash: `account-hash-341bdc1af1a371921c41558795c780827bb3b37ef4afb79882e5d32a48548cad`
- Main purse: `uref-eac0c0b0a9e6802b7b87a132ba6d0795db27cf3274bd3e294f1b24a9a57a7168-007`
- Deploy transaction: [`0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0`](https://testnet.cspr.live/transaction/0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0)
- Register transaction: [`d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490`](https://testnet.cspr.live/transaction/d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490)
- Publish transaction: [`dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b`](https://testnet.cspr.live/transaction/dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b)

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

- CSPR.cloud x402 facilitator authorization token if live settlement is recorded.
- Optional project social link for the long-term launch plan section.
