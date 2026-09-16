# Agent Note: Act on the workspace-standards review

Status: implemented

English | [中文](2026-09-16-act-on-standards-review.zh.md)

## Problem

The workspace-standards review ran every skill the review names as a source of truth — `prose-standard`, `trim-cot-leakage`, `prune-prompt-pollution`, `doc-standards`, `translate-docs`, `archive-agent-notes`, `find-simplifications`, and `writing-for-agents` from Matt's pack — over the whole documentation corpus, plus delegated passes over the Agent Note tree and the skill corpus. The findings were defects no green gate can see: a private project's name published in a public skill reference; an always-loaded root `AGENTS.md` at exactly its word ceiling with a procedure, an environment cache, and a hand-restated inventory inside it; a gate list restated in three homes and stale in all three; seven decision records describing mechanisms that had since changed; an archive mechanism that could not be used at all; and fifteen skill descriptions that restate their own bodies.

## Decision

Apply the corrections, in batches:

- **Root `AGENTS.md`** loses the duplicated invocation rule, the hand-restated skill inventory, the `agents/openai.yaml` line that restates what each skill folder shows, and the Quality Gate procedure with its regex; the pass and its command move to `workspace-standards-review`'s blocking requirement, where the check belongs. The release-time install boundary moves to `CONTRIBUTING.md`, a contributor procedure. The file drops from 720 to 628 of 720 words.
- **The gate list** has one home: `run-doc-gates.mjs`. `README.md`, `docs/glossary.md`, and the `adopt-dsh-documentation-standards` note point at it instead of enumerating six of the seven gates.
- **Seven Agent Note pairs** are corrected to shipped reality: the `publish-general-skills` rename history, `codex-metadata`'s `allow_implicit_invocation` claim, `restore-flow-cascade`'s published-vs-internal split, `restore-translate-docs-parity`'s missing-brief-script claim, `pack-session-discipline`'s standing-order count, `absorb-dsh-tooling`'s unactivated hooks, and the rename note's decaying mention count. The Chinese side of `add-roblox-ui-skill` renders `skill` as the terminology table requires.
- **Skill-level**: the private project name in `solid-panorama-ui.md` is removed and its case study anonymized; `setup-demon-skills` names only the consumer that reads the change-scope tool; `find-simplifications` drops a host-specific pre-push claim; `change-scope.mjs` states its non-obvious contract; the Roblox trio unifies the evidence-grading wording and names each other; `roblox-typescript-developer` states that framework layers are out of scope.
- **Descriptions**: fifteen skills have their trigger paragraph rewritten under `writing-for-agents` — one trigger per branch, no shop-window inventory of the body, no negated instructions.
- **Two Agent Note triplets are archived** — `bind-flow-skills` and `absorb-code-review-checklist` — with their inbound links retargeted and the archive sealed. Archival exposed three latent gate defects, all fixed: `verify-md-links` and `verify-md-wrap` tested the archived-tree exclusion against a forward-slash path, so on Windows they inspected the frozen tree and failed the build over links nothing may edit; and `verify-archived-agent-notes --write` crashed on its success line after writing the manifest.
- **The tracker carries the documented labels.** `triage-labels.md` claims the five canonical roles are the labels in this repository's tracker, and two issue templates name labels that did not exist. Six labels were created on the remote; no file changed.

## Alternatives considered

- **Report the findings and change nothing.** Rejected: a review whose defects stay in place is a report about documentation, not review work, and several findings — a published private project name, a dead pointer in a published skill, an unusable archive — carry real cost.
- **Soften `triage-labels.md` instead of creating the labels.** Rejected: the file exists to make Matt's `triage` and `wayfinder` roles work in this tracker; making the tracker true costs one command and keeps both the table and the templates valid.
- **Defer the archival until the gates can handle an archived tree.** Rejected: the gates were already wrong, and fixing them is smaller than leaving two superseded notes in the active tree.
- **Keep the Quality Gate command in the root `AGENTS.md`.** Rejected: an always-loaded file is the wrong home for a procedure, and the review skill already owns the check it belongs to.

## Consequences

- The documentation corpus now agrees with shipped reality in the places the review checked; the root `AGENTS.md` carries standing orders only and has headroom again.
- The archive is usable: two triplets are sealed, and `verify-md-links`/`verify-md-wrap` skip the frozen tree on every platform.
- Deliberate keeps: the evidence-grading sentence stays repeated in the three Roblox skills, because a host can install one without the others and needs the contract at its point of use; `show-me`'s description stays as upstream wrote it, because `sync-show-me.ps1` mirrors that file verbatim; and `ask-demon`'s per-skill re-summary stays, since a router that names its skills is routing, not duplication — revisit if it drifts.
- The review itself is not repeated here: its method, coverage, and the findings that produced no change are recorded in the session that ran it.
