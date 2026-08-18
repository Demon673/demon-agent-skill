# Agent Note: Add the prune-prompt-pollution skill

Status: implemented

English | [中文](2026-08-18-add-prune-prompt-pollution.zh.md)

## Problem

The published skill set has no skill that keeps agent-facing documents free of prompt pollution — negation priming, absence declarations, stale meta-narrative, and strawman warnings. The maintenance skills cover contract preservation (`prose-standard`) and chain-of-thought leakage (`trim-cot-leakage`), but not these activation patterns, three of which are net-new.

## Decision

Add [`prune-prompt-pollution`](../../../../skills/agent/prune-prompt-pollution/SKILL.md) as a published skill under `skills/agent/`, self-contained so it installs cleanly into a global skill directory. Its scope: apply automatically to agent instructions and current-state docs (rules files, skill bodies and descriptions, prompts, design/plan/process docs); apply to task and session files only on explicit request; never apply to code, commit messages, decision records, postmortems, or player-/user-facing copy. Load-bearing negatives are preserved through a keep list (hard guardrails, counterfactual regression pins, load-bearing absences, suppression justifications, measured bounds).

## Alternatives considered

- **Apply to every agent-consumed document.** Rejected: decision records and postmortems record history and rationale, where "we rejected X" is load-bearing content, not pollution.
- **Fold the four patterns into `prose-standard` or `trim-cot-leakage`.** Rejected: negation priming, absence declarations, and strawman warnings are net-new, and the skill is a distinct fact-positive lens that must install standalone.
- **Carry the exclusion list in the description.** Rejected: a negation in the always-loaded pointer; the body's Scope states the boundary positively.

## Consequences

- The published manifest grows to 12 skills.
- The skill is self-contained, so it installs into global without broken cross-references.
- The steering-prose-versus-records boundary is a deliberate decision; work that wants to scan decision records should revisit it in this note, not change the skill in place.
