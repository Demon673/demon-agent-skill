# Responsive Roblox UI layout

Read this when a screen must adapt across viewport sizes, when layout defects appear on devices other than the author's monitor, or when choosing between scale, offset, layouts, and constraints.

## Structure before coordinates

1. Name the persistent regions first: HUD edge groups, header, primary content, secondary detail, action row, modal layer.
2. Decide what each region does on a narrow screen — reflow it, collapse it, or move it into a separate state.
3. Anchor an edge-owned region to its edge, with `AnchorPoint` matching `Position`; let siblings flow in a layout instead of positioning each child by hand.
4. Use offsets for bounded component dimensions and spacing, scale for proportional placement and flexible region size. Read `AbsoluteSize`, not device names, to drive layout decisions.

## Layout primitives

| Need | Primitive | Check |
| --- | --- | --- |
| vertical or horizontal flow | `UIListLayout` | padding, alignment, flex behaviour, content size |
| uniform collection | `UIGridLayout` | cell size at both bounds, scroll canvas height |
| true rows and columns | `UITableLayout` | header and cell alignment; card collections want `UIGridLayout` |
| inner spacing | `UIPadding` | one spacing scale, and it counts toward usable width |
| content-driven container | `AutomaticSize` | long text, wrapping, circular sizing between parent and child |
| content-driven scrolling | `ScrollingFrame.AutomaticCanvasSize` | scroll direction and whether the last row is reachable |
| proportional media or shape | `UIAspectRatioConstraint` | reserved for media and shape; text-heavy containers size to content |
| minimum and maximum component size | `UISizeConstraint` | test both limits, not only the preferred width |
| bounded text scaling | `UITextSizeConstraint` | long strings and TV viewing distance |
| one deliberately zoomed subtree | `UIScale` | one subtree, on purpose |

A composition that recomputes its own arrangement reads `AbsoluteSize` and reacts to `GetPropertyChangedSignal("AbsoluteSize")`:

```lua
-- ItemGrid is a ScrollingFrame with UIPadding + UIGridLayout,
-- AutomaticCanvasSize = Enum.AutomaticSize.Y and CanvasSize = UDim2.fromOffset(0, 0).
local grid = itemGrid.UIGridLayout
local projectBreakpoint = 700 -- the width where this composition stops working

local function applyComposition()
    local narrow = root.AbsoluteSize.X < projectBreakpoint
    categoryList.UIListLayout.FillDirection = if narrow
        then Enum.FillDirection.Horizontal
        else Enum.FillDirection.Vertical
    categoryList.Size = if narrow then UDim2.new(1, 0, 0, 40) else UDim2.new(0, 148, 1, 0)
    itemGrid.Position = if narrow then UDim2.fromOffset(0, 52) else UDim2.fromOffset(164, 0)
    itemGrid.Size = if narrow then UDim2.new(1, 0, 1, -52) else UDim2.new(0.58, -164, 1, 0)
    detailsPanel.Visible = not narrow -- narrow keeps details as its own state

    local width = itemGrid.AbsoluteSize.X
    local columns = if width < 520 then 2 elseif width < 820 then 3 else 4
    local gap = 12
    local usable = width - itemGrid.UIPadding.PaddingLeft.Offset
        - itemGrid.UIPadding.PaddingRight.Offset - gap * (columns - 1)
    grid.CellSize = UDim2.fromOffset(math.floor(usable / columns), 112)
    grid.CellPadding = UDim2.fromOffset(gap, gap)
end

root:GetPropertyChangedSignal("AbsoluteSize"):Connect(applyComposition)
applyComposition()
```

## Safe areas and reserved controls

`ScreenGui.ScreenInsets` defaults to `Enum.ScreenInsets.CoreUISafeInsets`, which keeps every descendant clear of the topbar and the other core UI. Keep it for interactive content. The other members are `None`, `DeviceSafeInsets`, and `TopbarSafeInsets`.

- Decorative backgrounds may bleed into `None`; put interactive children in an inset-aware root or a separate `ScreenGui` instead.
- `GuiService:GetInsetArea(Enum.ScreenInsets.CoreUISafeInsets)` returns the inset `Rect` when custom positioning needs the numbers, and `GuiService.TopbarInset` gives the topbar rectangle alone.
- Mobile tests include the bottom-left movement control and the bottom-right jump region; relocate or recompose any action row that overlaps them.
- Console tests consider viewing distance and overscan, not a desktop window enlarged to TV resolution.

## Breakpoints

Choose the width where the composition loses usable space, and recompose there. A sidebar plus grid plus detail view collapses into a horizontal category strip, a full-width grid, and a separate detail state before any region reaches a token width. An unbounded `UIScale` compensation hides the layout failure; recompose at the breakpoint instead.

## Density and rhythm

- Derive a small spacing scale from the game itself (for example 4/8/12/16/24) and reuse it for padding, gaps, and section separation; a larger gap marks a stronger grouping boundary.
- Fix text roles (title, section, body, metadata) and keep their size and weight stable across screens.
- Keep icon boxes a consistent size even when source art has different bounds.

## Verification matrix

| Configuration | Inspect |
| --- | --- |
| desktop, mouse and keyboard | hover and pressed states, window resizing, ultrawide and very tall extremes |
| narrow mobile portrait | reflow, touch reach, wrapping, scrolling, notch cutouts |
| mobile landscape | reserved controls, low vertical space, modal height |
| tablet-like | density and excessive empty space |
| console or gamepad layout | initial focus, every directional edge, back action, TV readability |

In every configuration, exercise open and close, empty and full content, long text, disabled and error states, scrolling to both ends, and one character respawn. Record the defects observed and the change that fixed each.

## Primary references

- https://create.roblox.com/docs/ui/on-screen-containers
- https://create.roblox.com/docs/ui/position-and-size
- https://create.roblox.com/docs/ui/size-modifiers
- https://create.roblox.com/docs/production/publishing/adaptive-design
