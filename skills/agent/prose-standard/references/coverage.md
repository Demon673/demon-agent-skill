# Required coverage by prose location

Use this list when judging whether a passage is complete; it expands the pointer in `SKILL.md`. This is not a one-way shortening pass: add or restore prose when code, types, and structure do not communicate a required contract below, and do not add a comment when those facts are already obvious locally.

## Skills and instructions

- **Skill `SKILL.md`:** state behavioral guardrails and explicit scope limitations such as "guidance, not a script or checklist." Keep the workflow concise and link its source of truth; move detailed, conditional, or platform-specific material into `references/`.
- **Skill descriptions:** front-load the trigger, list one trigger per distinct branch, and cut identity the body already carries.
- **Instruction files (`AGENTS.md` and equivalents):** one to three lines per rule, each linking its home; no restated procedures.

## Code prose

Comments and scripts document non-obvious contracts and rationale, not what the code already shows; delete control-flow narration and restatement.

- **Public JSDoc:** document caller-visible return distinctions, throws or rejections, side effects, ownership, timing, cancellation, and durability.
- **Internal comments:** orient non-local structure and obviously complicated local structure, including invariants, race ordering, ownership, security boundaries, and surprising failure behavior. Delete control-flow narration and code restatement.
- **Module comments:** state the module's role, dependencies, responsibilities, and non-obvious architecture choices; link architecture choices to their owning explanation.
- **Tests:** explain only non-obvious test design — why a fixture, assertion, platform accommodation, real entry path, or indirect observation is necessary. Delete walkthroughs and inventories.
- **Diagnostics:** name the failing subject or path, violated rule, and correction when it is non-obvious. Remove internal execution narration.

## Docs and reference

- **READMEs:** include the consumer contract — install, configuration, semantics, failures, limitations, extension points, and model-visible effects — and link generated catalogs and owning docs. Quote stable model-visible text owned by the package; link cross-package owners. Keep durable gaps and maintainer traps, not ordinary cleanup inventories.
- **Cookbooks:** include prerequisites, required actions, the real entry path, observable verification, and concise warnings.
- **Postmortems:** retain the incident sequence, evidence, causal chain, impact, and prevention. Remove repeated persuasion or implementation detail that does not establish causality.
- **Agent Notes:** retain unique rationale, mechanisms, alternatives, consequences, shipped verification evidence, and named coverage gaps. Implemented notes state shipped reality in the present tense; remove planning checklists, not evidence of what pins the decision.

## Config and strings

- **Examples and configuration comments:** explain access limits, non-obvious wiring or load order, security stance, replay behavior, exceptions, and likely misuse. Do not narrate entries that the configuration already shows.
- **Prompts and visible strings:** treat wording as behavior. Inspect generated output and run behavior validation or state why no snapshot applies.
