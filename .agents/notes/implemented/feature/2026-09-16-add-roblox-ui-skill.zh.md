# Agent Note: 新增 roblox-ui-developer 技能并打通 Roblox 技能之间的引用

Status: implemented

[English](2026-09-16-add-roblox-ui-skill.md) | 中文

## 问题

Roblox 技能覆盖了玩法脚本和 roblox-ts 工具链，却没有任何技能负责屏幕界面。Luau 的调试 playbook 只把 UI 当作数据流的症状之一——`UI not updating`——TypeScript 技能则把 UI 描述为框架绑定，于是布局、安全区内缩、手柄焦点和动效都无处归属：一个 UI 请求会落进一个并不对屏幕建模的玩法工作流。

## 决策

在 `skills/roblox/` 下新增一个发布的 [`roblox-ui-developer`](../../../../skills/roblox/roblox-ui-developer/SKILL.md) 技能，负责 Roblox 的 UI Instance 与 API：手工搭建的层级与 `ResetOnSpawn` 策略、scale 与 offset 的取舍、布局原语及其上下界、安全区内缩、单一输入通路（含选择与模态焦点）、响应 reduced-motion 的动效，以及设备验证矩阵。`references/layout-and-responsive.md` 承载原语表、重组示例与断点、密度指引；`references/input-selection-motion.md` 承载选择图、模态焦点配方、上下文动作绑定与动效词汇。

三个 Roblox 技能现在互相点名：`roblox-luau-developer` 与 `roblox-typescript-developer` 把 UI 工作按名移交，UI 技能则把玩法、复制和构建路径交回去。[合并记录](../simplification/2026-08-19-consolidate-roblox-and-localize-game-skills.md)里的那个 Roblox 入口保持合并状态——这里是补上一项它从未覆盖的能力，而非把它重新拆开。

## 参考文档的精修

- `references/gameplay-debugging.md` 新增 respawn 竞态一节：`CharacterAdded` 可能在更早的处理函数仍在让出时再次触发，因此处理函数要重新读取 `player.Character`，并让每位玩家的代际计数器跨越每一次让出。
- `references/rojo-workflow.md` 与两个 SKILL 正文把边界改写成正向目标——用 `是项目文件决定 Rojo 是否在场` 取代 `不要假设每个 Roblox 项目都使用 Rojo`。
- `references/typescript-luau-interop.md` 删去它的 source-of-truth 一节，因为 TypeScript 的 SKILL 正文现在已经把这一点讲了一次。
- Luau 与 TypeScript 正文新增 Pitfalls 一节，并把验证证据分级为：已在 Studio 执行、静态检查、已准备但未运行、未验证。

## 备选方案

- **把 UI 并入 `roblox-luau-developer`。** 否决：屏幕是 Instance 与 `GuiObject` 属性，而不是玩法脚本；UI 这片表面——布局原语、内缩、选择图、动效——大到并回去就会重建合并记录当初消除的重叠。
- **把 UI 并入 `roblox-typescript-developer`。** 否决：用 react-lua 或 Fusion 组件写出的 UI 只是通往同一批 Instance 的一条构建路径，布局、焦点与动效规则完全相同。框架绑定留在 TypeScript 技能，界面规则留在这里。
- **按框架拆成多个 UI 技能（react-lua、Fusion、纯 Instance）。** 否决：三个技能共享同一个触发条件、同一份验证矩阵和同一套布局规则。
- **把 UI 留给玩法调试 playbook。** 否决：那个 playbook 把缺陷定位到某个边界并追数据流；它既不覆盖构图，也不覆盖内缩与焦点，而这三样正是 UI 请求的主要内容。

## 后果

- 发布清单从 20 增至 21 个技能。
- Roblox 又回到三个入口技能——Luau 玩法、roblox-ts、UI——但它们按表面切分而非彼此重叠，并且互相点名。
- UI 缺陷（手机布局被裁切、respawn 后界面重复、手柄无法移动）现在有唯一的归属技能，而数据流缺陷仍从玩法 playbook 起步。
- TypeScript 的 UI 工作由两个技能合力覆盖：`roblox-typescript-developer` 管构建与组件层，`roblox-ui-developer` 管界面。
