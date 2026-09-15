# Agent Note: Add the roblox-ui-developer skill and cross-link the Roblox skills

Status: implemented

English | [中文](2026-09-16-add-roblox-ui-skill.zh.md)

## Problem

The Roblox skills owned gameplay scripting and the roblox-ts toolchain, and no skill owned on-screen interfaces. The Luau debugging playbook reaches UI only as a data-flow symptom — `UI not updating` — and the TypeScript skill describes UI as framework bindings, so layout, safe-area insets, gamepad focus, and motion had no home: a UI request landed in a gameplay workflow that does not model screens.

## Decision

Add a published [`roblox-ui-developer`](../../../../skills/roblox/roblox-ui-developer/SKILL.md) skill under `skills/roblox/` that owns Roblox's UI Instances and APIs: authored hierarchies and the `ResetOnSpawn` policy, scale-versus-offset layout, the layout primitives and their bounds, safe-area insets, one input path with selection and modal focus, reduced-motion-aware motion, and a device verification matrix. `references/layout-and-responsive.md` carries the primitive table, the recomposition example, and the breakpoint and density guidance; `references/input-selection-motion.md` carries the selection graph, the modal focus recipe, the context-action bindings, and the motion vocabulary.

The three Roblox skills now name each other: `roblox-luau-developer` and `roblox-typescript-developer` hand UI work over by name, and the UI skill hands gameplay, replication, and the build path back. The merged Roblox entry point from [the consolidation note](../simplification/2026-08-19-consolidate-roblox-and-localize-game-skills.md) stays merged — this adds a capability that entry point never covered rather than re-splitting it.

## Reference refinements

- `references/gameplay-debugging.md` gains a respawn-races section: `CharacterAdded` can fire while an earlier handler still yields, so the handler re-reads `player.Character` and carries a per-player generation counter across every yield.
- `references/rojo-workflow.md` and both SKILL bodies restate their boundaries as the positive target — `the project files decide whether Rojo is in play` in place of `do not assume every Roblox project uses Rojo`.
- `references/typescript-luau-interop.md` drops its source-of-truth section, which the TypeScript SKILL body now states once.
- The Luau and TypeScript bodies gain a Pitfalls section, and verification evidence is graded as executed in Studio, statically checked, prepared but not run, or unverified.

## Alternatives considered

- **Fold UI into `roblox-luau-developer`.** Rejected: screens are Instances and `GuiObject` properties rather than gameplay scripts, and the UI surface — layout primitives, insets, the selection graph, motion — is large enough that folding it back in rebuilds the overlap the consolidation note removed.
- **Fold UI into `roblox-typescript-developer`.** Rejected: UI authored as react-lua or Fusion components is one build path into the same Instances, with identical layout, focus, and motion rules. Framework bindings stay in the TypeScript skill; the interface rules live here.
- **Publish one UI skill per framework (react-lua, Fusion, plain Instances).** Rejected: three skills sharing one trigger, one verification matrix, and one set of layout rules.
- **Leave UI to the gameplay debugging playbook.** Rejected: that playbook localizes a defect to a boundary and traces data flow; it covers neither composition nor insets nor focus, which is most of what a UI request asks for.

## Consequences

- The published manifest grows from 20 to 21 skills.
- Roblox is again three entry skills — Luau gameplay, roblox-ts, and UI — but they partition by surface instead of overlapping, and each names the others.
- A UI defect (a phone layout that clips, a screen that duplicates after respawn, a controller that cannot move) now has one owning skill, while a data-flow defect still starts in the gameplay playbook.
- TypeScript UI work is covered by two skills together: `roblox-typescript-developer` for the build and component layer, `roblox-ui-developer` for the interface.
