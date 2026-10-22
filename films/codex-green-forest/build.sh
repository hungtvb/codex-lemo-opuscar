#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
LIB="$HOME/lemo-opuscar"
test -f "$LIB/core/render/video.mjs" || { echo "Lemo-Opuscar upstream renderer missing: $LIB" >&2; exit 1; }
mkdir -p "$HERE/out" "$HERE/stills"
cd "$LIB"
node core/render/still.mjs "$HERE" 1.5 7.5 15 22 28 --size 1280x720
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --size 1280x720 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/codex-green-forest.mp4" 24 1
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of json "$HERE/out/codex-green-forest.mp4" | tee "$HERE/out/ffprobe.json"
