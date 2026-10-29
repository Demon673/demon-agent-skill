# Recall batteries

Probes for [the taxonomy](../SKILL.md#taxonomy). Every hit needs semantic judgment: the batteries over-match by design and under-match by nature, so pair them with an unpatterned read of the densest prose in scope.

## Invocation rules

- Add `--hidden --glob '!.git/**'` so hidden documentation and Agent Note directories are searched; ripgrep skips dot-directories by default.
- Put exclusions last so a later include cannot re-admit them: exclude `vendor/`, dependencies, frozen archived notes, recorded fixtures or snapshots, and the skill's own directory because its files quote leaked wording as calibration.
- Natural-language probes use `-i` so sentence-initial capitals hit. Keep structural probes case-sensitive; otherwise plan codes and short identifiers turn into noise.
- Bound complete phrases. For example, `\bthis PR\b` must match "this PR adds" without matching "this project" or "this provider".
- Calibrate both directions before trusting a result: a zero-hit pattern must match a known positive, and a noisy pattern must reject a near-miss negative.
- Target authoring-language probes at the opposite-language surface: search Chinese residue in otherwise-English Markdown and code comments, and search Chinese change narration in `*.zh.md`. A generic ASCII search for English residue in Chinese prose is too noisy around code and identifiers; compare prose additions with the counterpart instead.

## English battery

```sh
rg -n --hidden '\(decision \d|\(audit [A-Z]\d|design §|plan §|design ledger|\(B ruling|\bP-I\b|\bW\d\b|\bT\d\b' ...
rg -n --hidden -i '\bthis PR\b|\bthis branch\b|\bthis stack\b|\blater PRs?\b|\bprevious commits?\b|\bthis commit\b' ...
rg -n --hidden -i '\bused to\b|\bno longer\b|\bpreviously\b|\bthe old\b|\bwas renamed\b|\bwas moved\b' ...
rg -n --hidden -i '\bv1\b|this cut|\bcut \d|\btoday\b|\bfor now\b|roadmap' ...
rg -n --hidden -i 'rejected in review|review round|reviewer|as of v\d' ...
rg -n --hidden -i 'probably |should be enough|should suffice|it simply|is safe —|is safe --' ...
rg -n --hidden '§\d' ...
```

## Chinese batteries

```sh
# Change or review narration in Chinese counterparts.
rg -n --hidden '评审|上一?轮|旧版|老的|不再|以前|本版|遗留' --glob '*.zh.md' ...

# Chinese authoring-language slips in English Markdown.
rg -n --hidden '设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|(^|[^a-zA-Z])端([^a-zA-Z]|$)' --glob '*.md' --glob '!*.zh.md' ...

# Chinese authoring-language slips in English code comments and JSDoc.
rg -n --hidden '(^[[:space:]]*(//|/\*|\*)|//|/\*)[^\r\n]*(设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|端)' --glob '*.{ts,tsx,js,jsx,mjs,cjs,css}' ...
rg -n --hidden '#[^\r\n]*(设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|端)' --glob '*.py' ...
```

## Known false-positive families

Inspect these before editing:

- **Instrumental "used to"** — "the key used to sign requests" describes purpose, not a former repository state. The temporal form has a subject state before it, as in "colors used to come from…".
- **Runtime old/new** — "the old connection drains before the new one accepts" names live objects during handover, not repository history.
- **"This PR" in process docs** — instructions about PR workflow, templates, and process notes legitimately mention PRs; leakage is a durable document adopting one PR's vantage as its own.
- **`v1` as protocol or path segment** — `/v1/chat` endpoints and wire-format names are identifiers, not version stamps.
- **`§N` with a committed owner** — external standards and committed documents that own their section numbering remain citable by section.
- **Contrastive "actually" and the noun "wait"** — ordinary English, not hedging; broad probes for them create noise.
- **Runtime "today" and recorded timestamps** — prompts or tests that use the clock, and recorded CLI output, keep their own voice. Text that reaches a model or user still follows the behavior-evidence rule before any edit.
- **本版本 in Chinese prose** — a legitimate rendering of "this release" in a versioned-artifact context; the banned indexical is 本版 used as a bare "this cut" stamp.
- **Alternatives-considered sections** — "rejected" inside an Agent Note's required genre slot is durable rationale, not review choreography.
