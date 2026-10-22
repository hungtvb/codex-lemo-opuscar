#!/usr/bin/env python3
"""Evidence-first Lemo-Opuscar delivery gate. Python stdlib + ffprobe.
Usage: python verify_delivery.py <workspace> --video <path> [--allow-partial]

The script blocks claims of fully following the skill when native style
modules/gates were not run. It cannot replace a human visual review.
"""
import argparse
import glob
import json
import pathlib
import subprocess
import sys

def fail(message):
    print("QUALITY GATE FAIL:", message, file=sys.stderr)
    sys.exit(2)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("workspace", help="Directory containing film/, qa/, and evidence.json")
    p.add_argument("--video", required=True)
    p.add_argument("--allow-partial", action="store_true",
                   help="Permit an explicitly declared native capability fallback")
    a = p.parse_args()
    root = pathlib.Path(a.workspace).resolve()
    evidence_path = root / "qa" / "evidence.json"
    if not evidence_path.is_file():
        fail("qa/evidence.json missing: cannot claim skill usage")
    data = json.loads(evidence_path.read_text(encoding="utf-8"))
    for field in ("upstream_sha", "style_slug", "native_modules_loaded_and_invoked",
                  "model_sheet", "0_2s_action_strip", "manual_visual_review",
                  "fallback_modules_and_reasons"):
        if field not in data or data[field] in (None, "", []):
            if field == "fallback_modules_and_reasons" and field in data:
                continue
            fail("Required evidence is missing: " + field)
    sha = data["upstream_sha"]
    if len(sha) != 40 or any(c not in "0123456789abcdef" for c in sha.lower()):
        fail("Invalid upstream commit SHA")
    if len(data["native_modules_loaded_and_invoked"]) < 3:
        fail("Only a renderer was used; no meaningful style module reuse")
    for field in ("model_sheet", "0_2s_action_strip"):
        file = root / data[field]
        if not file.is_file() or file.stat().st_size < 2000:
            fail("Required visual proof not found: " + str(file))
    if len(glob.glob(str(root / "film" / "stills" / "*.jpg"))) < 5:
        fail("Need at least five actual rendered styleframes")
    if len(str(data["manual_visual_review"]).strip()) < 55:
        fail("Visual quality notes are too short, likely not a substantive review")
    if not (root / "film" / "TREATMENT.md").exists():
        fail("TREATMENT.md missing")
    if not (root / "film" / "CREDITS.md").exists():
        fail("CREDITS.md missing")
    video = pathlib.Path(a.video).resolve()
    if not video.is_file():
        fail("MP4 does not exist: " + str(video))
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate",
         "-of", "json", str(video)],
        capture_output=True, text=True, check=True)
    probe = json.loads(result.stdout)
    streams = probe["streams"]
    v = next((x for x in streams if x.get("codec_name") == "h264"), None)
    aud = next((x for x in streams if x.get("codec_name") == "aac"), None)
    if not v or not aud:
        fail("Expected H264 video and AAC audio")
    expected = float(data["video_ffprobe"]["duration_seconds"])
    duration = float(probe["format"]["duration"])
    if abs(duration - expected) > 0.15:
        fail("Duration mismatch: actual %.3f, expected %.3f" % (duration, expected))
    if v.get("r_frame_rate") != "24/1":
        fail("Expected 24 FPS")
    if int(v["width"]) < 720:
        fail("Video width too small")
    fallback = data["fallback_modules_and_reasons"]
    if fallback:
        print("STATUS: PARTIAL SKILL COMPLIANCE")
        print("REASON:", "; ".join(str(x) for x in fallback))
        if not a.allow_partial:
            fail("Required style module fallback: cannot claim FULL compliance")
    else:
        print("STATUS: CHECKED COMPLIANCE (manual review still required)")
    print("PASS: actual upstream style modules, evidence, review and playable media")
    print("FILM:", video)
    print("RUNTIME:", duration, "s; STYLE:", data["style_slug"], "SHA:", sha)

if __name__ == "__main__":
    main()
