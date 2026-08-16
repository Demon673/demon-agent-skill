# Glossary

English | [中文](glossary.zh.md)

Domain vocabulary for this repository uses one canonical term per concept. Terms link to their owning document; implementation detail stays in skills and Agent Notes.

## documentation

- **one home per fact** — the rule that each fact lives in exactly one tier and is linked from elsewhere; the core of the documentation standard.
- **slop** — prose that duplicates a rule, narrates change history, restates source, or leaks a reasoning transcript; the documentation standard lists the classes to hunt.
- **tier** — one row of the documentation taxonomy (root `AGENTS.md`, skill, `references/`, Agent Note, `README.md`, `docs/`), each with a job and a set of things that do not belong there.

## skills

- **skill** — a reusable, installable set of task-specific instructions under `skills/<category>/<name>/SKILL.md`.
- **description** — the frontmatter field that is the primary discovery surface; behavior-based and trigger-focused.
- **trigger** — a distinct branch that should cause an agent to load the skill; one per branch, front-loaded in the description.
- **references** — a skill's disclosed reference material, loaded only when the skill's pointer fires.

## agent-notes

- **Agent Note** — a durable proposal or decision record under `.agents/notes/`, preserving rationale, alternatives, consequences, and required verification.
- **lifecycle** — the top-level note folder encoding status: `proposed/`, `implemented/`, `rejected/`, `archived/`.
- **class** — the nested note folder encoding the kind of decision: feature, bug-fix, simplification, architecture, process, or testing.
- **supersession** — when a new note owns a decision an older note recorded; full supersession consolidates, partial supersession cross-links.

## pairing

- **pair** — one bilingual document's three sibling files: `foo.md`, `foo.zh.md`, and the `foo.i18n.yaml` consistency record.
- **counterpart** — the translated `.zh.md` sibling of an English document, or the reverse.
- **sidecar** — the `foo.i18n.yaml` consistency record holding each side's git blob hash.
- **switcher** — the language-switch link each side carries: `English | [中文](foo.zh.md)` and `[English](foo.md) | 中文`.
- **blob hash** — the `git hash-object` content hash of one side, recorded in the sidecar.
- **structural signature** — the ordered mdast-derived shape of a document (heading depths, code blocks, tables, lists, link targets) compared across a pair.

## gates

- **gate** — one deterministic documentation check (pairing, note format, budgets, links, wrap, archive), run by `npm run doc-gates`.
- **mdast** — the Markdown AST these gates build the structural signature from, via the official GFM parser.
