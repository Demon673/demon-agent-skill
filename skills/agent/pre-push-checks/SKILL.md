---
name: pre-push-checks
description: Use before pushing, force-pushing, or marking a branch ready for review — and after any history rewrite — to select the smallest checks that cover the outgoing diff instead of reflexively running everything.
---

# Pre-push checks

Run relevant local evidence once before a push. Select the narrowest check that would fail for each regression; CI owns exhaustive coverage and the platform matrix.

## Inspect the outgoing change

1. Confirm the checkout and branch:

```sh
git status --short --branch
git rev-parse --show-toplevel
```

2. Verify the live base or stack parent, then inspect the complete scope against it. Prefer the repository's change-scope tool, when present: it never guesses or fetches a base, so supply the ref you verified and add its head option only when inspecting a commit other than `HEAD` (in a pnpm repository, for example, `pnpm --silent run change-scope --base <verified-base-ref>`). Without that tool, fall back to `git diff --stat origin/$(git branch --show-current) 2>/dev/null || git diff --stat HEAD~1`.

Confirm the files the diff actually touches. After merging a changed base, rerun the scope report, reassess which checks the combined scope can still affect, and rerun only the checks the merge invalidated.

## Select relevant evidence

There is no universal local baseline. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression; add broader checks only for surfaces the diff actually reaches.

- **Package or script behavior:** run the owning test file or focused test name. Add adjacent package tests when a shared contract changes; leave repository-wide coverage to CI unless the change is genuinely cross-cutting or the user requests it.
- **Model-, editor-, CLI-, or terminal-visible output:** run the focused snapshot or real runnable-example scenario that owns the output.
- **Package manifests, public exports, build configuration, or built runtime paths:** run the build, the relevant hygiene checks, and the owning built-artifact smoke.
- **Real provider or agent behavior:** run the relevant end-to-end target when credentials are available; never print secrets.
- **Skill changes** (new `SKILL.md`, frontmatter, body, or manifest): run your repository's skill validator against each changed skill directory, and confirm the manifest lists every skill.
- **Docs or decision records:** run your repository's documentation checks (pairing, note format, budgets, links, wrap, archive).
- **Bilingual pairs:** a change to either side updates the counterpart, then re-record the pair with your repository's pairing check; the pairing gate is green.
- **Whitespace and layout:** `git diff --check`.

Do not manually repeat a passing check merely because a commit or push follows, and do not run a broader suite for a change that only touches one skill or one doc.

### Focus unit coverage on the affected source

Test selection and coverage selection are separate. A test filter chooses which tests run, while the repository's coverage configuration otherwise measures a wider default set. When unit coverage is relevant, name both the owning tests and the source files or package whose coverage those tests must prove. In a Vitest repository:

```sh
pnpm exec vitest run packages/<group>/<package>/tests/<behavior>.spec.ts \
  --coverage \
  --coverage.include='packages/<group>/<package>/src/**/*.ts'
```

Use an exact source file when the behavior is truly confined to one module. Repeat `--coverage.include` for multiple affected files or packages, and pass every owning test file needed to exercise that scope. When the owning tests are unclear, discover a candidate set with the runner's dependency-graph mode (`pnpm exec vitest related packages/<group>/<package>/src/<changed>.ts --run --coverage --coverage.include='packages/<group>/<package>/src/<changed>.ts'` in Vitest), then inspect the selected tests before treating the run as evidence. The configured per-file coverage thresholds still apply inside the selected source scope.

Dependency-graph discovery cannot see behavior reached only through configuration, dynamic loading, subprocesses, workers, built artifacts, or external providers; select those owning tests explicitly. When the selected scope fails a threshold, add its other relevant owning tests, or narrow the source scope only when the excluded modules cannot be affected. Do not use `--passWithNoTests`, lower coverage thresholds, or narrow `--coverage.include` merely to hide an uncovered affected file.

## Full local rehearsal

Run the complete local approximation only when the user explicitly requests it, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible. Use the current workflow and package scripts as the inventory; do not recreate a removed aggregate check script.

## Protect history-rewriting pushes

Rebase is allowed for standalone and stacked branches, including after review. Before a standalone history rewrite, fetch the current remote branch and record its exact OID; publish with `--force-with-lease=<branch>:<observed-oid>` so a concurrent update aborts the push. A stack-management tool supplies lease protection for its managed branches. Raw `--force` is never allowed.

After any rewritten push, fetch the live heads again and re-audit unresolved review threads, approvals, mergeability, and checks. Commit hashes and inline-comment anchors from before the rewrite are not current evidence.

### Post-sync validation

A stack-sync tool that fetches, cascade-rebases, and pushes as one operation (for example, `gh stack sync`) cannot place local validation between rewrite and publication. Before running it, require a clean worktree and record the official stack order and exact remote heads. After it returns:

1. Re-query every branch head and the official stack order.
2. Inspect the changed scope of every rewritten layer against its live base.
3. Run the relevant evidence selected by this skill for each affected layer.
4. Keep every PR unmerged and report validation as pending until all selected checks pass.

If post-sync evidence fails, leave the lease-protected published heads in place, repair the failure, validate the repair, and publish the correction. Do not claim the sync made the stack ready merely because the command succeeded.

## Handle failures

If a relevant check fails before an ordinary push, stop and fix or explain the blocker; do not push and hope CI differs. For the post-sync exception, block the merge and follow the repair procedure above.

If a failure looks environment-specific, prove it: record the exact command, failing test, and platform-specific mismatch; confirm the relevant non-platform evidence; prefer fixing cross-platform nondeterminism when the check is required. Bypass a local check only when the user explicitly asks or agrees, and report exactly what failed and why CI is expected to differ.

## Push procedure

For ordinary and standalone rebase pushes:

1. Run the selected relevant checks once.
2. Commit normally and inspect any files changed by a pre-commit fixer before continuing.
3. Push normally, or use the exact lease for an authorized rewritten branch.
4. Verify the remote ref matches local `HEAD`:

```sh
git rev-parse HEAD origin/$(git branch --show-current)
```

For GitHub PRs, inspect remote CI after the push:

```sh
gh pr checks
```

Report pending checks as pending. Inspect failures before attributing them to the branch or the environment.

For a stack-sync push, use the post-sync validation sequence instead of pretending the ordinary order was possible.
