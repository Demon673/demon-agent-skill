# Agent Note: Activate the git hooks and run the gates in CI

Status: implemented

English | [中文](2026-09-16-activate-hooks-and-ci.zh.md)

## Problem

The pack scaffolds `lefthook.yml` and its installer, and this repository documented a division of labour: local hooks cover the staged fast path, CI owns the repository-wide matrix. Neither half ran. `lefthook` was not a dependency, so `.git/hooks/pre-commit` — the lefthook shim — found no binary and exited without inspecting anything, and `.github/` carried no workflows. Every gate therefore depended on a person remembering to run it, and a failing hook nobody executes reads as coverage that does not exist.

## Decision

Keep `lefthook` in `devDependencies`, so the binary survives a clean install, and activate the hooks with `npm run install-lefthook`. This repository's pre-commit jobs re-verify staged pairing records, check archived notes, and reject staged whitespace. [.github/workflows/gates.yml](../../../../.github/workflows/gates.yml) runs `npm run doc-gates`, `.\scripts\validate-skills.ps1`, and `npm test` on pushes to `main` and pull requests, on `windows-latest` because the validator resolves a Windows virtualenv layout and the maintenance scripts are PowerShell. Skill validation prepares the test runner's Python environment; CI installs FFmpeg for media regression tests. [CONTRIBUTING.md](../../../../CONTRIBUTING.md) records the division: CI runs tests and both gates, hooks are the staged fast path, and `npm run install-lefthook` activates them once per clone.

The official checkout and language-setup actions use Node.js 24, requiring Actions runner v2.327.1 or later. `windows-latest` supplies the managed runner; the job's toolchain uses Node.js 22 and Python 3.12 independently of the actions' runtime.

Media dependencies come from a pinned `GyanD/codexffmpeg` release ZIP package. CI verifies its SHA-256 before extraction, checks that `ffmpeg` and `ffprobe` execute, and adds their directory to `PATH`. Version updates change the package URL and digest together.

The `posix-installer` job runs the isolated installer regressions on `ubuntu-latest`, exercising the native Bash branch. The full Windows matrix also covers the Git Bash delegation to PowerShell; Windows-only installer cases are skipped in the POSIX job.

## Alternatives considered

- **Install lefthook with `--no-save`.** Rejected: the binary disappears on the next clean install and the hooks return to failing silently, which is the state being fixed.
- **Add a `prepare` script so `npm ci` activates the hooks.** Rejected: the installer exits non-zero when lefthook is unavailable, and a `prepare` failure fails the whole install, so a machine without the binary could not install dependencies at all. Activation stays an explicit step.
- **Run the skill validator on `ubuntu-latest`.** Rejected: the script resolves `.venv/skill-validation/Scripts/python.exe`, a Windows layout; porting it to POSIX paths belongs to the script, not to the workflow.
- **Leave enforcement manual.** Rejected: no gate ran without someone choosing to run it, and an unrunnable red check is documentation rather than a gate.

## Consequences

- A commit that stages a pairing record, an archived note, or trailing whitespace is blocked locally; the same defects also fail in CI for a clone whose hooks were never activated.
- The repository-wide matrix runs on every push to `main` and every pull request, so a green local run is no longer the only evidence.
- `npm ci` does not activate the hooks: a fresh clone needs one `npm run install-lefthook`.
- Windows runners carry the full matrix cost — the price of the PowerShell and virtualenv tooling the maintenance scripts assume; the focused POSIX job requires only Node and Bash.
