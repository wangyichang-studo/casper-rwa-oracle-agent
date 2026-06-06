#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${DEMO_EVIDENCE_PORT:-3102}"
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    -h|--help)
      cat <<'USAGE'
Usage:
  scripts/capture-demo-evidence.sh [--output-dir DIR] [--port PORT]

Starts the local x402 oracle server, runs the agent against the HTTP 402 endpoint,
and writes demo evidence logs plus a Markdown summary. No secrets are required.
USAGE
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$OUTPUT_DIR" ]]; then
  OUTPUT_DIR="$ROOT_DIR/tmp/demo-evidence-$(date +%Y%m%d-%H%M%S)"
fi

mkdir -p "$OUTPUT_DIR"

ORACLE_LOG="$OUTPUT_DIR/oracle-server.log"
AGENT_LOG="$OUTPUT_DIR/agent-http-x402.log"
SUMMARY="$OUTPUT_DIR/summary.md"
PID=""

cleanup() {
  if [[ -n "$PID" ]] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "port $PORT is already in use" >&2
  exit 1
fi

(
  cd "$ROOT_DIR/oracle-server"
  ORACLE_SERVER_PORT="$PORT" node src/server.js
) >"$ORACLE_LOG" 2>&1 &
PID="$!"

for _ in {1..40}; do
  status="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/v1/rwa-risk-score/rwa-demo-warehouse-lease-009" || true)"
  if [[ "$status" == "402" ]]; then
    break
  fi
  sleep 0.25
done

if [[ "${status:-}" != "402" ]]; then
  echo "oracle server did not become ready; last status: ${status:-none}" >&2
  cat "$ORACLE_LOG" >&2 || true
  exit 1
fi

(
  cd "$ROOT_DIR/agent-backend"
  X402_ORACLE_BASE_URL="http://127.0.0.1:$PORT" npm run agent:mock
) >"$AGENT_LOG" 2>&1

required_events=("PAYMENT_REQUIRED" "PAYMENT_SIGNED" "DATA_RECEIVED" "TRANSACTION_PREPARED" "COMPLETE")
for event in "${required_events[@]}"; do
  if ! rg -q "$event" "$AGENT_LOG"; then
    echo "missing demo evidence event: $event" >&2
    exit 1
  fi
done

{
  echo "# Demo Evidence Summary"
  echo
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo
  echo "## Commands"
  echo
  echo '```bash'
  echo "ORACLE_SERVER_PORT=$PORT node oracle-server/src/server.js"
  echo "X402_ORACLE_BASE_URL=http://127.0.0.1:$PORT npm run agent:mock"
  echo '```'
  echo
  echo "## Evidence Files"
  echo
  echo "- Oracle server log: \`$ORACLE_LOG\`"
  echo "- Agent HTTP x402 log: \`$AGENT_LOG\`"
  echo
  echo "## Required Events"
  echo
  for event in "${required_events[@]}"; do
    echo "- $event"
  done
  echo
  echo "## Key Agent Log Lines"
  echo
  echo '```text'
  rg 'PAYMENT_REQUIRED|PAYMENT_SIGNED|DATA_RECEIVED|DECISION|TRANSACTION_PREPARED|COMPLETE' "$AGENT_LOG" || true
  echo '```'
} >"$SUMMARY"

echo "Demo evidence written to $OUTPUT_DIR"
echo "$SUMMARY"
