---
name: forest-film
description: Direct and produce an original code-animated film using upstream Lemo-Opuscar's actual style modules, actor rigs, shot grammar, audio workflow, local preview loop, and renderer. Mandatory for cinematic short films or character animation; never treat the renderer alone as skill compliance.
---

# Forest Film / Lemo-Opuscar — strict skill-first workflow (v2)

## Rules of engagement

**The skill is a production method, not an MP4 command.** Merely using `core/render/video.mjs` DOES NOT count as following Lemo-Opuscar. Obey all applicable requirements in upstream `AGENTS.md`, `DIRECTOR.md`, `TECHNIQUE.md`, and `styles/<chosen>/STYLE.md`. For implementation details, use `DEMO.md` only **after** your original treatment is written. Never copy an upstream demo's story, characters, music or signature shots.

If a required native subsystem cannot run, show the failure and mark it **PARTIAL**, with the exact substitute used. Never quietly invent a substitute renderer, animated rig or visual effects pipeline.

## Hard gates — stop on failure

**G0 / Intake & environment**
- Identify user goal, runtime, length, target medium, film language and production constraints.
- Read the upstream directing/technique/style guidance in full. Verify actual upstream commit SHA, installed browser, and FFmpeg.
- Write `TREATMENT.md` first: three candidate concepts, choice, benchmarks (grammar only), character bible, timed shot list, camera motives, cue map, sound map, captions, copyright and acceptance criteria.
- Only afterwards inspect `DEMO.md` or upstream demo implementation.

**G1 / Native module inventory**
- List real upstream modules for **character design**, **rig/cel geometry**, **palette/lighting**, **FX**, **post**, and **renderer**.
- Build scenes with direct imports from upstream modules wherever there is a matching capability. In `cel-anime-80s`, reuse `cel.js`, `head80.js`, `pal.js`, `fx.js`, and preferably `post.js`; inspect native `bg.js`, `hud.js` and their APIs for relevant reuse. Imported symbols must actually be called, not decorative.
- Record module provenance and runtime evidence in `qa/evidence.json`, including any unavailable capability and fallback.
- Favor an original treatment and **reused rendering grammar** over cloning a demo scene.

**G2 / Character and visual proof**
- Generate a consistent model sheet with neutral, emotional and key-action poses using the **actual drawing code**.
- Render at least two nonadjacent styleframes in the final aspect ratio; inspect expressions, silhouettes, proportions, foreground/background separation, key readability and typography.
- Correct faults before proceeding. A generic vector stick rig does not satisfy this gate.

**G3 / Performance proof**
- Construct joints, body root and planted feet as pose data. For each meaningful action: anticipation → contact → follow-through → recovery, with defensible physical continuity.
- Respect the style's animation cadence: cel-anime actors at 12 FPS, camera and practicals at 24 FPS.
- Render a real 0.2-second-spaced action strip around an impact; inspect each panel for limbs detaching, foot sliding, props floating, opponent not reacting, or illogical overlap.
- Do not generate a multi-minute film until a 5–10-second local sequence visibly meets these criteria.

**G4 / Direction & sound**
- Create an original synchronized music/foley cue map. Every important physical action gets an identifiable sound. Include dynamics or silence before impact; voices/captions follow chosen language.
- Use at least three purposeful camera framings, respect action geography, and do not hide animation deficiencies with flashes, particles, camera shake or LUTs.
- Mix video and score to a sensible level (nominal integrated loudness −14 LUFS) and review at real playback speed.

**G5 / Render, watch, revise, deliver**
- Before describing the film as compliant, run `python skills/forest-film/scripts/verify_delivery.py <workspace> --video <mp4>` against real artifacts. If it fails, do not claim successful skill execution. If a native capability such as WebGL post is unavailable, repeat with `--allow-partial` only when the fallback is documented, and describe the result as **PARTIAL**, never full compliance.
- First test **locally** with the upstream renderer: `node core/render/video.mjs <film> --fps 24 --workers 3 --size 1280x720 --out <film>/out/picture.mp4`.
- Run `ffprobe` for codec, exact duration, size, FPS and audio. Inspect 5–10 stills plus the 0.2-second action strip; watch at normal speed, including beginning, impact and ending.
- Record failed checks and run at least one visual correction pass. Never report **SUCCESS** based on GitHub Actions or an MP4 existing.
- Deliver MP4, TREATMENT, project source, model sheet, action strip, poster, credits/licences and factual QC notes. Separate **objective encoding success** from **subjective animation quality**.

## Compliance report required in every delivery

```
upstream_sha:
style_slug:
native_modules_loaded_and_invoked:
fallback_modules_and_reasons:
model_sheet:
styleframes:
0_2s_action_strip:
local_preview:
renderer:
video_ffprobe:
manual_visual_review:
limitations:
```

Do not say “used all skills” if any required module/gate was skipped or substituted. CI is for repeatable final validation — not the default creative iteration loop. The next release must not repeat the earlier failure mode of hand-authored generic shapes passed through only the upstream video renderer.

For a reproducible project-specific example, see the original 10-second local test and quality evidence generated for **LỆNH CUỐI**; do not reuse its story for unrelated user briefs.
