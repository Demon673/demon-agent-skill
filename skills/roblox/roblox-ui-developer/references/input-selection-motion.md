# Roblox UI input, selection, and motion

Read this for gamepad navigation, touch and mouse parity, modal focus, screen-level context actions, or the motion vocabulary behind a state transition.

## Touch and device

- Touch targets stay comfortably large and separated, with the hit zone on the visible control.
- Input prompts match the active device, and the only explanation of an action stays visible while the device switches.

## Selection graph

- On open, select the most likely safe action through `GuiService.SelectedObject`.
- Set the initial selection after the control is rendered and selectable (one `RunService.RenderStepped`), and only for keyboard or gamepad navigation. Device emulation can report keyboard capability while touch is active, so follow the project's active input policy; a touch-first screen opens with no forced selection.
- Automatic selection covers simple lists; assign `NextSelectionUp`/`Down`/`Left`/`Right` where the layout geometry is ambiguous — grids, sidebars, modals. Walk every edge and a full round trip.
- Inspect the default selection adornment in context: a project-owned `SelectionImageObject` stays a valid, visible `GuiObject` (it may live offscreen as the reusable template) and matches the interface's focus treatment rather than adding a large glow.

### Modal focus

1. Remember the previously selected object when it still belongs to the screen underneath.
2. Block interaction with that screen.
3. Select the modal's first safe control.
4. Keep directional navigation inside the modal: `SelectionGroup = true` on the modal root and `SelectionBehaviorUp`/`Down`/`Left`/`Right` = `Enum.SelectionBehavior.Stop`.
5. On close, restore the remembered object or a stable fallback.

`GuiService:AddSelectionParent()`, `AddSelectionTuple()`, and `RemoveSelectionGroup()` are deprecated; the group properties above are their replacement.

## Screen-level context actions

- `ContextActionService:BindAction()` carries the actions a screen owns without a button: close and back, tab change, an ability-bar shortcut.
- Bind while the screen is active, `UnbindAction()` on close.
- `Enum.ContextActionResult.Sink` marks an action the UI consumes; everything else passes through to gameplay.
- The project's existing action names and bindings stay as they are; the screen owns only what it adds.

## Motion lifecycle

- Animate a stable parent — a `CanvasGroup` carries group transparency — rather than one tween per descendant.
- Reuse a small timing and easing vocabulary so screens feel like one product, with transitions short enough not to delay interaction.
- Cancel or supersede an in-flight tween when the target state changes, so contradictory open and close animations never queue.

## Controller and touch verification

- Studio's Controller Emulator proves the mapping and the navigation; a real controller when one is available.
- Check initial focus, every direction, activation, back and cancel, tab or shoulder navigation when used, a selected item scrolling into view, focus restoration after a modal closes, and mouse-to-gamepad switching mid-screen.
- Controller emulation covers mapping, not TV legibility: check console sizing and viewing distance in the Device Emulator.
- On touch, confirm the reserved movement and jump corners stay clear and that hints appear only for the active input.
