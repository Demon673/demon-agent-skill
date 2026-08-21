# Agent Note: Absorb the dsh tooling layer

Status: implemented

English | [中文](2026-08-20-absorb-dsh-tooling.zh.md)

## Problem

The drift audit and a follow-up exploration found deepseek-harness tooling this repository lacked: change-scope (the deterministic diff report that pre-push-checks and code-review were written around), gen-translation-brief (the helper behind translate-docs' briefing-driven update path), verify-doc-refs (a gate for documentation citations in source comments, a link class verify-md-links cannot see), and the lefthook pre-commit hook layer. Host repositories scaffolded by setup-demon-skills also lacked the tools the absorbed skills reference as "when present".

## Decision

Port all four to scripts/ as zero-dependency ESM. change-scope, gen-translation-brief, and verify-doc-refs keep the dsh output contracts (verify-doc-refs scans this repository's file types instead of dsh's package layout); install-lefthook is a deliberately reduced installer — the dsh original carries worktree-local hooks, a pairing merge driver, and migration machinery hosts do not need — and the lefthook template checks staged files with the pairing gate's working-tree mode because the gate has no index mode. Wire verify-doc-refs into run-doc-gates as the seventh gate; pack change-scope and the lefthook template into setup-demon-skills so hosts receive them. Verify-mermaid and doc-typecheck stay deferred: this repository has no mermaid fences and no TypeScript samples in docs, and both gates carry dependency weight hosts should not inherit.

## Alternatives considered

- **Absorb verify-mermaid now.** Deferred: no fences exist here yet, and it needs mermaid and jsdom; the port is recorded for the day the first architecture diagram appears.
- **Absorb doc-typecheck now.** Deferred: it compiles fenced ts blocks; there are none yet.
- **Pack translation-brief and doc-refs into setup.** Deferred: host-optional; keep the setup payload to the tools the absorbed skills reference at runtime.

## Consequences

- pre-push-checks and code-review now have their deterministic scope input in this repository; translate-docs' briefing path is complete end to end.
- doc-gates checks a seventh surface: documentation citations in source comments.
- lefthook.yml and its installer are landed but not activated; run npm run install-lefthook to install the hooks when wanted.
- gen-translation-brief reuses the existing lib helpers (record, git, markdown); the other three stay self-contained so their setup templates remain copy-compatible. No npm dependency was added.
