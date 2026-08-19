# Agent Note: Restore translate-docs parity with dsh-translate-docs

Status: implemented

English | [中文](2026-08-20-restore-translate-docs-parity.zh.md)

## Problem

The published `translate-docs` kept only the triage-and-finish skeleton of `dsh-translate-docs` (deepseek-harness `.agents/skills/dsh-translate-docs/SKILL.md`). The port rewrote the 74-line body down to 54 lines and dropped the briefing-driven update path (the `gen-translation-brief --apply` mechanical-only shortcut), subagent delegation for prose updates and whole-document batches, the pairing-gate specifics (the `.i18n.yaml` consistency record, the `--write`/`--list` flags, the pairing manifest), and the respond-to-review section. The two skills stopped sharing the extended workflow, and the `docs/i18n/README.md` division-of-labor line that names "briefings, delegated prose" no longer matched the shipped body.

## Decision

Rewrite `translate-docs` to carry the full `dsh-translate-docs` workflow with host references parameterized: the repository's pairing gate, translation rules, terminology table, style samples, and documentation gates replace deepseek-harness paths, commands, and architecture facts. The briefing-driven update path generalizes `pnpm run gen-translation-brief --apply` to "the repository's translation-brief script, when present, with its apply flag", with a diff fallback for hosts that have no brief script (this repository does not). Subagent delegation returns for prose updates and whole-document batches; the `.i18n.yaml` consistency record, the gate's `--write`/`--list` flags, and the pairing manifest return as named specifics; and a respond-to-review section links the terminology-table-is-contract rule to `repo-standards-review`. The invocation boundary keeps the default model-and-user reachability already decided in [restore-flow-cascade](2026-08-19-restore-flow-cascade.md) rather than the source's `disable-model-invocation: true`. This note realizes, rather than reverses, the set-level absorption recorded in [absorb-dsh-skill-set](2026-08-20-absorb-dsh-skill-set.md).

## Alternatives considered

- **Keep the drifted body.** Rejected: the dropped machinery — briefing-driven updates, delegation, pairing-gate specifics, and review response — is the extended workflow `docs/i18n/README.md` already names, and the user requires parity with the source.
- **Port the source's user-only invocation** (`disable-model-invocation: true`). Rejected: already decided in [restore-flow-cascade](2026-08-19-restore-flow-cascade.md); a user-only skill is unreachable by other skills, so the `ask-demon` cascade into `translate-docs` would break.
- **Split the detailed sections into `references/`.** Rejected: each section is a step the workflow reaches in order, not conditional reference, so the body stays self-contained at 69 lines — close to the 74-line source and inside published precedent.
- **Rename it `dsh-translate-docs`.** Rejected: the `dsh-` prefix marks deepseek-harness-internal skills; this repository publishes portable skills under plain names.

## Consequences

- `skills/agent/translate-docs/SKILL.md` grows from 54 to 69 lines and again covers the briefing-driven update path, delegated translation, pairing-gate specifics, and review response.
- The skill stays model- and user-reachable, so the `ask-demon` flow can cascade into it; the source's user-only boundary is deliberately not ported.
- The skill stays host-agnostic: in a host with a translation-brief script it runs the briefing path; without one it falls back to a manual diff, and it names the pairing gate's `.i18n.yaml` record and `--write`/`--list` flags generically.
