---
name: roblox-ui-developer
description: Roblox UI development — author, review, and fix on-screen interfaces such as HUDs, menus, shops, inventories, settings, and notifications, with ScreenGui/BillboardGui/SurfaceGui, UDim2 layout, UIListLayout/UIGridLayout, AutomaticSize, safe-area insets, gamepad focus, touch targets, and reduced-motion-aware tweens. Use when building Roblox UI, when an interface breaks on a phone or another device, when it duplicates or vanishes after respawn, when a controller cannot drive a menu, or when the UI was generated as one giant LocalScript.
---

# Roblox UI Developer

Author and review on-screen Roblox interfaces: authored Instance hierarchies, responsive layout, input and focus, motion, and cross-device verification. This skill owns Roblox's UI Instances and APIs; gameplay scripting and the server/client boundary belong to the sibling skills under Related.

## Read the visual language before designing

- Inventory the existing interfaces: the `ScreenGui`s under `StarterGui`, their naming, fonts, palette, icon family, spacing, corners, strokes, and tween timing.
- Extend that language. Where none exists, define one small token ModuleScript and read from it.
- Capture the current screens before changing them, and take control, screen, and theme names from the project.

## Keep the hierarchy authored

- `StarterGui` holds the authored template; Roblox clones it into each player's `PlayerGui`.
- Author the shell as named, editable Instances that read clearly in Explorer. Procedural creation carries the genuinely data-driven repetition — grid cells, list rows — and one small controller carries the behaviour.
- In a react-lua, Fusion, or roblox-ts project the whole screen is components, and that generated tree is the authored form there: keep the component boundaries and the state small, and take the build path from `roblox-typescript-developer`.
- Decide `ResetOnSpawn` per screen, and reacquire the clone from `PlayerGui` after a respawn.

## Lay out for the smallest and the largest screen

- Scale for proportional placement and flexible region size; offset for bounded dimensions, spacing, and icon boxes.
- Flow siblings with `UIListLayout` or `UIGridLayout` (`UITableLayout` for true rows and columns), and space them with `UIPadding` on one spacing scale.
- `AutomaticSize` fits content and `ScrollingFrame.AutomaticCanvasSize` fits scroll content; a fixed `CanvasSize` truncates as content grows.
- Bound extremes with `UISizeConstraint`, `UIAspectRatioConstraint`, and `UITextSizeConstraint`; `UIScale` serves one deliberate subtree.
- Take breakpoints from `AbsoluteSize` at the width where the composition stops being usable, and recompose there — reflow or collapse a region rather than shrink a desktop panel until it technically fits.
- Keep interactive UI inside the safe area with `ScreenGui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets`; decorative backgrounds may bleed past it.

Read `references/layout-and-responsive.md` for scale-versus-offset decisions, the layout primitive table, inset numbers, breakpoint guidance, and the device matrix.

## Wire one input path

- `GuiButton.Activated` covers mouse, touch, and gamepad in one handler.
- Every interactive state carries a visible response — hover where a pointer exists, pressed, selected, disabled, and busy while an operation runs — read through shape, label, or position as well as colour.
- Set `GuiService.SelectedObject` to the most likely safe action when a screen opens, after the control is rendered; a touch-first screen opens with no forced selection.
- Automatic selection covers simple lists; set `NextSelectionUp`/`Down`/`Left`/`Right` where the geometry is ambiguous, and walk every edge.

Read `references/input-selection-motion.md` for the modal focus recipe, the deprecated selection APIs, screen-level context actions, and the motion vocabulary.

## Move with restraint

- Read `GuiService.ReducedMotionEnabled` and answer it with an instant state change or a short opacity change.
- The logical state changes immediately and the animation visualizes it; gameplay and server state follow the logical state.
- Reserve the touch movement and jump corners, and show keyboard or gamepad hints while that input is active.

## Common failures

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| UI gone or duplicated after respawn | no `ResetOnSpawn` policy, or a stale clone reference | pick the policy; reacquire from `PlayerGui`; drop the old connections |
| Phone layout clips or overlaps | desktop offsets, or one global `UIScale` used as the layout | add the narrow composition, layouts, and bounds; test in Device Emulator |
| Content sits under the topbar or a notch | insets ignored | `CoreUISafeInsets` for interactive UI |
| Scroll stops before the content ends | fixed `CanvasSize` | `AutomaticCanvasSize`, or the layout's `AbsoluteContentSize` |
| A controller cannot move at all | no initial selection | set `SelectedObject`, then define the neighbour graph |
| Focus escapes a modal | the modal is not a selection group | `SelectionGroup` plus `SelectionBehavior… = Stop`; restore selection on close |
| Connections and tweens climb over time | the screen rebinds without teardown | own connections per screen lifetime; disconnect and cancel on close |
| Explorer shows one giant script | the whole interface is procedural | author the shell; generate only the repeated cells |
| The result looks generated | decoration standing in for hierarchy | remove the effects; fix alignment, nesting, density, and component roles |

## Verify

- Name the configurations actually exercised — desktop, narrow portrait, mobile landscape, tablet-like, console/gamepad — and respawn once during the pass.
- Exercise open and close, empty and full content, long text, disabled and error states, and both scroll ends.
- Use Studio's Device Emulator and Controller Emulator; a real controller or phone when available.
- Grade the evidence: executed in Studio, statically checked, prepared but not run, or unverified. Never present the latter three as a visual pass.

## Output

- Screens changed: which `ScreenGui`s and files, and what the player sees differently.
- Hierarchy: where new Instances live and which are authored versus generated.
- Device coverage: which configurations were checked, and which defects remain.
- Verification: emulators and checks actually run.

## Related

- `roblox-luau-developer` — gameplay scripting, the server/client boundary, replication, DataStore, and Rojo projects.
- `roblox-typescript-developer` — roblox-ts projects, including UI authored in TypeScript.

## Primary references

- https://create.roblox.com/docs/ui/on-screen-containers
- https://create.roblox.com/docs/ui/position-and-size
- https://create.roblox.com/docs/ui/size-modifiers
- https://create.roblox.com/docs/studio/testing-modes
