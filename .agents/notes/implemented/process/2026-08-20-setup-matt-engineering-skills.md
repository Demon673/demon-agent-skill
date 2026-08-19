# Agent Note: Configure Matt engineering skills for this repo

Status: implemented

English | [中文](2026-08-20-setup-matt-engineering-skills.zh.md)

## Problem

Matt's engineering skills (grill, to-spec, to-tickets, implement, code-review, triage, wayfinder) assume per-repo configuration that this repository had none of: where the issue tracker lives, the triage label vocabulary, and where domain docs live.

## Decision

Configure via the setup-matt-pocock-skills flow: issues and specs live as GitHub issues driven by the `gh` CLI, with "PRs as a request surface" off; the five canonical triage labels map to strings equal to their names; domain docs use the single-context layout (`CONTEXT.md` at the root plus `docs/adr/`, created lazily by domain-modeling). The configuration is recorded under `docs/agents/` as bilingual triplets, and an `## Agent skills` block in the root `AGENTS.md` points at it. The AGENTS.md word-budget ceiling rises from 600 to 620 words, because the file was already at the ceiling and the mandated block needs the space.

## Alternatives considered

- **Local-markdown tracker under .scratch/.** Rejected: this is a public GitHub repo with a remote; the gh-CLI flow is the default posture of the skills.
- **Multi-context domain docs.** Rejected: no monorepo signals (no workspace file, no packages/).
- **Custom triage label strings.** Rejected: the default labels match the skills' canonical roles one-to-one.

## Consequences

- Matt's engineering skills can now create, read, triage, and close issues in this repo, and locate domain docs when exploring.
- The root AGENTS.md gains one Agent-skills block; docs/agents/ joins the bilingual-triplet convention.
- Switching trackers or labels later is a docs/agents/ edit plus re-running setup-matt-pocock-skills.
