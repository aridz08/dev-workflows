# Dev Workflows — Decisions

This document tracks the key decisions that shape Dev Workflows.

The goal is to prevent design drift and avoid re-litigating the same discussions.

---

## Decision 001 — Repo name

* **Decision:** `dev-workflows`
* **Status:** Accepted
* **Why:** clear, tool-agnostic, domain available

---

## Decision 002 — Architecture

* **Decision:** Tool-agnostic core + tool-specific bridges + generated dist
* **Status:** Accepted
* **Why:** single source of truth, scalable, avoids duplication

---

## Decision 003 — Unix-first

* **Decision:** Unix-first support (symlinks as primary strategy)
* **Status:** Accepted
* **Why:** fastest path to MVP; Windows support can be added later

---

## Decision 004 — Distribution modes

* **Decision:** support both `link` and `copy` modes
* **Status:** Accepted
* **Why:** personal workflows need symlinks; teams/CI need vendoring

---

## Decision 005 — Tiered tool support

* **Decision:** Tier 1 first (Claude Code, Cursor, Gemini)
* **Status:** Accepted
* **Why:** avoids scope creep and maintenance explosion
