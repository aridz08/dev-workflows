# UI Workflow

## Purpose

Provide a deterministic workflow to:

* analyze existing UI
* design new UI intentionally
* implement changes with high consistency

This workflow exists to reduce:

* visual drift
* inconsistent patterns
* "AI-generated UI" look

---

## Roles

### 1) UI Analyst

* Input: screenshot or component path
* Output: `docs/agent/reports/report-<slug>.md`

### 2) UI Architect

* Input: feature request / UI goal
* Output: `docs/agent/plans/plan-<slug>.md`

### 3) UI Implementer

* Input: ONE artifact (plan OR report OR handoff)
* Output: code changes

### 4) UI Reviewer (optional)

* Input: implemented changes
* Output: review notes (optional)

---

## Core rules

### One source of truth

UI Implementer executes exactly one artifact:

* plan OR report OR handoff

---

### Consistency-first

Before writing code:

* read existing base components
* extract standards (sizes, borders, tokens)

---

### No arbitrary values

Use Tailwind scale values only.

---

## Artifact directories

```txt
docs/agent/
  plans/
  reports/
  handoff/
```

---

## Outputs

* Plans: define layout, states, a11y
* Reports: list issues + fixes
* Handoff: merge multiple inputs

---

## When to use this workflow

* Any UI change affecting layout, spacing, typography, or patterns
* Any refactor of a UI section
* Any new UI component/page
