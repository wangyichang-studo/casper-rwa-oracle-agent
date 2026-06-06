#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run_step() {
  local label="$1"
  shift
  printf '\n==> %s\n' "$label"
  "$@"
}

run_step "Scaffold and secret hygiene" "$ROOT_DIR/scripts/verify-phase0.sh"

run_step "Agent npm ci" bash -lc "cd '$ROOT_DIR/agent-backend' && npm ci"

run_step "Agent tests" bash -lc "cd '$ROOT_DIR/agent-backend' && npm test"

run_step "Agent TypeScript build" bash -lc "cd '$ROOT_DIR/agent-backend' && npm run build"

run_step "Agent MCP smoke check" bash -lc "cd '$ROOT_DIR/agent-backend' && npm run mcp:check"

run_step "x402 oracle-server tests" bash -lc "cd '$ROOT_DIR/oracle-server' && npm test"

run_step "Final artifact fill dry run" bash -lc "cd '$ROOT_DIR' && make fill-artifacts-dry-run"

run_step "Git whitespace check" bash -lc "cd '$ROOT_DIR' && git diff --check"

printf '\nCI quick check passed.\n'
