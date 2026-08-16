# Agent Note: Adopt the dsh documentation standard and gate toolchain

Status: implemented

English | [中文](2026-08-17-adopt-dsh-documentation-standards.zh.md)

## Problem

The repository shipped skills, an `AGENTS.md`, and a README, but had no stated documentation standard: no rule for where a fact belongs, no decision-record format, and no bilingual convention. Each new skill and doc was written ad hoc, so placement, detail level, and English/Chinese coverage drifted.

The upstream DeepSeek Harness repository carries a mature documentation system — a documentation standard, a bilingual pairing contract, an Agent Note decision-record format, and maintenance skills — enforced by a pnpm gate toolchain built on the official mdast/GFM parser.

## Decision

Adopt the DeepSeek Harness documentation conventions and port its pnpm gate toolchain to Node ESM scripts that reuse the official mdast/GFM parser:

- A documentation standard at [`docs/AGENTS.md`](../../../../docs/AGENTS.md): tutorial/reference classification, one-home-per-fact taxonomy, writing rules, word-budget ceilings, and a slop checklist.
- A bilingual pairing contract at [`docs/i18n/README.md`](../../../../docs/i18n/README.md): English `foo.md` plus Chinese `foo.zh.md` plus a `foo.i18n.yaml` consistency record holding both sides' git blob hashes, mutual switchers, and a machine-checked mdast structural signature; [`translation-rules.md`](../../../../docs/i18n/translation-rules.md) and [`terminology.md`](../../../../docs/i18n/terminology.md) complete the i18n docs.
- An Agent Note decision-record system under [`.agents/notes/`](../../README.md): path-encoded `{lifecycle}/{class}/date-topic`, a fixed header block and per-lifecycle skeleton, and a mandatory Alternatives-considered section.
- Node ESM gate scripts ported from the upstream pnpm gates, using the official mdast/GFM parser: [`verify-translation-pairing.mjs`](../../../../scripts/verify-translation-pairing.mjs) with `scripts/lib/{markdown,record,git}.mjs` (`--list` / `--write` / `--check`), plus `verify-agent-note-format`, `verify-md-wrap`, `verify-md-links`, `verify-doc-budgets`, and `verify-archived-agent-notes`, orchestrated by [`run-doc-gates.mjs`](../../../../scripts/run-doc-gates.mjs) as `npm run doc-gates`.
- Eight maintenance skills under [`skills/agent/`](../../../../skills/agent/) repurposed from the upstream `dsh-*` skills, renamed to generic prefixes and scoped to this repository.

Instruction files named `AGENTS.md` and `SKILL.md` files remain English-only; content documents under `docs/` and active Agent Notes are bilingual triplets.

## Alternatives considered

- **Reimplement the gates in the upstream's TypeScript/pnpm workspace.** Rejected: the repository is not a Node workspace; the same checks port to plain Node ESM with the same mdast/GFM parser and a minimal three-package dependency set.
- **English-only, no bilingual convention.** Rejected: the repository's README and audience are bilingual, so content docs need Chinese counterparts.
- **Keep the `dsh-*` skill names.** Rejected: those names and their bodies target the upstream harness, not this repository; generic names scope them here and stay reusable.
- **Copy the whole `docs/` corpus verbatim.** Rejected: most of it documents the harness's TypeScript packages and has no counterpart here.

## Consequences

- Documentation now has one home per fact, a reviewable bilingual convention, and a machine-checked decision-record format.
- `npm run doc-gates` enforces pairing (triplet, hashes, mdast structure), note format, budgets, links, wrap, and archive seals; review still owns parity and translation quality.
- The gate scripts carry the same mdast/GFM structural signature as upstream without a TypeScript workspace.
