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

## Mock-First x402 Before Live Facilitator Credentials

Decision: Phase 4 implements x402 v2 in mock/reference mode first, with the same `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and `PAYMENT-RESPONSE` header flow used by the official protocol.

Why:

- Manus approved prioritizing x402 over deeper TypeScript live publishing.
- Local mock mode gives a reliable demo without requiring private payment credentials.
- The HTTP `oracle-server` still exercises the real 402 challenge and retry control flow.

Tradeoff:

- The mock payment payload is structurally useful but is not a real Casper EIP-712 authorization.
- Live CSPR.cloud `/verify` and `/settle` are not claimed without a local access token and payment account material.

Mitigation:

- Keep all live credentials outside git.
- Document the external blockers explicitly.
- Preserve the protocol field names and facilitator endpoint shape so real signing can replace the mock payload later.

## Submission Packaging Before Optional CSPR.trade Smoke Test

Decision: after Manus approved Phase 4, Phase 5 prioritizes final README, demo script, secret checks, and submission-readiness evidence before optional CSPR.trade MCP enrichment.

Why:

- Manus identified README/Demo packaging as the highest-leverage remaining qualification work.
- The required DoraHacks artifacts must be ready before optional enhancements add complexity.
- The x402 and Casper/Odra core already demonstrate the project theme strongly.

Tradeoff:

- The CSPR.trade MCP smoke check may remain a documented optional enhancement instead of a central demo step.

Mitigation:

- Leave a clear place in README/Future Roadmap for MCP-based DeFi enrichment.
- If final packaging finishes early, add a small `mcp-smoke.ts` script without making it a submission blocker.

## Graceful CSPR.trade MCP Smoke Check

Decision: add `agent-backend/src/mcp-smoke.ts` as a non-blocking smoke command instead of making CSPR.trade MCP central to the demo.

Why:

- Manus recommended showing a real integration point after Phase 5 approval.
- No callable CSPR.trade MCP tool is available in this local Codex environment.
- A smoke command helps reviewers see the intended `get_tokens` path without making unavailable tooling fail the project.

Tradeoff:

- The default local run reports "MCP unavailable" rather than returning live token data.

Mitigation:

- `npm run mcp:check` exits successfully when no MCP bridge is configured.
- If a bridge module is provided through `CSPR_TRADE_MCP_MODULE`, the command calls `get_tokens` and logs a redacted token summary.

## Single Make Verify Gate

Decision: add a root `Makefile` and `scripts/final-verify.sh` after Manus' final review.

Why:

- Manus suggested a Makefile as a non-blocking technical execution polish item.
- The project now has Rust, TypeScript, HTTP x402, MCP smoke, docs, and git hygiene checks spread across multiple directories.
- Reviewers and future contributors need one command that proves the local qualification package still works.

Tradeoff:

- `make verify` is slower than targeted tests because it also rebuilds WASM and reruns the mock demo.

Mitigation:

- Keep focused Make targets for smaller loops.
- Keep the full gate credential-free so it never requires private keys or live Testnet material.

## Scripted Final Artifact Fill

Decision: add `scripts/fill-submission-artifacts.mjs` instead of expecting final repo, video, and Testnet links to be edited by hand.

Why:

- The remaining public submission fields are easy to mistype under deadline pressure.
- The script can validate URL hosts and Casper hash shape before updating README/readiness docs.
- It keeps private keys and live credentials out of the repo while still automating public metadata insertion.

Tradeoff:

- It does not create the GitHub repository, upload the video, or deploy the contract; those still require external authenticated actions.

Mitigation:

- Provide `--dry-run` and a Make target so the script can be verified without changing files.
- Keep updates scoped to public metadata fields only.

## Explicit DecisionMaker Before More x402 Surface Area

Decision: add a small `DecisionMaker` module before adding more x402 or publishing features.

Why:

- The buildathon differentiation depends on autonomous judgment, not only HTTP or contract plumbing.
- A named decision boundary makes the agent easy to explain in README, tests, logs, and demo narration.
- The 50-70 premium-evidence band keeps paid data requests economically rational.

Tradeoff:

- This introduces one more module and slightly more configuration surface.

Mitigation:

- Keep the module pure, deterministic, and covered by focused tests.
- Preserve the existing risk model and x402 client behavior; the new module only owns routing.

## Generated PNG Charts Without New npm Dependencies

Decision: generate the competition charts with a small pure Node PNG writer instead of adding charting dependencies.

Why:

- The repository already has enough moving parts across Rust, TypeScript, and shell gates.
- The charts are submission-supporting artifacts, not product runtime behavior.
- Avoiding new dependencies keeps `make ci` fast and credential-free.

Tradeoff:

- The chart renderer is intentionally simple and uses a tiny bitmap font rather than a full design stack.

Mitigation:

- Keep the script deterministic and track generated PNGs.
- Use README captions and Mermaid diagrams for richer explanation.

## Honest Three-Transaction Testnet Evidence

Decision: document only the three real Testnet transactions that exist, and describe 20+ batch publishing as future readiness rather than completed work.

Why:

- The local live deploy `.env` and funded key material are not present in the working tree.
- Fabricating a 20+ transaction table would damage credibility with judges.
- The existing deploy/register/publish sequence already satisfies the on-chain component requirement.

Tradeoff:

- The project does not currently show the same on-chain activity volume requested in the downloaded optimization guide.

Mitigation:

- Add `docs/testnet_evidence.md` with direct explorer links and batch-readiness prerequisites.
- Keep visual charts scoped to deterministic local agent evaluation cycles, not live chain transactions.
