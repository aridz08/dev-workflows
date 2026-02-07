# UI Workflow — Enforcement Rules

> These rules exist to keep the workflow deterministic.

---

## Rule 1 — One source of truth

The implementer must execute exactly one artifact:

* a plan OR
* a report OR
* a handoff

Never mix multiple artifacts.

---

## Rule 2 — No design during implementation

The implementer:

* does not redesign
* does not change layout direction
* does not introduce new patterns

If redesign is needed → go back to UI Architect.

---

## Rule 3 — Standards extraction first

Before implementing any UI change:

* read existing base components
* extract exact values (height, border, shadow, focus)

---

## Rule 4 — UI Gate is mandatory

Every implementation must end with a UI Gate checklist.

---

## Rule 5 — Incremental changes

Implement in small steps:

* change
* verify
* repeat
