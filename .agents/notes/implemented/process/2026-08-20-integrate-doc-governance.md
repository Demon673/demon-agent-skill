# Agent Note: Integrate doc governance into the flow

Status: implemented

English | [中文](2026-08-20-integrate-doc-governance.zh.md)

## Problem

A first attempt packaged whole-repository doc governance as a standalone user-invoked `govern-docs` skill. That wrapper restated the delegate mapping doc-standards already carries, competed with ask-demon for the same router slot, and added a third delegation layer. The user's requirement is not a separate command but governance that runs along the pack's existing skill flow.

## Decision

Delete the uncommitted `govern-docs` skill. Integrate governance into the flow instead: the main flow gains a conditional `doc-standards` step between review and simplify (every doc-touching change passes the structural gate), and ask-demon gains a documented governance run — foundation check, audit via doc-standards, fix by domain after confirmation, close out through the gates and the main flow. doc-standards' description names the governance triggers, and setup-demon-skills hands off to the run after scaffolding.

## Alternatives considered

- **Standalone govern-docs skill.** Rejected: a thin wrapper that restates the delegation doc-standards already owns; two routers would split the user's entry-point attention.
- **Merge the governance run into doc-standards.** Rejected: flow descriptions belong to the router; doc-standards stays the audit engine.
- **No governance run at all.** Rejected: whole-repository doc audits are a recurring ask and deserve a named path with a completion criterion.

## Consequences

- One router (ask-demon) owns all flow descriptions; one engine (doc-standards) owns the audit workflow; no duplicated delegation map.
- Doc-touching changes now pass the structural gate inside the main flow, so governance is continuous rather than an occasional command.
- Whole-repository governance is a named run with per-step confirmation and a close-out that reuses the existing gates and notes.
