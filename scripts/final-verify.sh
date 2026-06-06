#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -d "$HOME/.cargo/bin" ]]; then
  export PATH="$HOME/.cargo/bin:$PATH"
fi

if [[ -d "$HOME/.rustup/toolchains/nightly-aarch64-apple-darwin/bin" ]]; then
  export PATH="$HOME/.rustup/toolchains/nightly-aarch64-apple-darwin/bin:$PATH"
fi

run_step() {
  local label="$1"
  shift
  printf '\n==> %s\n' "$label"
  "$@"
}

run_step "Scaffold and secret hygiene" "$ROOT_DIR/scripts/verify-phase0.sh"

run_step "Odra contract tests" bash -lc "cd '$ROOT_DIR/contracts/rwa-oracle' && cargo odra test"

run_step "Odra WASM build" bash -lc "cd '$ROOT_DIR/contracts/rwa-oracle' && DYLD_LIBRARY_PATH=\"\$(rustc --print sysroot)/lib\" cargo odra build -c RwaOracle"

run_step "Livenet deploy binary check" bash -lc "cd '$ROOT_DIR/contracts/rwa-oracle' && cargo check --features livenet --bin deploy"

run_step "Agent tests" bash -lc "cd '$ROOT_DIR/agent-backend' && npm test"

run_step "Agent TypeScript build" bash -lc "cd '$ROOT_DIR/agent-backend' && npm run build"

run_step "Agent mock demo" bash -lc "cd '$ROOT_DIR/agent-backend' && npm run agent:mock"

run_step "CSPR.trade MCP smoke check" bash -lc "cd '$ROOT_DIR/agent-backend' && npm run mcp:check"

run_step "x402 oracle-server tests" bash -lc "cd '$ROOT_DIR/oracle-server' && npm test"

run_step "Git whitespace check" bash -lc "cd '$ROOT_DIR' && git diff --check"

printf '\nFinal verification passed.\n'
