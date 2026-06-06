# Phase 3 AI Agent Core

Phase 3 implements the local TypeScript agent loop approved by Manus after Checkpoint 02.

## Run In Mock Mode

```bash
cd agent-backend
npm install
npm test
npm run build
npm run agent:mock
```

Mock mode performs the complete demo loop without signing or broadcasting:

1. Load synthetic RWA cases.
2. Hash evidence metadata.
3. Assess risk and confidence.
4. Prepare Casper `publish_data` deploy JSON.
5. Emit a mock transaction hash for terminal demo evidence.

## Live Mode Guardrails

Live mode must use local-only materials:

- `CASPER_AGENT_MODE=live`
- `CASPER_CONTRACT_PACKAGE_HASH`
- `CASPER_SECRET_KEY_PATH`
- `CASPER_NODE_ADDRESS`
- `CASPER_CHAIN_NAME=casper-test`

Do not commit `.env`, PEM files, API keys, raw asset files, or private participant documents. Until Testnet key material and deployed contract hash are present, Phase 3 acceptance uses mock mode logs.
