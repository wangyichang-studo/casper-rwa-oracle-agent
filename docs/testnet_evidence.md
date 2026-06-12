# Live Casper Testnet Evidence

This page records only real Casper Testnet transactions that already exist. It does not claim the planned 20+ batch run until the local Testnet `.env`, funded key, and explicit run authorization are restored.

| # | Timestamp | Asset Type | Confidence | x402 Triggered | TX Hash | Evidence |
| --- | --- | --- | ---: | :---: | --- | --- |
| 1 | 2026-06-07 CST | contract_deploy | n/a | n/a | `0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0` | [CSPR.live](https://testnet.cspr.live/transaction/0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0) |
| 2 | 2026-06-07 CST | oracle_registration | n/a | n/a | `d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490` | [CSPR.live](https://testnet.cspr.live/transaction/d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490) |
| 3 | 2026-06-07 CST | invoice | 91 | no | `dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b` | [CSPR.live](https://testnet.cspr.live/transaction/dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b) |

## Batch Publish Readiness

The competition-polish plan intentionally avoids fabricating 20+ Testnet rows. A future batch run should only be executed when all of the following are true:

- `contracts/rwa-oracle/.env` exists locally and remains uncommitted.
- `contracts/rwa-oracle/keys/` contains a funded Casper Testnet signing key.
- The user explicitly authorizes spending Testnet gas for the batch.
- Each generated row is copied from the actual deploy output or CSPR.live explorer result.
