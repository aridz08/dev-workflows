# Artifacts (Dev Workflows)

> Artifacts are the files produced by the workflow.
> They are universal and tool-agnostic.

---

## Universal artifact directories (consumer projects)

Projects using Dev Workflows should have:

```txt
<project>/docs/agent/
  plans/
  reports/
  handoff/
```

---

## Artifact types

### 1) Plans

* Location: `docs/agent/plans/`
* Purpose: define a UI/feature/system before implementation
* Output format: Markdown

### 2) Reports

* Location: `docs/agent/reports/`
* Purpose: analyze existing UI/code and produce actionable fixes
* Output format: Markdown

### 3) Handoff

* Location: `docs/agent/handoff/`
* Purpose: merge multiple inputs into a single execution list
* Output format: Markdown

---

## Naming

* Plans: `plan-<slug>.md`
* Reports: `report-<slug>.md`
* Handoff: `handoff-<slug>.md`

---

## One source of truth rule

When implementing:

* an implementer should execute **one** artifact only

  * a plan OR a report OR a handoff

This prevents contradictions and drift.

---

## Outputs vs Templates (mandatory distinction)

* `docs/agent/` = **workflow outputs** (plans, reports, handoff produced during development)
* `content/core/templates/` = **templates** (source of truth for artifact structure)

Rules:

* `docs/agent/` **never** contains templates, `TEMPLATE.md`, or `*.template.md` files
* Templates are only read from `content/core/templates/` and used to produce outputs in `docs/agent/`

---

## Why artifacts matter

Artifacts make workflows:

* repeatable
* auditable
* shareable
* compatible across tools
