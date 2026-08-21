# Agent Note: Absorb the dsh tooling layer

Status: implemented

English | [中文](2026-08-20-absorb-dsh-tooling.zh.md)

## Problem

The drift audit and a follow-up exploration found deepseek-harness tooling this repository lacked: change-scope (the deterministic diff report that pre-push-checks and code-review were written around), gen-translation-brief (the helper behind translate-docs' briefing-driven update path), verify-doc-refs (a gate for documentation citations in source comments, a link class verify-md-links cannot see), and the lefthook pre-commit hook layer. Host repositories scaffolded by setup-demon-skills also lacked the tools the absorbed skills reference as "when present".

## Decision

Port all four to scripts/ as zero-dependency ESM with output contracts identical to the dsh originals; wire verify-doc-refs into run-doc-gates as the seventh gate; pack change-scope and the lefthook template into setup-demon-skills so hosts receive them. Verify-mermaid and doc-typecheck stay deferred: this repository has no mermaid fences and no TypeScript samples in docs, and both gates carry dependency weight hosts should not inherit.

## Alternatives considered

- **Absorb verify-mermaid now.** Deferred: no fences exist here yet, and it needs mermaid and jsdom; the port is recorded for the day the first architecture diagram appears.
- **Absorb doc-typecheck now.** Deferred: it compiles fenced ts blocks; there are none yet.
- **Pack translation-brief and doc-refs into setup.** Deferred: host-optional; keep the setup payload to the tools the absorbed skills reference at runtime.

## Consequences

- pre-push-checks and code-review now have their deterministic scope input in this repository; translate-docs' briefing path is complete end to end.
- doc-gates checks a seventh surface: documentation citations in source comments.
- lefthook.yml and its installer are landed but not activated; run npm run install-lefthook to install the hooks when wanted.
- Every port reuses the existing lib helpers (record, git, markdown) and adds no npm dependency.
