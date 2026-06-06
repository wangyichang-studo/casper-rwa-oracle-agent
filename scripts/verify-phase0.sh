#!/usr/bin/env bash
set -euo pipefail

required_paths=(
  ".gitignore"
  "README.md"
  "agent-backend/.gitkeep"
  "contracts/.gitkeep"
  "oracle-server/.gitkeep"
  "docs/official-rules.md"
  "docs/project-guide.md"
  "docs/resources.md"
  "docs/demo-video-outline.md"
  "checkpoints/checkpoint-00-phase-0-scaffold.md"
  "manus_outbox/checkpoint-00-submit.md"
  "manus_feedback/feedback_log.md"
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
  \( -name '*.pem' -o -name '*.key' -o -name '.env' -o -name '.env.*' \) \
  -print | grep -q .; then
  echo "secret-like files are present in the working tree"
  exit 1
fi

if rg -n '\b(TBD|TODO|FILL_ME|CHANGE_ME)\b' README.md docs checkpoints manus_outbox skills; then
  echo "placeholder text found"
  exit 1
fi

rg -q 'Casper Innovation Track' docs/official-rules.md
rg -q 'RWA Compliance Agent' README.md docs/project-guide.md
rg -q 'Working prototype deployed on Casper Testnet' docs/official-rules.md
rg -q 'x402' docs/resources.md skills/casper-buildathon-rwa-loop/SKILL.md
rg -q 'Manus' checkpoints/checkpoint-00-phase-0-scaffold.md manus_outbox/checkpoint-00-submit.md

echo "Phase 0 verification passed: ${#required_paths[@]} required paths present, no secret-like files, no placeholders."
