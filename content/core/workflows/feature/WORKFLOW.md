# Feature Workflow

## Purpose

Provide a universal workflow to build features with AI assistance while keeping:

* scope controlled
* implementation deterministic
* changes reviewable

This workflow is intentionally generic.

---

## When to use

* Any feature that changes behavior
* Any new user flow
* Any refactor that impacts multiple files

---

## Roles

### 1) Feature Analyst

* Goal: clarify scope and constraints
* Output: a **report** if analyzing existing behavior

### 2) Feature Architect

* Goal: design the change before code
* Output: a **plan**

### 3) Feature Implementer

* Goal: implement exactly one artifact
* Output: code changes

### 4) Reviewer

* Goal: validate behavior + consistency
* Output: review notes (optional)

---

## Core rules

### Rule 1 — Plan before code

If the change impacts:

* multiple files
* public APIs
* data models
* user flows

Then a plan is mandatory.

---

### Rule 2 — One source of truth

The implementer executes exactly one artifact:

* plan OR report OR handoff

---

### Rule 3 — Small changes

* implement in steps
* verify after each step

---

## Artifact output

```txt
docs/agent/
  plans/
  reports/
  handoff/
```

---

## Suggested plan outline

Use `content/core/templates/plans/plan.template.md`.

---

## Suggested review

Review should verify:

* scope matches plan
* no extra features added
* conventions followed
