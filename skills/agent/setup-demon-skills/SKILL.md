---
name: setup-demon-skills
description: Configure a repository for the docs-maintenance skills — scaffold the Agent Note decision tree and the bilingual pairing convention, and record where they live. Run once before first use of the maintenance flow.
disable-model-invocation: true
---

# Setup Demon Skills

Scaffold the per-repository conventions the maintenance flow assumes:

- **Agent Note tree** — the `.agents/notes/{proposed,implemented,rejected,archived}/{class}/` layout and the note format.
- **Bilingual pairing** — the `foo.md` + `foo.zh.md` + `foo.i18n.yaml` triplet convention and both switcher lines.
- **Where they live** — a line in the repository's root `AGENTS.md` pointing at both.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Read what exists; do not assume:

- `AGENTS.md` at the repository root — is there already a documentation/decisions section?
- `.agents/notes/` — does the note tree already exist?
- `docs/i18n/` — does a bilingual pairing convention already exist?

### 2. Scaffold what is missing

- **Agent Note tree**: if `.agents/notes/` is absent, create the lifecycle and class directories and a short `README.md` stating the note format — `# Agent Note: <title>` / `Status: <status>`, a first `## Problem` section, then `## Decision` / `## Alternatives considered` / `## Consequences`.
- **Bilingual pairing**: if no pairing convention exists, record the triplet rule and both switcher lines in a short `docs/i18n/README.md`.
- **Record the pointers**: add a line to the root `AGENTS.md` pointing at the note rules and the pairing contract.

### 3. Confirm before writing

Present each scaffolded piece and its destination; write only after the user confirms.
