---
name: casper-buildathon-rwa-loop
description: Use when working on the Casper Agentic Buildathon RWA Oracle Agent project, including phase gating, Manus checkpoint reports, Casper AI Toolkit usage, Odra contracts, x402 evidence flows, CSPR.cloud verification, and DoraHacks submission readiness.
---

# Casper Buildathon RWA Loop

Use this project skill for the Casper RWA Oracle Agent buildathon repo.

## Hard Phase Gate

Never move to the next phase until Manus has reviewed the current checkpoint and provided explicit approval or direction.

For each phase:

1. Implement only the current phase.
2. Run local verification.
3. Write `checkpoints/checkpoint-NN-*.md`.
4. Write `manus_outbox/checkpoint-NN-submit.md`.
5. Submit the outbox to Manus.
6. Save the exact Manus response in `manus_feedback/`.
7. Update `manus_feedback/feedback_log.md`.

## Current Product Direction

Build an RWA oracle agent on Casper:

- Agent evaluates synthetic RWA asset and market data cases.
- Agent obtains paid risk or valuation evidence through x402.
- Agent records privacy-preserving oracle data and reputation updates on Casper Testnet.
- Contract modules store oracle identity, data points, confidence, evidence hash, and reputation metadata.
- Raw private asset documents, KYC documents, and personal data stay off-chain and out of the repository.

## Official Buildathon Requirements

Final submission must include:

- Working Casper Testnet prototype with transaction-generating on-chain component.
- Open-source GitHub/GitLab/Bitbucket repo with README and usage docs.
- Public demo video.

Judging priorities include technical execution, innovation, agentic AI integration, RWA/DeFi applicability, UX, working Testnet smart contracts, long-term launch plan, and ecosystem impact.

## Casper Toolkit Usage

Use:

- Odra for smart contract development and tests.
- CSPR.cloud MCP/API for Testnet reads, event monitoring, and verification evidence.
- x402 facilitator or local casper-x402 fallback for paid evidence flow.
- CSPR.trade only as optional ecosystem smoke check; do not turn this project into a trading bot.

## Secret Rules

Do not commit:

- `.env`
- API keys
- PEM/private keys
- wallet seed phrases
- raw KYC data
- real personal identity documents

Use placeholders and environment variables in all docs and code.
