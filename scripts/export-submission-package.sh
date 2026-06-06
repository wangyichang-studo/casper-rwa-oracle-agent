#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/tmp/submission-package"
ALLOW_DIRTY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --allow-dirty)
      ALLOW_DIRTY=1
      shift
      ;;
    -h|--help)
      cat <<'USAGE'
Usage:
  scripts/export-submission-package.sh [--output-dir DIR] [--allow-dirty]

Creates a git-archive source package from HEAD plus a manifest. The archive only
contains tracked files, so ignored runtime output and local secrets are excluded.
Use --allow-dirty only for testing the exporter before committing changes.
USAGE
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

cd "$ROOT_DIR"

branch="$(git branch --show-current)"
commit="$(git rev-parse --short=12 HEAD)"
full_commit="$(git rev-parse HEAD)"
timestamp="$(date +%Y%m%d-%H%M%S)"
archive_name="casper-rwa-oracle-agent-${commit}.tar.gz"
manifest_name="casper-rwa-oracle-agent-${commit}-manifest.md"

if [[ "$ALLOW_DIRTY" -ne 1 ]] && [[ -n "$(git status --short)" ]]; then
  echo "working tree is dirty; commit or stash changes before exporting" >&2
  git status --short >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

archive_path="$OUTPUT_DIR/$archive_name"
manifest_path="$OUTPUT_DIR/$manifest_name"

git archive --format=tar.gz --prefix="casper-rwa-oracle-agent-$commit/" HEAD > "$archive_path"

{
  echo "# Casper RWA Oracle Agent Submission Package"
  echo
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "Branch: \`$branch\`"
  echo "Commit: \`$full_commit\`"
  echo "Archive: \`$archive_path\`"
  echo
  echo "## Remote"
  echo
  if git remote -v | grep -q .; then
    echo '```text'
    git remote -v
    echo '```'
  else
    echo "No git remote is configured yet. Create the public repository and push this branch before final DoraHacks submission."
  fi
  echo
  echo "## Export Notes"
  echo
  echo "- Archive is generated from tracked files at HEAD using \`git archive\`."
  echo "- Ignored files such as \`.env\`, \`keys/\`, \`*.pem\`, \`node_modules/\`, \`tmp/\`, and generated WASM output are not included."
  echo "- Run \`make verify\` before publishing the repository."
  echo "- Run \`make submission-check\` only after public repo/video/Testnet hashes are filled."
  echo
  echo "## Archive Contents Preview"
  echo
  echo '```text'
  tar -tzf "$archive_path" | sed -n '1,120p'
  echo '```'
} > "$manifest_path"

echo "Submission package written:"
echo "- $archive_path"
echo "- $manifest_path"
