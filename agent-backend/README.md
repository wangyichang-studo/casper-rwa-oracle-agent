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
