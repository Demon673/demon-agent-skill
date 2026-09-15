# Agent Note: Skill edits install at release time, not at edit time

Status: implemented

English | [中文](2026-09-16-install-at-release-time.zh.md)

## Problem

A skill edited in this repository and the copy an agent environment runs are separate artifacts, and the repository stated no sync point between them. A contributor — or an agent helping one — reads a working change as evidence that the installed skill already carries it, then copies the edited folders into the installed skills directory. That copy is unversioned, drifts from the repository, and hides whether the change ever travelled through the pack's own install path. A rename or a moved skill is when the temptation is strongest, because the installed directory then holds a name the source no longer has.

## Decision

State the boundary in the root `AGENTS.md` installation section: editing a skill changes the source only, and the installed copy updates when the pack is installed or released, so a skill under development stays uninstalled until that install. The repository's install scripts stay the only writers of the installed directory.

## Alternatives considered

- **Sync the installed copy as part of a change that renames or moves a skill.** Rejected: it makes one environment read better while creating a second source of truth that no gate checks — the installed directory is a build output, and its divergence is invisible to every check this repository runs.
- **Leave the boundary unstated and rely on the install scripts' own documentation.** Rejected: the install scripts describe how to install, not when installation is owed, and the question arrives during authoring rather than at install time.

## Consequences

- A change to a skill's name, path, or content lands in the repository alone; an agent environment keeps the previous release until it installs the new one.
- Reviewers read a work-in-progress skill in a diff rather than in an installed directory.
- Releasing and installing stay the only paths from source to a live skill, so what runs in an environment is always a published state of the pack.
