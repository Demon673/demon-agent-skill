# Agent Note: Configure Matt engineering skills for this repo

Status: implemented

English | [中文](2026-08-20-setup-matt-engineering-skills.zh.md)

## Problem

Matt's engineering skills (grill, to-spec, to-tickets, implement, code-review, triage, wayfinder) assume per-repo configuration that this repository had none of: where the issue tracker lives, the triage label vocabulary, and where domain docs live.

## Decision

Configure via the setup-matt-pocock-skills flow: [issues and specs](../../../../docs/agents/issue-tracker.md) live as GitHub issues driven by the `gh` CLI, with "PRs as a request surface" off; the five canonical [triage labels](../../../../docs/agents/triage-labels.md) map to strings equal to their names; [domain docs](../../../../docs/agents/domain.md) use the single-context layout ([GLOSSARY.md](../../../../GLOSSARY.md) at the root plus `docs/adr/`, created lazily by domain-modeling). The glossary follows Matt's current filename convention so skills find and update the same vocabulary without a repository-specific alias. The configuration is recorded under `docs/agents/` as bilingual triplets, and the root [Agent skills block](../../../../AGENTS.md#agent-skills) links each configuration directly. The active word-budget ceilings live in the [budget manifest](../../../../scripts/doc-budgets.manifest.json).

## Alternatives considered

- **Local-markdown tracker under .scratch/.** Rejected: this is a public GitHub repo with a remote; the gh-CLI flow is the default posture of the skills.
- **Multi-context domain docs.** Rejected: no monorepo signals (no workspace file, no packages/).
- **Custom triage label strings.** Rejected: the default labels match the skills' canonical roles one-to-one.
- **A repository-specific glossary filename alias.** Rejected: the standard filename lets installed skills discover the existing terms directly; preserving the definitions and bilingual triplet keeps the migration local.

## Consequences

- Matt's engineering skills can now create, read, triage, and close issues in this repo, and locate domain docs when exploring.
- The root AGENTS.md gains one Agent-skills block; docs/agents/ joins the bilingual-triplet convention.
- Switching trackers or labels later is a docs/agents/ edit plus re-running setup-matt-pocock-skills.
- The bilingual scope and automatic translation briefing discover the root glossary. The [glossary scope acceptance check](../../../../scripts/test-glossary-scope.mjs) exercises whole-corpus discovery, rejection of an out-of-sync pair, and automatic briefing in an isolated repository.
