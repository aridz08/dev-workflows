# Conventions (Dev Workflows)

This document defines the core conventions for Dev Workflows.

These conventions are intentionally minimal.

---

## Core rules

### 1) Single source of truth

* `content/core/` is the source of truth
* tool-specific formats belong in `bridges/`
* generated output belongs in `dist/`

---

### 2) Core is tool-agnostic

Nothing in `content/core/` should reference:

* Claude
* Cursor
* Gemini
* Antigravity
* any editor

---

### 3) Bridges translate, they do not invent

Bridges:

* map content from the core
* define paths and file formats
* never add new intent

---

### 4) Dist is generated

* `dist/` is never edited manually
* `dist/` must be reproducible

---

### 5) Artifacts are universal

Workflow outputs are stored as:

```txt
docs/agent/
  plans/
  reports/
  handoff/
```

---

### 6) Small composable files

* prefer multiple small skills over one mega-file
* prefer references over duplication

---

## Repo hygiene

* Keep docs updated
* Keep decisions recorded in `docs/DECISIONS.md`
