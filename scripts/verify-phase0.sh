#!/usr/bin/env bash
set -euo pipefail

if ! command -v rg >/dev/null 2>&1; then
  rg() {
    local grep_args=(-RIE)

    while [[ "$#" -gt 0 ]]; do
      case "$1" in
        -n)
          grep_args+=("-n")
          shift
          ;;
        -q)
          grep_args+=("-q")
          shift
          ;;
        -i)
          grep_args+=("-i")
          shift
          ;;
        -qi|-iq)
          grep_args+=("-q" "-i")
          shift
          ;;
        --)
          shift
          break
          ;;
        -*)
          echo "rg fallback does not support option: $1" >&2
          return 2
          ;;
        *)
          break
          ;;
      esac
    done

    grep "${grep_args[@]}" "$@"
  }
fi

required_paths=(
  ".gitignore"
  ".github/workflows/ci.yml"
  "CONTRIBUTING.md"
  "DESIGN_TRADEOFFS.md"
  "EVOLUTION_LOG.md"
  "LICENSE"
  "Makefile"
  "README.md"
  "agent-backend/package.json"
  "agent-backend/package-lock.json"
  "agent-backend/tsconfig.json"
  "agent-backend/.npmrc"
  "agent-backend/.env.example"
  "agent-backend/README.md"
  "agent-backend/src/agent.ts"
  "agent-backend/src/chain-publisher.ts"
  "agent-backend/src/config.ts"
  "agent-backend/src/data-collector.ts"
  "agent-backend/src/decision-maker.ts"
  "agent-backend/src/evidence.ts"
  "agent-backend/src/logger.ts"
  "agent-backend/src/mcp-smoke.ts"
  "agent-backend/src/risk-assessor.ts"
  "agent-backend/src/types.ts"
  "agent-backend/src/x402-client.ts"
  "agent-backend/data/rwa-cases.json"
  "agent-backend/test/agent.test.ts"
  "agent-backend/test/decision-maker.test.ts"
  "agent-backend/test/evidence.test.ts"
  "agent-backend/test/logger.test.ts"
  "agent-backend/test/risk-assessor.test.ts"
  "agent-backend/test/x402-client.test.ts"
  "contracts/rwa-oracle/Cargo.toml"
  "contracts/rwa-oracle/Cargo.lock"
  "contracts/rwa-oracle/Odra.toml"
  "contracts/rwa-oracle/.env.example"
  "contracts/rwa-oracle/.cargo/config.toml"
  "contracts/rwa-oracle/build.rs"
  "contracts/rwa-oracle/rust-toolchain.toml"
  "contracts/rwa-oracle/src/lib.rs"
  "contracts/rwa-oracle/src/bin/deploy.rs"
  "contracts/rwa-oracle/src/bin/rwa_oracle_build_contract.rs"
  "oracle-server/.gitkeep"
  "oracle-server/package.json"
  "oracle-server/.env.example"
  "oracle-server/README.md"
  "oracle-server/src/server.js"
  "oracle-server/src/x402.js"
  "oracle-server/test/server.test.js"
  "docs/official-rules.md"
  "docs/architecture.mmd"
  "docs/decision_flow.mmd"
  "docs/testnet_evidence.md"
  "docs/confidence_distribution.png"
  "docs/x402_trigger_rate.png"
  "docs/agent_timeline.png"
  "docs/project-guide.md"
  "docs/resources.md"
  "docs/demo-video-outline.md"
  "docs/demo-video-script.md"
  "docs/dorahacks-submission-draft.md"
  "docs/phase-2-deployment.md"
  "docs/phase-3-agent.md"
  "docs/phase-4-x402.md"
  "docs/submission-readiness.md"
  "checkpoints/checkpoint-00-phase-0-scaffold.md"
  "checkpoints/checkpoint-03-phase-3-agent.md"
  "checkpoints/checkpoint-04-phase-4-x402.md"
  "checkpoints/checkpoint-05-phase-5-submission-package.md"
  "manus_outbox/checkpoint-00-submit.md"
  "manus_outbox/checkpoint-03-submit.md"
  "manus_outbox/checkpoint-04-submit.md"
  "manus_outbox/checkpoint-05-submit.md"
  "manus_feedback/feedback_log.md"
  "manus_feedback/Manus 反馈 — Checkpoint 00.md"
  "manus_feedback/Manus 反馈 — Checkpoint 05.md"
  "scripts/final-verify.sh"
  "scripts/generate-competition-assets.mjs"
  "scripts/fill-submission-artifacts.mjs"
  "scripts/check-submission-ready.mjs"
  "scripts/capture-demo-evidence.sh"
  "scripts/ci-quick-check.sh"
  "scripts/export-submission-package.sh"
  "scripts/verify-phase0.sh"
  "skills/casper-buildathon-rwa-loop/SKILL.md"
  "skills/casper-buildathon-rwa-loop/agents/openai.yaml"
)

