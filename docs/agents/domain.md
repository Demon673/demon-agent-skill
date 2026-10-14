# Domain Docs

English | [中文](domain.zh.md)

This repository uses a single context. Its glossary is [GLOSSARY.md](../../GLOSSARY.md); architecture decisions live under `docs/adr/`.

## Before exploring, read these

- **Glossary**: read [GLOSSARY.md](../../GLOSSARY.md) for the repository's domain vocabulary.
- **ADRs**: read decisions under `docs/adr/` that touch the area you are about to work in.

Proceed with the available documentation when an ADR directory is absent. Create ADRs lazily through `/domain-modeling` when a decision meets that skill's criteria.

## File structure

```
/
├── GLOSSARY.md
├── GLOSSARY.zh.md
├── GLOSSARY.i18n.yaml
└── docs/adr/
```

When using `/domain-modeling` in this repository, update the glossary and its bilingual triplet in place.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, or a test name), use the term defined in [GLOSSARY.md](../../GLOSSARY.md). Honor the synonyms its Avoid entries exclude.

If the concept you need is missing, check whether it belongs to the project's domain. Bring an unresolved domain term to `/domain-modeling`.

## Flag ADR conflicts

If your output contradicts an existing ADR, identify the conflict and explain why the decision should be reopened.
