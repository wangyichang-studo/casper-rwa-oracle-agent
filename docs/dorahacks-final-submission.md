# DoraHacks BUIDL 提交信息

## 基本信息

- **BUIDL Name**: Casper RWA Oracle Agent
- **Track**: Casper Innovation Track
- **GitHub Link**: https://github.com/wangyichang-studo/casper-rwa-oracle-agent
- **Demo Video**: https://youtu.be/dlEN2rdP9WU

## Short Description

Autonomous AI agent that collects off-chain RWA data, assesses risk with AI, pays for premium data via x402 micropayments, and publishes verified results to Casper Testnet with on-chain reputation tracking.

## Long Description

### Overview

Casper RWA Oracle Agent is an autonomous AI agent that bridges off-chain Real-World Asset data with on-chain verification on Casper Network. The agent independently collects market data, runs AI-powered risk assessment, autonomously pays for premium data sources via the x402 micropayment protocol, and publishes verified results to a smart contract deployed on Casper Testnet.

### Key Features

- **Autonomous Decision Loop**: Collects RWA data -> AI risk assessment -> confidence scoring -> publish or skip.
- **x402 Micropayments**: Agent autonomously pays for premium risk data when confidence is borderline through HTTP 402, signed retry, and premium data receipt.
- **On-chain Verification**: Published data includes SHA-256 evidence hashes for data provenance.
- **Reputation System**: On-chain reputation scoring with slash mechanism for inaccurate oracles.
- **Safety Controls**: Owner-only pause mechanism and duplicate registration prevention.

### Casper AI Toolkit Integration

| Tool | Usage |
| --- | --- |
| Odra Framework | Smart contract development, tests, WASM build, and Testnet deployment |
| CSPR.cloud | Testnet node/API path and future live facilitator integration |
| x402 Protocol | Agent-to-agent micropayments for premium data |
| CSPR.click | Wallet integration planned for future UX |
| MCP Server | On-chain data query and ecosystem enrichment path |

### Live Testnet Deployment

- **Contract Package Hash**: `hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8`
- **Explorer**: https://testnet.cspr.live/contract-package/hash-8c5d2f16c0a552f95e92ab9a5efcac562dca17abb05db9359bfda270e3659cd8
- **Deploy TX**: `0a9a512e55ceef1ca202ba35d0f0940c78d3fbbfed751d44bfabb8b89b3593d0`
- **Register TX**: `d273321dd62a736d33b2367e04e6e27ad49960777adbdbd283b0bf43b10d4490`
- **Publish TX**: `dd62fd512ad9f95b4a6522316208d9be890614c31df20d1f5d4aa969daae251b`

### Tech Stack

- **Smart Contracts**: Rust + Odra Framework 2.7.2
- **AI Agent**: TypeScript + Node.js
- **x402 Oracle Server**: Node.js HTTP service
- **Deployment**: Casper Testnet
- **Testing**: 20 tests total (7 contract + 10 agent + 3 oracle server)

### Architecture

```text
┌─────────────────────────────────────────────────────┐
│                   AI Agent (TypeScript)              │
├─────────────┬──────────────┬───────────────────────┤
│ Data        │ Risk         │ Chain Publisher        │
│ Collector   │ Assessor     │ (Casper SDK)           │
├─────────────┴──────────────┴───────────────────────┤
│              x402 Client (auto-pay)                 │
└────────────────────────┬────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌───────────┐ ┌────────────────┐
   │ Oracle     │ │ Casper    │ │ CSPR.trade     │
   │ Server     │ │ Testnet   │ │ MCP Server     │
   │ (x402)     │ │ Contract  │ │ (data queries) │
   └────────────┘ └───────────┘ └────────────────┘
```

### Future Roadmap

- Q3 2026: Mainnet deployment with real RWA data feeds.
- Q4 2026: Multi-oracle network with cross-validation.
- Q1 2027: DAO governance for oracle reputation management.
- Q2 2027: Integration with institutional RWA platforms.

### Team

- **Wang Yichang** — Product Manager & Developer
