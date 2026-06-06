# Phase 4 - x402 Paid Evidence Flow

Phase 4 implements a mock-first x402 flow for paid RWA risk evidence.

## Official Protocol Shape Used

Sources checked:

- CSPR.cloud x402 facilitator reference: `https://docs.cspr.cloud/x402-facilitator-api/reference.md`
- CSPR.cloud `/verify`: `https://docs.cspr.cloud/x402-facilitator-api/verify.md`
- CSPR.cloud `/settle`: `https://docs.cspr.cloud/x402-facilitator-api/settle.md`
- x402 HTTP 402 concepts: `https://docs.x402.org/core-concepts/http-402.md`
- x402 client/server concepts: `https://docs.x402.org/core-concepts/client-server.md`

The implementation uses x402 v2 headers:

- `PAYMENT-REQUIRED`: server to client, Base64 JSON `PaymentRequired`
- `PAYMENT-SIGNATURE`: client to server, Base64 JSON `PaymentPayload`
- `PAYMENT-RESPONSE`: server to client, Base64 JSON settlement result

CSPR.cloud facilitator facts used:

- Base URL: `https://x402-facilitator.cspr.cloud`
- Supported Casper networks: `casper:casper` and `casper:casper-test`
- Scheme: `exact`
- Facilitator endpoints: `/supported`, `/verify`, `/settle`
- Live requests require CSPR.cloud authorization.

## Components

### `oracle-server/`

Lightweight Node HTTP server.

```bash
cd oracle-server
npm test
npm start
```

Endpoint:

```text
GET /api/v1/rwa-risk-score/:asset_id
```

Without `PAYMENT-SIGNATURE`, the server returns `402 Payment Required`, body `PaymentRequired`, and `PAYMENT-REQUIRED`.

With a well-formed mock payment payload, it returns:

```json
{
  "asset_id": "rwa-demo-warehouse-lease-009",
  "risk_score": 23,
  "risk_factors": ["counterparty_exposure", "maturity_risk"],
  "recommended_action": "publish_with_high_confidence",
  "premium_data": true
}
```

### `agent-backend/src/x402-client.ts`

The agent client:

1. Requests premium risk evidence.
2. Parses the `402 Payment Required` challenge.
3. Builds a mock/reference Casper x402 `PaymentPayload`.
4. Retries with `PAYMENT-SIGNATURE`.
5. Logs `PAYMENT_REQUIRED -> PAYMENT_SIGNED -> DATA_RECEIVED`.
6. Upgrades borderline review decisions when paid evidence recommends publication.

Default mode uses `mock://local-rwa-oracle`, so `npm run agent:mock` works without launching the HTTP server. To exercise the real local HTTP x402 challenge:

```bash
cd oracle-server
npm start
```

Then in another shell:

```bash
cd agent-backend
X402_ORACLE_BASE_URL=http://127.0.0.1:3002 npm run agent:mock
```

## Live Facilitator Status

Live CSPR.cloud facilitator mode is prepared but not claimed as complete.

External blockers:

- local `CSPR_CLOUD_ACCESS_TOKEN`
- real Casper account and CEP-18 payment token setup
- real Casper EIP-712 signature generation for `transfer_with_authorization`

Until those are available, the demo uses the local/reference x402 flow and marks facilitator settlement as an external integration blocker.

## Verification

Fresh Phase 4 commands:

```bash
cd oracle-server
npm test
```

Result: 3 tests passed.

```bash
cd agent-backend
npm test
npm run build
npm run agent:mock
```

Result: 10 tests passed, TypeScript build passed, mock agent logs include `PAYMENT_REQUIRED`, `PAYMENT_SIGNED`, and `DATA_RECEIVED`.

Local HTTP integration was also verified by running `oracle-server` on `127.0.0.1:3002` and then:

```bash
cd agent-backend
X402_ORACLE_BASE_URL=http://127.0.0.1:3002 npm run agent:mock
```

Result: passed. The agent received a real HTTP 402 challenge from the local server, retried with `PAYMENT-SIGNATURE`, received premium data, and upgraded `rwa-demo-warehouse-lease-009` to publish.
