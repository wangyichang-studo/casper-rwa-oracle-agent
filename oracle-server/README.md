# Oracle Server

Mock-first x402 paid evidence oracle for Phase 4.

## Scripts

```bash
npm test
npm start
```

The server exposes:

```text
GET /api/v1/rwa-risk-score/:asset_id
```

Without `PAYMENT-SIGNATURE`, it returns HTTP `402 Payment Required`, a JSON `PaymentRequired` body, and a Base64 JSON `PAYMENT-REQUIRED` header. With a well-formed mock payment payload, it returns premium RWA risk data and a Base64 JSON `PAYMENT-RESPONSE` header.

Live CSPR.cloud facilitator verification is wired behind `X402_SERVER_MODE=live`, but requires a local `CSPR_CLOUD_ACCESS_TOKEN` and real Casper EIP-712 payment signatures. Keep tokens and signing material out of git.
