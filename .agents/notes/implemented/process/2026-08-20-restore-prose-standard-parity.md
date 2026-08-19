# Agent Note: Restore prose-standard parity with dsh-prose-standard

Status: implemented

English | [中文](2026-08-20-restore-prose-standard-parity.zh.md)

## Problem

The published `prose-standard` kept only the skill-and-docs half of `dsh-prose-standard` (deepseek-harness `.agents/skills/dsh-prose-standard/SKILL.md`). The decoupling in [2026-08-18-publish-general-skills](2026-08-18-publish-general-skills.md) narrowed the required-coverage list to skills, descriptions, instruction files, READMEs, Agent Notes, comments, and strings, dropping the code-prose locations — JSDoc, internal and module comments, tests, cookbooks, postmortems, diagnostics, and configuration comments — and the fuller inputs, exclusions, workflow, and borderline handling. The two skills stopped sharing functionality: feature drift rather than generalization, and the [absorption map](../../../../docs/skills-map.md) "code-prose coverage restored as union" disposition no longer matched the shipped body.

## Decision

Rewrite [`prose-standard`](../../../../skills/agent/prose-standard/SKILL.md) as the union: keep the skill/docs required-coverage sections, restore the code-prose locations, and generalize host references so the body names no deepseek-harness path, command, or architecture fact. The full per-location coverage list moves to [`references/coverage.md`](../../../../skills/agent/prose-standard/references/coverage.md), and the two example sets merge into [`references/examples.md`](../../../../skills/agent/prose-standard/references/examples.md), so `SKILL.md` stays concise while losing no coverage or example. The frontmatter name and invocation defaults are unchanged; the description gains the code-prose triggers. This realizes, rather than reverses, the absorption recorded in [2026-08-20-absorb-dsh-skill-set](2026-08-20-absorb-dsh-skill-set.md).

## Alternatives considered

- **Keep the drifted body.** Rejected: the user requires the union with `dsh-prose-standard`, and the dropped code-prose locations — JSDoc, tests, diagnostics, postmortems — are where contract preservation matters most for code-facing changes.
- **Keep the full coverage list inline in `SKILL.md`.** Rejected: the merged list spans fifteen locations and pushes past the conciseness default; the repository standard moves detailed, conditional material into `references/`, loaded only when the skill fires.
- **Rename it `dsh-prose-standard`.** Rejected: the `dsh-` prefix marks deepseek-harness-internal skills; this repository publishes portable skills under their plain names.

## Consequences

- [`SKILL.md`](../../../../skills/agent/prose-standard/SKILL.md) keeps the complete-proposition core and the guidance-not-a-script guardrail, restores the code-prose coverage and the fuller workflow, and points the per-location detail and examples at `references/`.
- [`references/coverage.md`](../../../../skills/agent/prose-standard/references/coverage.md) carries the union coverage list; [`references/examples.md`](../../../../skills/agent/prose-standard/references/examples.md) merges both example sets without dropping any.
- The description now names JSDoc, code and test comments, diagnostics, and CLI or UI strings, so code-prose requests can trigger the skill.
- The skill stays host-agnostic: a run in deepseek-harness reproduces the dsh-flavored behavior from the same body; a run in any other repository applies the same workflow to that host's conventions.
