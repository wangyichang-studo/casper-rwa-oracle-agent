# Checkpoint 04 - Phase 4 x402 Paid Evidence

Timestamp: 2026-06-06 23:55 CST

## Stage

Phase 4: x402 paid evidence service and agent client integration.

## Work Completed

- Added `oracle-server/` Node HTTP service.
- Implemented x402 v2 mock/reference protocol helpers:
  - `PAYMENT-REQUIRED` Base64 JSON header
  - `PAYMENT-SIGNATURE` Base64 JSON retry header
  - `PAYMENT-RESPONSE` Base64 JSON settlement header
  - Casper-style `exact` payment requirements for `casper:casper-test`
- Added `GET /api/v1/rwa-risk-score/:asset_id`.
- Added mock premium risk evidence for the borderline lease case.
- Added `agent-backend/src/x402-client.ts`.
- Integrated x402 into the Agent loop for confidence values from 50 to 70.
- Added a borderline RWA lease case and a separate anomalous commodity case.
- Added tests for:
  - oracle-server 402 challenge
  - oracle-server paid data retry
  - oracle-server CLI entrypoint
  - agent x402 client mock retry flow
  - premium evidence upgrading a borderline review into publish
  - full Agent loop logging x402 evidence and mock transaction hashes
- Added `docs/phase-4-x402.md`, `oracle-server/README.md`, and environment examples.

## Self Review Against Buildathon Requirements

- x402 is now a visible core flow, not just a planned feature.
- Agent logs show paid evidence acquisition before chain publishing.
- The on-chain publish payload now includes an evidence hash derived from premium paid evidence for the borderline case.
- No API keys, private keys, `.env`, CSPR.cloud access tokens, or raw RWA documents are committed.
- Live facilitator settlement remains explicitly blocked until local credentials and real Casper EIP-712 payment signatures are available.

## Verification Output

```bash
cd oracle-server
npm test
```

Result: passed, 3 tests.

```bash
cd agent-backend
npm test
```

Result: passed, 10 tests.

```bash
cd agent-backend
npm run build
```

Result: passed, `tsc --noEmit`.

```bash
cd agent-backend
npm run agent:mock
```

Result: passed. Logs include:

```text
[X402] [PAYMENT_REQUIRED] {"assetId":"rwa-demo-warehouse-lease-009","scheme":"exact","network":"casper:casper-test","amount":"1000000000","resource":"mock://local-rwa-oracle/api/v1/rwa-risk-score/rwa-demo-warehouse-lease-009"}
[X402] [PAYMENT_SIGNED] {"assetId":"rwa-demo-warehouse-lease-009","mode":"mock","payloadHash":"sha256:3875046b318c0ffe7daf1bcbff78a7b23cd8ded904cd0272924c0244c9522987","publicKey":"016b84d42cbb0bc38192ef85ee512aaa19627f4b4612ccce3850601c8929e828f9"}
[X402] [DATA_RECEIVED] {"assetId":"rwa-demo-warehouse-lease-009","riskScore":23,"recommendedAction":"publish_with_high_confidence","premiumData":true}
[DECISION] [PUBLISH] {"assetId":"rwa-demo-warehouse-lease-009","confidence":77,"reason":"premium x402 evidence recommends publish_with_high_confidence"}
```

Local HTTP integration was also verified:

```bash
cd oracle-server
npm start
```

Then:

```bash
cd agent-backend
X402_ORACLE_BASE_URL=http://127.0.0.1:3002 npm run agent:mock
```

Result: passed. The agent received a real HTTP 402 challenge from local `oracle-server`, retried with `PAYMENT-SIGNATURE`, received premium data, and produced mock Casper `publish_data` deploy JSON.

## Current External Blockers

- CSPR.cloud facilitator live authorization token is not present locally.
- Real Casper EIP-712 payment signing is not wired because local payment token/account material is not present.
- Live Casper Testnet publishing from TypeScript is still blocked by missing `CASPER_SECRET_KEY_PATH`, funded account, and deployed `CASPER_CONTRACT_PACKAGE_HASH`.

## Questions For Manus

1. Does this mock-first x402 v2 flow satisfy Phase 4 while live facilitator credentials are pending?
2. Should the next phase focus on final README/demo packaging or add the optional CSPR.trade MCP smoke check first?
3. Should Codex keep the x402 payment payload mock/reference-only in the demo, or should it attempt real EIP-712 signing once the user provides credentials?

## Next Stage Plan

- If Manus approves, package the final demo and README around:
  - Testnet Odra deploy/register/publish runner
  - Agent x402 evidence acquisition
  - Mock/live switch guardrails
  - Demo video script and final submission checklist
