# Naming (Dev Workflows)

> This file defines naming conventions for the Dev Workflows repo.

---

## Core

### Workflows

* Location: `content/core/workflows/<domain>/`
* Naming:

  * `WORKFLOW.md` for the main entry
  * supporting docs: `steps.md`, `rules.md`, `examples.md`

Example:

```txt
content/core/workflows/ui/
  WORKFLOW.md
  steps.md
  rules.md
  examples.md
```

### Skills

* Location: `content/core/skills/<skill-name>/`
* Naming:

  * `SKILL.md` is the entry
  * optional: `examples.md`, `refs.md`

Example:

```txt
content/core/skills/forms/
  SKILL.md
  examples.md
```

### Templates

* Location: `content/core/templates/<type>/`
* Naming:

  * `<name>.template.md`

---

## Bridges

* Location: `content/bridges/<tool>/`

Example:

```txt
content/bridges/claude/
content/bridges/cursor/
```

---

## Dist

* Location: `content/dist/<tool>/`
* Dist is generated.

---

## Docs

* `docs/ARCHITECTURE.md`
* `docs/ROADMAP.md`
* `docs/DECISIONS.md`

---

## Slugs

Slugs should be:

* lowercase
* hyphen-separated
* short but meaningful

Examples:

* `ui-editor-layout`
* `cursor-bridge-v1`
