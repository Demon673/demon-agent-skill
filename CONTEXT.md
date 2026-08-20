# Demon Agent Skill Pack

The demon-agent-skill repository: a public skills source that publishes a portable maintenance-skill pack, with this repository as its reference implementation and first host.

## Skills and hosts

**Maintenance skill**:
A skill that keeps a repository's documentation, Agent Notes, gates, and review discipline in order; portable across host repositories.
_Avoid_: repo tool, housekeeping script

**Development skill**:
A skill that produces domain artifacts — game addons, UI demos — rather than repository hygiene.
_Avoid_: product skill

**Host repository**:
Any repository whose conventions the pack scaffolds and where the maintenance skills then run. This repository is the first host.
_Avoid_: target repo, consumer repo

**Absorption**:
Porting a skill's methodology at full parity while generalizing its host-specific facts into parameters and named examples.
_Avoid_: port, copy (when meaning this process)

**Instantiated convention**:
Repository-local content the maintenance skills assume — the gate scripts, the Agent Note tree, the documentation standard. Produced by setup in each host; not portable.
_Avoid_: configuration, scaffold output

**Pack**:
This repository's published skill collection, installed into agent environments as a unit.
_Avoid_: bundle, plugin

**Seam**:
A recorded boundary where another pack (Matt's engineering and writing skills) owns a capability; this pack links to it instead of duplicating it.
_Avoid_: overlap, hand-off

**Flow**:
A named path through skills — the main flow maintains a change; the governance run aligns a repository's documentation with its standard.
_Avoid_: pipeline, workflow (when meaning the router's paths)
