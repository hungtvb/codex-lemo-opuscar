#!/usr/bin/env bash
set -euo pipefail
LIB="${LEMO_LIB:-$HOME/lemo-opuscar}"
if [[ ! -f "$LIB/AGENTS.md" ]]; then
  git clone --depth 1 https://github.com/lemomo-ai/lemo-opuscar.git "$LIB"
fi
[[ -f "$LIB/plugin/skills/lemo-opuscar/scripts/setup.sh" ]] || { echo "Upstream setup script missing" >&2; exit 1; }
sh "$LIB/plugin/skills/lemo-opuscar/scripts/setup.sh" deps
echo "LIB=$LIB"
