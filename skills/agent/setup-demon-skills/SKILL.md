---
name: setup-demon-skills
description: Configure a repository for the docs-maintenance skills — scaffold the Agent Note decision tree, the bilingual pairing convention, the documentation standard, the session-discipline lines, and the documentation budget gate, and record where they live. Run once before first use of the maintenance flow.
disable-model-invocation: true
---

# Setup Demon Skills

Scaffold the per-repository conventions the maintenance flow assumes:

- **Agent Note tree** — the `.agents/notes/{proposed,implemented,rejected,archived}/{class}/` layout and the note format.
- **Bilingual pairing** — the `foo.md` + `foo.zh.md` + `foo.i18n.yaml` triplet convention and both switcher lines.
- **Documentation standard** — the `docs/AGENTS.md` structure, tier, budget, and slop rules that `doc-standards` applies.
- **Session discipline** — the four standing-order lines that gate execution, verification, and destructive actions.
- **Documentation budget gate** — the self-contained `verify-doc-budgets` script plus its manifest that enforce the standard's ceilings.
- **Where they live** — a line in the repository's root `AGENTS.md` pointing at the four doc locations.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Read what exists; do not assume:

- `AGENTS.md` at the repository root — is there already a documentation/decisions section?
- `.agents/notes/` — does the note tree already exist?
- `docs/i18n/` — does a bilingual pairing convention already exist?
- `docs/AGENTS.md` — does a documentation standard already exist?
- The root `AGENTS.md` — does a session-discipline block already exist?
- `scripts/` — does a documentation budget gate already exist?

### 2. Scaffold what is missing

- **Agent Note tree**: if `.agents/notes/` is absent, create the lifecycle and class directories and a short `README.md` stating the note format — `# Agent Note: <title>` / `Status: <status>`, a first `## Problem` section, then `## Decision` / `## Alternatives considered` / `## Consequences`.
- **Bilingual pairing**: if no pairing convention exists, record the triplet rule and both switcher lines in a short `docs/i18n/README.md`.
- **Documentation standard**: if absent, create a short `docs/AGENTS.md` stating the tutorial/reference forms, the one-home-per-fact taxonomy, word budgets, and the slop checklist; `doc-standards` owns the workflow that applies it.
- **Session discipline**: append the four standing-order lines to the root `AGENTS.md`:

```
Act only on an explicit execution signal and confirmed scope; otherwise ask one clarifying question.
A red check blocks the commit: fix it or explain it in the same turn, and name every failed check in the final report.
Inspect a file before editing or describing it; never present content as read or work as done that you have not verified.
Destructive or irreversible actions (deletions, history rewrites, force-push) require an explicit, named confirmation.
```

- **Documentation budget gate**: copy this skill's `scripts/verify-doc-budgets.mjs` into the host's `scripts/` and `scripts/doc-budgets.manifest.template.json` to `scripts/doc-budgets.manifest.json`; then adjust the ceilings to the host's always-loaded docs. The gate runs as `node scripts/verify-doc-budgets.mjs`, and `--list` prints the table.
- **Record the pointers**: add a line to the root `AGENTS.md` pointing at the note rules, the pairing contract, the documentation standard, and the session discipline.

### 3. Confirm before writing

Present each scaffolded piece and its destination; write only after the user confirms.

### 4. Hand off

Once scaffolded, the governance run (ask `ask-demon` to govern the docs) audits and enforces the standard going forward.
