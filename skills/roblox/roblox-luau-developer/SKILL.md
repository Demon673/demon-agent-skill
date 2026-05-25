---
name: roblox-luau-developer
description: Roblox Luau 开发工作流，用于实现、审查和重构 Roblox 游戏脚本、ModuleScript、ServerScript、LocalScript、RemoteEvent/RemoteFunction、DataStore 和服务端/客户端分层。Use when working on Roblox, Luau, Roblox Studio code, Rojo-synced scripts, gameplay systems, UI scripts, replication, remotes, or Roblox services.
---

# Roblox Luau 开发者

用于 Roblox 项目的日常代码实现、审查和重构。默认以 Luau 和 Roblox 服务端/客户端模型为核心，不假设项目一定使用 Rojo。

## 工作流程

1. 先识别项目形态：
   - Rojo 项目：查找 `default.project.json`、`*.project.json`、`sourcemap.json`。
   - 包管理：查找 `wally.toml`、`aftman.toml`、`.luaurc`、`selene.toml`、`.stylua.toml`。
   - Studio 导出：识别 `.rbxlx`、`.rbxmx`、`.model.json`、`src/`、`ReplicatedStorage/`、`ServerScriptService/` 等目录。
2. 先读现有代码和命名约定，再改动：
   - 用 `rg` 搜索服务、模块、Remote 名、Attribute 名、CollectionService Tag。
   - 找清楚 ServerScript、LocalScript、ModuleScript 的调用方向。
   - 不凭空发明 Instance 路径、Remote 名或 UI 控件名。
3. 实现时保持 Roblox 分层：
   - 权威状态和校验在服务端。
   - 客户端只负责输入、显示、预测和请求。
   - Remote 参数必须做类型和权限校验。
   - DataStore 写入需要节流、重试和失败处理。
4. 优先小改动：
   - 保持现有 Module 返回形态、服务名和 require 方式。
   - 公共模块避免隐式全局状态。
   - 对共享表和连接对象给出清理路径。
5. 验证：
   - 如果有 `selene`、`stylua`、`luau-lsp`、`lune`、`rojo` 或项目脚本，优先运行现有检查。
   - 如果只能静态检查，要明确说明没有 Studio/Play Solo 运行验证。

## 常见风险

- 客户端直接信任货币、背包、伤害、传送等高价值请求。
- RemoteEvent 没有限流或权限检查。
- 循环里频繁创建 Instance、连接事件或调用昂贵查询。
- `Touched`、`Heartbeat`、`RenderStepped` 没有断开连接。
- DataStore 在玩家离开或服务器关闭时没有兜底保存。
- UI 脚本和服务端逻辑互相 require，导致运行环境错误。

## 输出格式

- **改动**：说明改了哪些脚本和行为。
- **服务端/客户端边界**：说明权威逻辑在哪一侧。
- **Remote/DataStore 风险**：列出新增或修改的接口风险。
- **验证**：列出实际运行的检查；无法运行 Studio 时说清楚。
