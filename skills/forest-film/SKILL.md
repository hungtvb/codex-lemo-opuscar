---
name: forest-film
description: Produce short code-rendered animated films using the actual upstream Lemo-Opuscar style library and rendering pipeline. Use for film, short video, animation, or Chú bé Codex khám phá khu rừng xanh.
---

# Lemo-Opuscar Film Director for Codex

1. Run `bash skills/forest-film/scripts/bootstrap.sh` from the workspace repository. Confirm it reports `LIB=<path>`.
2. Read `$LIB/AGENTS.md`, `$LIB/DIRECTOR.md`, `$LIB/TECHNIQUE.md`, `$LIB/styles/README.md`, and the chosen style's `STYLE.md` and `DEMO.md`.
3. Create a project directory `films/<film-slug>`. Write the original `TREATMENT.md` **before** downloading or reading style demo source. For the supplied sample, use `examples/codex-green-forest/TREATMENT.md`.
4. Pick a style from the actual upstream catalog. For a painterly forest story, consider `watercolor` but follow its brush-stroke grammar; don't fake watercolor with flat vector shapes.
5. Only after writing the treatment, download demo source using upstream `setup.sh demo <slug>` if needed. Implement film-specific scenes and character animation. Follow upstream browser contract: `window.READY`, `window.DUR`, deterministic `window.render(t)`, optional `window.EV` and `window.TEXTS(t)`.
6. Render styleframes and inspect before full video. Fix composition, typography, proportions, continuity, character identity, animation and frame defects.
7. Render from the upstream library root, replacing the project path:

   `node core/render/video.mjs /absolute/path/to/films/<film-slug> --fps 24 --workers 3 --size 1280x720 --out /absolute/path/to/films/<film-slug>/out/video.mp4`

8. Use upstream mux and quality-check tools where appropriate, and run `ffprobe` on final MP4. Inspect at least five representative frames.
9. Deliver MP4, treatment, source, selected frames and QC notes. Report actual execution evidence and any blockers.

**Non-negotiable:** Never claim a successful Lemo-Opuscar render unless the upstream toolchain actually ran. If setup fails, report failure rather than silently substituting another renderer.
