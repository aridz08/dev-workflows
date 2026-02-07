# Dev Workflows

**Universal developer workflows for AI coding tools.**

Dev Workflows is a **tool-agnostic workflow kit** that helps you keep a consistent development workflow across multiple AI editors/agents (Claude Code, Cursor, Gemini CLI…).

It’s built around a simple idea:

* Maintain a **single source of truth** (`content/core/`) for workflows, skills, templates, and conventions.
* Use **bridges** (`bridges/`) to translate that core into each tool’s native configuration format.
* Produce a **ready-to-use output** (`dist/`) and apply it to projects via a CLI.

> This is **not** a “prompt pack” and **not** just a “config sync tool”.
> The focus is **workflow governance + enforcement** to reduce drift and keep AI-assisted development predictable.

---

## Why

If you use more than one AI tool, you’ve seen the pain:

* Every tool has its own config format (`CLAUDE.md`, `.cursor/rules`, `GEMINI.md`, …)
* Rules drift over time
* You end up maintaining the same intent N times
* Agents ignore instructions because the loop is not closed

Dev Workflows keeps one core and generates the rest.

---

## How it works

```txt
content/core/    -> tool-agnostic workflows, skills, templates, conventions (source of truth)
bridges/ -> per-tool adapters that translate the core (no creativity)
dist/    -> generated output ready to link/copy into projects
cli/     -> init/update/doctor commands
```

---

## Status

Early stage. Unix-first.

**Tier 1 tools (planned first):**

* Claude Code
* Cursor
* Gemini CLI

---

## Quickstart (Unix-first)

> The CLI is not implemented yet in this repo draft. This section will be updated once `dev-workflows` exists.

Expected flow:

1. Install the global pack (mirror repo) into your profile:

```bash
# example (placeholder)
git clone <repo> ~/.dev-workflows
cd ~/.dev-workflows
pnpm install
pnpm build
```

2. Initialize a project:

```bash
# example (placeholder)
dev-workflows init --tool claude,cursor --mode link
```

---

## Supported modes

* **link**: uses symlinks (recommended for personal Unix setups)
* **copy**: vendors files into the repo (recommended for teams/CI)

---

## Repo layout

```txt
dev-workflows/
  content/core/
    workflows/
    skills/
    templates/
    conventions/
  bridges/
    claude/
    cursor/
    gemini/
  dist/
  scripts/
  docs/
```

---

## Contributing

Contributions are welcome, especially for:

* Bridge maintenance (tool format changes)
* New tool adapters
* Workflow packs (UI, backend, release, etc.)

See `CONTRIBUTING.md` (to be added in Block 1).

---

## License

MIT (recommended).
