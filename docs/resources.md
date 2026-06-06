# Casper Buildathon Resource Notes

## Casper AI Toolkit

Casper positions itself as a trust layer for the agent economy. The toolkit emphasizes:

- Account abstraction for agent-owned on-chain identities
- Upgradable contracts for autonomous systems that evolve
- Predictable fees so agents can budget transaction costs
- x402 micropayments for HTTP-native pay-per-request commerce
- MCP servers for structured blockchain access by AI agents
- Streaming events for monitoring deploys, transfers, and contract calls

## CSPR.cloud

Use Testnet endpoints by default:

- REST API: `https://api.testnet.cspr.cloud`
- Streaming API: `wss://streaming.testnet.cspr.cloud`
- Node RPC API: `https://node.testnet.cspr.cloud`
- Node SSE API: `https://node-sse.testnet.cspr.cloud`
- MCP endpoint: `https://mcp.testnet.cspr.cloud/mcp`

The hosted MCP server needs a CSPR.cloud API key passed as `X-CSPR-Cloud-Api-Key` from `CSPR_CLOUD_API_KEY`.

## x402 Facilitator

CSPR.cloud provides an x402 facilitator at:

- `https://x402-facilitator.cspr.cloud`

It supports the `exact` scheme on:

- `casper:casper`
- `casper:casper-test`

The protocol flow is:

1. Client requests a paid resource.
2. Server returns `402 Payment Required`, a Base64 JSON `PAYMENT-REQUIRED` header, and payment requirements.
3. Client signs `PaymentPayload` and retries with Base64 JSON `PAYMENT-SIGNATURE`.
4. Server forwards payload to CSPR.cloud `/verify` and `/settle` when live facilitator access is configured.
5. Facilitator verifies and settles on-chain.
6. Server returns protected data and Base64 JSON `PAYMENT-RESPONSE`.

Phase 4 uses the x402 v2 shape from CSPR.cloud and x402.org docs. The live facilitator path is prepared but remains blocked until local CSPR.cloud authorization and real Casper EIP-712 signing material are available.

## CSPR.trade MCP

CSPR.trade exposes DEX and portfolio tools, including `get_tokens`, `get_pairs`, `get_quote`, `build_swap`, `analyze_trade`, `estimate_price_impact`, and `submit_transaction`. `sign_deploy` is available only when a separate local signer is configured.

For this project, CSPR.trade is not central. It can be used later as an optional ecosystem smoke check or demo appendix.

## Odra

Odra provides AI-discoverable docs via:

- `https://odra.dev/llms.txt`

Relevant topics:

- Installation
- Testing
- Native token handling
- Access control
- Build/deploy/read state
- Upgrading contracts
