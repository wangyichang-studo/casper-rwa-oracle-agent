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

## Keep Pause Oracle Out Of Qualification Demo

Decision: document and test `pause_oracle`, but do not spend demo time on a pause transaction in the qualification video.

Why:

- Manus recommended focusing the 3-5 minute demo on the core value flow: data collection, AI assessment, and on-chain publishing.
- `pause_oracle` is a safety mechanism that reviewers can verify through README, code, and Odra tests.

Tradeoff:

- The demo shows less governance/security behavior.

Mitigation:

- Keep owner-only pause covered by tests, including a non-owner rejection test.
- Revisit live pause demonstration only if the project reaches a longer final-round demo.

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

## Commit Wasm Build Config, Ignore Wasm Artifacts

Decision: commit `.cargo/config.toml` with `--allow-undefined` for Casper wasm imports, but ignore generated `wasm/` output.

Why:

- Casper host functions are imported by the deployed module and must remain undefined at link time.
- `cargo odra build` can regenerate `wasm/RwaOracle.wasm` before deployment.
- Keeping generated wasm out of git avoids stale build artifacts.

Tradeoff:

- A contributor must run the build command before livenet deployment.

Mitigation:

- `docs/phase-2-deployment.md` lists the exact build command and build tools.

## Mock Agent Publishing Before Live Testnet Keys

Decision: Phase 3 defaults the TypeScript agent to mock publishing with full unsigned Casper deploy JSON.

Why:

- Manus approved agent development while Testnet key material is pending.
- The agent loop can be tested and demoed without exposing or inventing private key material.
- Mock transaction hashes make the terminal workflow visible while clearly avoiding false live-chain claims.

Tradeoff:

- Phase 3 does not yet create live Casper transactions from TypeScript.

Mitigation:

- Phase 2 already provides an Odra livenet deploy/register/publish runner for the first live chain workflow.
- The TypeScript publisher has live-mode guardrails and will only progress after local `.env`, key path, funded account, and contract package hash exist.
