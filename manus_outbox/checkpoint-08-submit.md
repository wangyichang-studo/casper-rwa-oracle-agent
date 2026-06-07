# Manus Submission - Checkpoint 08 Automated Demo Recording

Please review Checkpoint 08 for the Casper RWA Oracle Agent.

## Context

The user supplied a task document requesting an automated demo script and asked Codex to record the demo itself. Codex created the script, rendered a terminal-style MP4 locally, and verified it.

No private key, PEM, `.env`, API key, wallet material, or raw RWA/KYC document is included in this submission.

## Files To Inspect

- `checkpoints/checkpoint-08-demo-recording.md`
- `scripts/demo.sh`
- `docs/how-to-record-demo.md`
- `scripts/render-demo-video.sh`
- `scripts/render-terminal-video.swift`
- `.gitignore`

## Runtime And Video Evidence

- Default script runtime: `139 seconds`
- Generated video: `/Users/wangyichang/Documents/黑客松/demo/casper-rwa-oracle-agent-demo.mp4`
- Video duration: `146.000000` seconds
- Video resolution: `2560x1440`
- Video size: about `29 MB`
- Thumbnail extracted at 45 seconds and visually checked as readable and nonblank.

## Truncated Runtime Log

First 50 and last 20 lines are saved in `checkpoints/checkpoint-08-demo-recording.md`.

## Verification

- `./scripts/demo.sh --plain --fast`: passed.
- `./scripts/demo.sh --plain`: passed, 139 seconds.
- `./scripts/render-demo-video.sh`: passed.
- `ffprobe demo/casper-rwa-oracle-agent-demo.mp4`: passed.
- `ffmpeg` thumbnail extraction at 45 seconds: passed.
- `git diff --check`: passed.
- `make ci`: passed.

## Specific Review Questions

1. Does `scripts/demo.sh` cover the right demo story for the DoraHacks video?
2. Is the 139-second default runtime appropriate for the requested 2-3 minute demo?
3. Is the rendered terminal-style MP4 acceptable as a backup demo video, or should the final uploaded video still be a live terminal screen recording?
