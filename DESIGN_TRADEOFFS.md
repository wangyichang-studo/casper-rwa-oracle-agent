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

## Single Phase 1 Contract Instead Of Three Separate Crates

Decision: implement `OracleRegistry`, `DataFeed`, and `ReputationScore` as cohesive storage and entrypoint groups inside one Odra module, `RwaOracle`.

Why:

- Phase 1 needs a fast, testable, transaction-generating prototype.
- A single contract avoids cross-contract call complexity before the agent and x402 flow exist.
- The public methods still expose the three Manus-requested concepts clearly.

Tradeoff:

- Less modular than three separate on-chain contracts.

Mitigation:

- Keep method names, types, and storage boundaries aligned with the three-module model.
- Revisit contract splitting only after Phase 2 proves the agent transaction workflow.

## Self-Registered Oracle Identity

Decision: `register_oracle(name, public_key)` requires `public_key == caller`.

Why:

- Prevents one account from registering or impersonating another oracle identity.
- Keeps Phase 1 registration simple while preserving an on-chain identity invariant.

Tradeoff:

- No owner-managed allowlist yet.

Mitigation:

- Owner-only reputation updates and slashing provide governance hooks.
- Phase 2 can add sponsored/agent-managed registration if Manus prefers stricter operator control.

## Pause Oracle Instead Of Owner Allowlist

Decision: keep self-registration and add owner-only `pause_oracle(oracle_id)`.

Why:

- Self-registration keeps the demo flow lightweight: the agent can register itself.
- Owner pause provides an emergency control without forcing manual allowlist setup.
- Manus explicitly preferred this path for qualification.

Tradeoff:

- A malicious self-registered oracle can exist until paused.

Mitigation:

- Publishing requires active registration.
- Reputation and slashing remain owner-controlled.
- Phase 2 deployment logs can show the owner pause path as a safety control.

## Evidence Hash Placeholder Before x402 Integration

Decision: add `evidence_hash: Option<String>` to `DataPoint` before the x402 service exists.

Why:

- It anchors the verifiable-data narrative early.
- It lets Phase 2/3 agent flows publish a hash of paid evidence or payment proof without changing the contract API later.

Tradeoff:

- Phase 1 tests mostly pass `None` or synthetic demo hashes.

Mitigation:

- Phase 3 will replace synthetic values with hashes from the x402 evidence flow.

## Nightly Toolchain For Odra 2.7.2

Decision: add `contracts/rwa-oracle/rust-toolchain.toml` with `channel = "nightly"`.

Why:

- `odra-macros 2.7.2` uses a nightly feature and fails on stable Rust.

Tradeoff:

- Contributors must install nightly Rust.

Mitigation:

- The crate declares the toolchain locally so `cargo odra test` selects nightly automatically.
