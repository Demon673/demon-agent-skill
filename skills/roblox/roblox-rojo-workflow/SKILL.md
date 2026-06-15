---
name: roblox-rojo-workflow
description: Roblox Rojo project workflow for understanding, maintaining, and syncing Roblox codebases managed with Rojo, Wally, or Aftman. Use when a Roblox project has default.project.json, *.project.json, wally.toml, aftman.toml, sourcemap.json, src folders, or the user asks about Rojo, Wally, Studio sync, generated place/model files, or Roblox repo structure.
---

# Roblox Rojo 工作流

用于 Roblox 项目的文件系统到 Studio 同步工作流。目标是安全理解项目结构、修改源码、避免破坏生成资产。

## 工作流程

1. 识别入口：
   - 查找 `default.project.json` 或其他 `*.project.json`。
   - 读取 Rojo tree，确认哪些目录映射到 `ReplicatedStorage`、`ServerScriptService`、`StarterPlayer`、`StarterGui` 等服务。
   - 查找 `wally.toml`、`aftman.toml`、`.luaurc`、`selene.toml`、`.stylua.toml`。
2. 区分源文件和生成物：
   - 优先编辑 `src/`、`Packages/` 以外的项目源码。
   - 不直接编辑 `.rbxl`、`.rbxm`、`.rbxlx`、`.rbxmx`，除非用户明确要求并说明来源。
   - 不把 Rojo 生成的 sourcemap 当成源码手改。
3. 修改代码前先建立路径映射：
   - 从 project json 推断 Studio 中的 Instance 路径。
   - 修改 require 路径时，同时检查调用方和依赖方。
   - 新增 ModuleScript 时，确认它会被 Rojo 映射进预期服务。
4. 可用时运行工具：
   - `rojo sourcemap`
   - `wally install`
   - `stylua --check`
   - `selene`
   - 项目自带 npm/pesde/lune/aftman 脚本
5. 交付时说明：
   - 哪些文件会同步到 Studio 哪个服务。
   - 是否需要用户在 Studio 里重新连接 Rojo 或 Play Test。

## 安全边界

- 不假设所有 Roblox 项目都用 Rojo。
- 不自动重写项目结构。
- 不删除包管理生成目录，除非用户明确要求。
- 不把 Studio 中的手动对象改动当作已同步事实；需要用户提供导出或源码映射。

## 输出格式

- **Rojo 映射**：项目文件路径到 Studio 服务路径。
- **源码改动**：具体文件和模块职责。
- **需要同步**：Studio/Rojo 侧需要执行的动作。
- **验证**：列出运行过的 Rojo/Wally/Luau 工具。
