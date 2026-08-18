---
name: pre-push-checks
description: Use before pushing, force-pushing, or marking a branch ready for review — and after any history rewrite — to select the smallest checks that cover the outgoing diff instead of reflexively running everything.
---

# Pre-push checks

Run relevant local evidence once before a push. Select the narrowest check that would fail for each regression; CI owns exhaustive coverage and the platform matrix.

## Inspect the outgoing change

```sh
git status --short --branch
git rev-parse --show-toplevel
git diff --stat origin/$(git branch --show-current) 2>/dev/null || git diff --stat HEAD~1
```

Confirm the checkout, branch, and the files the diff actually touches.

## Select relevant evidence

- **Skill changes** (new `SKILL.md`, frontmatter, body, or manifest): run your repository's skill validator against each changed skill directory, and confirm the skill manifest lists every skill.
- **Docs or decision records**: run your repository's documentation checks (pairing, note format, budgets, links, wrap, archive).
- **Bilingual pairs**: a change to either side updates the counterpart, then re-record the pair with your repository's pairing check; the pairing gate is green.
- **Whitespace and layout**: `git diff --check`.

Do not repeat a passing check merely because a commit or push follows. Do not run a broader suite for a change that only touches one skill or one doc.

## Protect history-rewriting pushes

Before a history rewrite, fetch the current remote branch and record its exact OID; publish with `--force-with-lease=<branch>:<observed-oid>` so a concurrent update aborts the push. Raw `--force` is never allowed.

After any rewritten push, re-audit unresolved review threads, approvals, mergeability, and checks; commit hashes and inline-comment anchors from before the rewrite are not current evidence.

## Handle failures

If a relevant check fails before an ordinary push, stop and fix or explain the blocker; do not push and hope CI differs. If a failure looks environment-specific, record the exact command, confirm the non-platform evidence, and bypass a local check only when the user explicitly agrees — reporting what failed and why CI is expected to differ.

## Push procedure

1. Run the selected checks once.
2. Commit normally and inspect any files changed by a pre-commit fixer.
3. Push normally, or use the exact lease for an authorized rewritten branch.
4. Verify the remote ref matches local `HEAD`:

```sh
git rev-parse HEAD origin/$(git branch --show-current)
```

Report remote checks as pending until they finish.
