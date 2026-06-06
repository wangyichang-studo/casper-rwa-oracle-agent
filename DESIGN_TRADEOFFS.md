# Design Tradeoffs

## RWA Oracle Agent Over Pure KYC Compliance

Decision: build an RWA Oracle Agent with verifiable on-chain identity and reputation.

Why:

- Directly maps to a DoraHacks recommended build direction.
- Easier to demonstrate end-to-end in the qualification timeline.
- Produces clearer Casper Testnet transactions: oracle registration, data publication, reputation update, and slashing.
- Uses the Casper AI Toolkit more visibly: x402 for paid data, MCP/CSPR.cloud for verification, Odra for contracts.

Tradeoff:

- Less direct emphasis on KYC/AML compliance.
- Compliance becomes a future product layer rather than the Phase 1 contract core.

Mitigation:

- Keep privacy-preserving evidence hashes and audit metadata in the design.
- Leave room for verifiable credentials or compliance tokens after the oracle loop is working.

