#!/usr/bin/env bash
set -euo pipefail

required_paths=(
  ".gitignore"
  "DESIGN_TRADEOFFS.md"
  "EVOLUTION_LOG.md"
  "README.md"
  "agent-backend/package.json"
  "agent-backend/package-lock.json"
  "agent-backend/tsconfig.json"
  "agent-backend/.env.example"
  "agent-backend/README.md"
  "agent-backend/src/agent.ts"
  "agent-backend/src/chain-publisher.ts"
  "agent-backend/src/config.ts"
  "agent-backend/src/data-collector.ts"
  "agent-backend/src/evidence.ts"
  "agent-backend/src/logger.ts"
  "agent-backend/src/risk-assessor.ts"
  "agent-backend/src/types.ts"
  "agent-backend/data/rwa-cases.json"
  "agent-backend/test/agent.test.ts"
  "agent-backend/test/evidence.test.ts"
  "agent-backend/test/logger.test.ts"
  "agent-backend/test/risk-assessor.test.ts"
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
  "docs/official-rules.md"
  "docs/project-guide.md"
  "docs/resources.md"
  "docs/demo-video-outline.md"
  "docs/phase-2-deployment.md"
  "docs/phase-3-agent.md"
  "checkpoints/checkpoint-00-phase-0-scaffold.md"
  "checkpoints/checkpoint-03-phase-3-agent.md"
  "manus_outbox/checkpoint-00-submit.md"
  "manus_outbox/checkpoint-03-submit.md"
  "manus_feedback/feedback_log.md"
  "manus_feedback/Manus 反馈 — Checkpoint 00.md"
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
rg -q 'RWA Oracle Agent' README.md docs/project-guide.md skills/casper-buildathon-rwa-loop/SKILL.md
rg -q 'TypeScript RWA oracle agent' agent-backend/README.md
rg -q 'OracleRegistry' docs/project-guide.md DESIGN_TRADEOFFS.md
rg -q 'DataFeed' docs/project-guide.md DESIGN_TRADEOFFS.md
rg -q 'ReputationScore' docs/project-guide.md DESIGN_TRADEOFFS.md
rg -q 'Working prototype deployed on Casper Testnet' docs/official-rules.md
rg -q 'x402' docs/resources.md skills/casper-buildathon-rwa-loop/SKILL.md
rg -q 'Manus' checkpoints/checkpoint-00-phase-0-scaffold.md manus_outbox/checkpoint-00-submit.md

echo "Scaffold verification passed: ${#required_paths[@]} required paths present, no secret-like files, no placeholders."
