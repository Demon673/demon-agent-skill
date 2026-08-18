---
name: prune-prompt-pollution
description: Use when writing or reviewing agent instructions and current-state docs — rules files (AGENTS.md/CLAUDE.md), skill bodies and descriptions, prompts, and design/plan/process docs — or on request to prune a task or session file. Restates negation priming, absence declarations, stale meta-narrative, and strawman warnings as positive targets or consequences.
---

# Prune Prompt Pollution

Agent-facing documents steer by what they activate. A prohibition names the forbidden behavior and makes it more available, not less; an absence declaration spends tokens on what is not there; a stale meta-narrative teaches the agent to ignore the document itself; a strawman warning names the temptation and primes it. This skill rewrites those four patterns without weakening the constraints the document carries. It is guidance, not a script.

## Scope

The skill reads prose whose job is to steer the agent's current behavior; records and human-facing text stay with their own standards.

- **In scope, automatic** — rules files (`AGENTS.md` / `CLAUDE.md`), skill bodies and descriptions, prompts and visible strings, and current-state design/plan/process documents.
- **In scope, on request** — task and session files, which mix live guidance with process record; prune them only when asked.
- **Out of scope** — code, commit messages, decision records, postmortems, and player- or user-facing copy. These record history or rationale, or are read by people rather than by the model.

The keep list below is the safety valve: a load-bearing negative is restated as its consequence, never deleted.

## The four patterns

1. **Negation priming** — "don't think of an elephant", "never use X", "avoid Y". The negation is a weak modifier the strongly-activated concept overruns. Restate the positive target: "write one-line comments", "use the official seam". A prohibition stays only as a hard guardrail you cannot phrase positively; even then, pair it with the positive target so attention lands on what to do.
2. **Absence declarations** — "there is no X", "this file does not contain Y". If the document's job is to state what is present, delete the absence line; if the absence is load-bearing (the agent must not assume X exists), state the consequence: "when X is absent, the lookup answers 503".
3. **Stale meta-narrative** — "this doc used to say", "the old version covered", "previously we recommended". The reader needs the current rule, not its history. State the current rule; the history belongs in git log or a decision record.
4. **Strawman warnings** — "some people think X, but we don't", "you might be tempted to Y, but don't". The warning names the temptation and primes it. State the correct pattern directly; the temptation is not the reader's problem.

## Keep these

- **Hard guardrails with no positive phrasing** — "never store literal secrets in credentials" cannot be restated positively without losing the constraint; keep it and pair it with the positive target ("store only `apiKeyEnv` references").
- **Counterfactual regression pins** — "without X, Y happens" states the invariant that keeps the behavior safe; keep it.
- **Load-bearing absences** — "this environment has no database" is a constraint the agent must honor; keep it or restate it as its consequence, never delete it.
- **Suppression justifications** — empty-catch explanations and ignore-reasons are required prose; fix a false reason, never delete it.
- **Measured bounds** — "(measured: 512 nests ≈ 0.15s)" calibrates a constant; the word "measured" is load-bearing.

## Workflow

1. Read the document as the agent will: what does each sentence activate?
2. Classify every suspect passage: negation priming, absence declaration, stale meta-narrative, or strawman warning.
3. Restate the surviving constraint as a positive target or a consequence, and delete the pollution around it.
4. Verify the edit preserves every obligation, invariant, precondition, and postcondition the original carried.

## Examples

| Pollution | Restated |
|---|---|
| "Don't use `var`" | "Use `const` for bindings that never reassign; use `let` when they do." |
| "This file has no tests" | "Coverage lives in `test/`; add one runnable check per non-trivial branch." |
| "The old README recommended X" | "Use X." |
| "You might want to cache this, but don't" | "The lookup is O(1); no cache." |
