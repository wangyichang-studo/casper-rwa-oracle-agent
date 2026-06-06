# Agent Backend

TypeScript RWA oracle agent core for Phase 3.

## Scripts

```bash
npm install
npm test
npm run build
npm run agent:mock
```

The default mode is `mock`, which runs the full perception, evidence, decision, and publish loop without signing or submitting a Casper deploy. Live Testnet publishing requires local key material and must keep `.env` plus PEM files uncommitted.

## x402 Evidence

Default `mock` mode uses `mock://local-rwa-oracle` and logs the x402 sequence without launching a server:

```text
[X402] [PAYMENT_REQUIRED]
[X402] [PAYMENT_SIGNED]
[X402] [DATA_RECEIVED]
```

To use the local HTTP oracle server:

```bash
cd ../oracle-server
npm start
```

Then:

```bash
X402_ORACLE_BASE_URL=http://127.0.0.1:3002 npm run agent:mock
```
