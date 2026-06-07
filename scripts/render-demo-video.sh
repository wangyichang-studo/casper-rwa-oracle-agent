#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUTPUT="${1:-$ROOT_DIR/demo/casper-rwa-oracle-agent-demo.mp4}"
WORK_DIR="$ROOT_DIR/tmp/demo-video-$(date +%Y%m%d-%H%M%S)"
TRANSCRIPT="$WORK_DIR/transcript.txt"
FRAMES_DIR="$WORK_DIR/frames"

mkdir -p "$FRAMES_DIR" "$(dirname "$OUTPUT")"

echo "Capturing demo transcript..."
./scripts/demo.sh --plain --fast >"$TRANSCRIPT" 2>&1

echo "Rendering terminal frames..."
swift "$ROOT_DIR/scripts/render-terminal-video.swift" "$TRANSCRIPT" "$FRAMES_DIR"

echo "Encoding MP4..."
ffmpeg -hide_banner -loglevel error -y \
  -framerate 5 \
  -i "$FRAMES_DIR/frame_%05d.png" \
  -c:v libx264 \
  -preset veryfast \
  -crf 20 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$OUTPUT"

echo "Video written to $OUTPUT"
echo "Transcript written to $TRANSCRIPT"
