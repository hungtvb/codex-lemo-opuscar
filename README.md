# Codex × Lemo-Opuscar Film Skill

A Codex skill that drives the **actual upstream Lemo-Opuscar** code-based film-production pipeline, rather than substituting a separate Python/PIL animation engine.

## Install

Clone this repository into your Codex workspace, then copy `skills/forest-film` to `~/.agents/skills/forest-film` for auto-discovery. Keep this repository checked out as the working project to access the sample treatment.

Requirements: Node 20+, FFmpeg, Python, Playwright/browser dependencies, and GitHub access.

## Run

Ask Codex:

> Use forest-film to produce the film in examples/codex-green-forest/TREATMENT.md. Render with upstream Lemo-Opuscar, inspect frames, run quality checks and deliver MP4 plus sources.

The skill's bootstrap script clones upstream https://github.com/lemomo-ai/lemo-opuscar and runs its dependency installer.

## Execution status

This repository contains the skill, setup script and example treatment. It **does not claim a successful upstream render**. Film production requires running the skill in a Codex environment with dependencies installed and inspecting the resulting output.

## Upstream

Lemo-Opuscar: https://github.com/lemomo-ai/lemo-opuscar (MIT code license; demo and asset licenses may differ).
