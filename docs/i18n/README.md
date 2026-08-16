# Bilingual documentation

English | [中文](README.zh.md)

This repo's documentation is read by people in both languages, so every in-scope document is maintained in English and Simplified Chinese. This page defines the pairing contract, the gate, scope, and exclusions; [terminology.md](terminology.md) is the terminology source of truth. Routine counterpart updates are made directly; the extended [`translate-docs`](../../skills/agent/translate-docs/SKILL.md) workflow runs only on explicit user invocation.

## The pairing contract

- **Both languages carry equal authority.** A document may be authored in either language first; the counterpart is translated from it. What binds the two is that they must say the same thing.
- **A pair is three sibling files.** The English `foo.md`, the Chinese `foo.zh.md`, and a consistency record `foo.i18n.yaml`, all in the same directory. No locale directories and no interleaved bilingual files. A pair merges whole: a PR never lands one language without the other two files.
- **Language switcher.** Immediately after its H1, each side links its counterpart: `English | [中文](foo.zh.md)` on the English side and `[English](foo.md) | 中文` on the Chinese side.
- **Structure mirrors the counterpart.** Heading depths and order, list kinds and starts, list item counts, table row and column counts, link targets, and verbatim code blocks match across the pair. Code blocks stay byte-identical, comments included.

The consistency record holds the full git blob hash of each side as of the last time the two were confirmed to say the same thing:

```yaml
foo.md: 3f786850e387550fdab836ed7e6dc881de23001b
foo.zh.md: 89e6c98d92887913cadf06b2adb97f26cde4849b
```

Blob hashes, not commit hashes, so the record is computable for files edited in the same change, and consistency is a pure content comparison. Editing either side without re-recording the pair goes red.

## The gate: verify-translation-pairing

`node scripts/verify-translation-pairing.mjs` enforces the contract mechanically:

1. Every in-scope document has a complete triplet: all three files present.
2. Each side's current blob hash equals the recorded one; the Chinese side and every authored English source carry their switcher lines.
3. The structural signatures match in order: heading depths, verbatim code blocks, table row and column counts, list kinds and starts, item counts, and every link target apart from the switcher.

Three modes: `--list` prints the state of every in-scope document (missing / out-of-sync / ok) and never fails; `--write <pair>` (or `--write --all`) re-records both hashes after you have confirmed the pair; `--check` verifies the whole corpus and is the default with no arguments.

The gate's limit, stated plainly: a green gate means the pair was confirmed consistent at these exact contents, not that the confirmation was sound. It checks hashes and Markdown structure; it cannot judge whether the two sides actually say the same thing — that is the reviewer's half of the contract. A re-recorded pair with a sloppy counterpart passes the gate; it must not pass review.

## Scope and exclusions

**In scope**: every content document under `docs/` and the active Agent Note lifecycles under `.agents/notes/` (`proposed/`, `implemented/`, `rejected/`).

**Excluded** (never paired, and the gate rejects a `.zh.md` or `.i18n.yaml` for them):

- Instruction files named `AGENTS.md` (root, `docs/`, `.agents/notes/**/`) — maintained in English only, like the root `AGENTS.md`.
- `SKILL.md` files — English only, because frontmatter `name` and `description` must be English for discovery.
- `docs/i18n/terminology.md` — bilingual by construction; it is one table, not a translated pair.
- `.agents/notes/archived/` — sealed historical triplets; the archive gate validates their completeness and content seals.

## Division of labor

Routine counterparts are updated directly by the working agent in one pass after loading [terminology.md](terminology.md); it does not invoke a translation skill or delegate to a subagent for an ordinary update. The extended [`translate-docs`](../../skills/agent/translate-docs/SKILL.md) workflow — whole-document translation, briefings, delegated prose — is reserved for explicit user invocation. Review still owns translation quality and terminology.
