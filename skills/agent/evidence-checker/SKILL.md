---
name: evidence-checker
description: Track evidence status for important claims, risks, recommendations, reviews, diagnoses, and decisions. Use when the latest user-authored request asks for deep thinking, reliability, confidence, evidence, certainty, risk assessment, technical judgement, review conclusions, or whether something has problems; also use when a decision-relevant conclusion depends on repository state, command output, source material, external facts, prior context, or an inference chain. Do not use for low-risk implementation, simple factual answers, formatting, translation, brainstorming, subjective preference, or when a more specific workflow should own the task.
---

# Evidence Checker

Use this skill to keep important claims tied to their evidence status.

## Core Rule

Do not present guesses as facts. Label only decision-relevant claims, risks, recommendations, and uncertainties. Do not turn ordinary answers into evidence paperwork.

## Evidence States

Use these meanings consistently:

- Verified: checked in this turn through file reads, command output, tool output, or cited source material. User-provided facts may be treated as task premises, but not independently verified unless checked.
- Inferred: reasonably derived from verified facts, but not directly checked.
- Unverified: plausible but not checked in this turn.
- Needs verification: important enough to affect a decision, risk, or next action, and requires another read, command, search, tool, or user answer.

## When To Apply

Apply evidence checking when the user asks for:

- deep thinking, second-pass judgement, or reliability review
- "is this a problem?", "are you sure?", "what is the evidence?", or similar confidence checks
- code, architecture, skill, process, security, release, or migration risk assessment
- technical recommendations or tradeoff decisions
- decision-relevant conclusions that depend on current repository state, command output, external facts, prior context, or inference

Do not apply merely because an answer contains facts. Use normal answering for low-risk or obvious claims.

## Output Style

Prefer prose. Add labels only where they help the user calibrate trust.

For compact answers:

```text
Verified: ...
Inferred: ...
Unverified: ...
Needs verification: ...
Conclusion: ...
```

For ordinary responses, use inline wording:

```text
I verified X in the file. Y is my inference from that. Z is still unverified.
```

Never label every sentence. Focus on claims that affect decisions, risks, or next steps.

## Verification Boundary

This skill does not require browsing, searching, testing, or running commands by itself.

- If needed evidence is cheap and safe to gather locally, gather it.
- If verification requires network access, external systems, credentials, high cost, or destructive actions, explain the verification path and wait for permission when required.
- If the user asks to reason only from provided context or otherwise forbids new inspection, do not gather more evidence; label conclusions using only the supplied material.
- If evidence conflicts, report the conflict instead of forcing one conclusion.

## Confidence Discipline

- Downgrade conclusions when evidence is missing.
- Separate facts from interpretation.
- Avoid certainty words when the claim is inferred or unverified.
- Prefer "I verified...", "I infer...", "I have not checked...", and "this would require..." over vague caveats.
- When a claim is stale or time-sensitive, mark it as needing verification unless it was checked in this turn.

## Independence And Boundaries

This skill has no dependency on other skills.

- If another workflow, tool, or user instruction owns specialized discovery, let it own discovery; this skill only calibrates evidence status for important conclusions.
- Do not save durable context just because evidence was checked. Save or update context only when the user explicitly asks for that.
- Do not turn evidence checking into scope clarification, research, review, testing, or diagnosis. Use it to label what is verified, inferred, unverified, or needs verification.

## Examples

Skill review:

```text
Verified: The frontmatter says the skill triggers on "multi-step" requests.
Inferred: That may over-trigger because many normal coding tasks are multi-step.
Needs verification: Field use should confirm whether this actually happens.
Conclusion: tighten the trigger before installing broadly.
```

Repository state:

```text
Verified: `git status -sb` shows one local commit ahead of origin.
Unverified: I have not checked remote branch protection.
Conclusion: pushing may work, but branch rules could still block it.
```

Provided-context-only:

```text
Based only on the pasted snippet, X looks risky. I have not checked the rest of the repo, so this is an unverified risk rather than a confirmed bug.
```