missing=0
for path in "${required_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "missing required path: $path"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

if find . \
  -path './.git' -prune -o \
  \( -name '*.pem' -o -name '*.key' -o -name '.env' -o \( -name '.env.*' ! -name '.env.example' \) \) \
  -print | grep -q .; then
  echo "secret-like files are present in the working tree"
  exit 1
fi

if rg -n '\b(TBD|TODO|FILL_ME|CHANGE_ME)\b' README.md docs checkpoints manus_outbox skills contracts; then
  echo "placeholder text found"
  exit 1
fi

rg -q 'Casper Innovation Track' docs/official-rules.md
rg -q '^verify:' Makefile
rg -q '^ci:' Makefile
rg -q '^demo-evidence:' Makefile
rg -q '^submission-check:' Makefile
rg -q '^export-package:' Makefile
rg -q '^competition-assets:' Makefile
rg -q 'fill-artifacts-dry-run' Makefile
rg -q 'make verify' README.md CONTRIBUTING.md
rg -q 'make ci' README.md CONTRIBUTING.md .github/workflows/ci.yml
rg -q 'fill-submission-artifacts' README.md CONTRIBUTING.md
rg -q 'agent:json' README.md agent-backend/package.json agent-backend/README.md
rg -q 'DecisionMaker' README.md agent-backend/src/decision-maker.ts
rg -q 'pay_for_premium' README.md agent-backend/src/decision-maker.ts agent-backend/test/decision-maker.test.ts
rg -q 'premiumEvidenceMaxConfidence' agent-backend/src/types.ts agent-backend/src/config.ts
rg -q 'architecture.mmd' README.md docs/architecture.mmd
rg -q 'pay_for_premium' docs/decision_flow.mmd
rg -q 'confidence_distribution.png' README.md scripts/generate-competition-assets.mjs
rg -q 'x402_trigger_rate.png' README.md scripts/generate-competition-assets.mjs
rg -q 'agent_timeline.png' README.md scripts/generate-competition-assets.mjs
rg -q 'does not claim 20\+ live transactions' README.md docs/testnet_evidence.md
rg -q 'RWA Oracle Agent' README.md docs/project-guide.md skills/casper-buildathon-rwa-loop/SKILL.md
rg -q 'Casper AI Toolkit Usage' README.md
rg -q 'Submission Readiness' README.md docs/submission-readiness.md
rg -q 'Comparison With Existing Solutions' README.md
rg -q 'Demo Video Script' docs/demo-video-script.md
rg -q 'DoraHacks Submission Draft' docs/dorahacks-submission-draft.md
rg -q 'TypeScript RWA oracle agent' agent-backend/README.md
rg -q 'mcp:check' README.md agent-backend/package.json
rg -q 'CSPR.trade MCP' README.md docs/submission-readiness.md agent-backend/src/mcp-smoke.ts
rg -qi 'final verification' scripts/final-verify.sh
rg -q 'repo-url' scripts/fill-submission-artifacts.mjs
rg -q 'Submission readiness check' scripts/check-submission-ready.mjs
rg -q 'PAYMENT_REQUIRED' scripts/capture-demo-evidence.sh docs/demo-video-script.md
rg -q 'CI quick check' scripts/ci-quick-check.sh
rg -q 'git archive' scripts/export-submission-package.sh README.md CONTRIBUTING.md
rg -q 'OracleRegistry' docs/project-guide.md DESIGN_TRADEOFFS.md
rg -q 'DataFeed' docs/project-guide.md DESIGN_TRADEOFFS.md
rg -q 'ReputationScore' docs/project-guide.md DESIGN_TRADEOFFS.md
rg -q 'Working prototype deployed on Casper Testnet' docs/official-rules.md
rg -q 'x402' docs/resources.md skills/casper-buildathon-rwa-loop/SKILL.md
rg -q 'make verify' skills/casper-buildathon-rwa-loop/SKILL.md docs/dorahacks-submission-draft.md
rg -q 'PAYMENT-REQUIRED' docs/phase-4-x402.md oracle-server/README.md
rg -q 'PAYMENT_SIGNED' docs/phase-4-x402.md checkpoints/checkpoint-04-phase-4-x402.md
rg -q 'PAYMENT_REQUIRED' README.md docs/demo-video-script.md
rg -q 'Manus' checkpoints/checkpoint-00-phase-0-scaffold.md manus_outbox/checkpoint-00-submit.md
rg -q 'Phase 5' checkpoints/checkpoint-05-phase-5-submission-package.md manus_outbox/checkpoint-05-submit.md
rg -q '\.env' .gitignore
rg -q 'keys/' .gitignore
rg -q '\*.pem' .gitignore
rg -q 'node_modules/' .gitignore
rg -q 'wasm/' .gitignore

echo "Scaffold verification passed: ${#required_paths[@]} required paths present, no secret-like files, no placeholders."
