---
name: unreal-blueprint-analyzer
description: 只读分析 Unreal Engine Blueprint 资产，例如 .uasset、.umap、Widget Blueprint、Animation Blueprint、Behavior Tree、Data Asset 和地图资产；通过二进制字符串、编辑器导出、C++/脚本源码、项目文档、配置和资源引用推断蓝图用途。Use when the user asks to parse, inspect, explain, reverse-read, or understand any Unreal Engine Blueprint or Blueprint-related asset.
---

# Unreal 蓝图分析器

用于对任意 Unreal Engine 项目中的蓝图类二进制资产做只读分析。把 `.uasset`、`.umap` 和类似 Unreal 资产视为二进制源文件，不要直接二进制 patch。

## 基本规则

- 不要直接编辑 `.uasset`、`.umap`、`.navmesh` 或其他 Unreal 二进制资产。
- 区分已确认事实和推断。证据来源要标注为源码、文档、引用、二进制字符串或编辑器导出。
- 如果有官方编辑器导出、Commandlet、用户提供的截图或 JSON，优先使用这些更可靠的来源。
- 如果用户要求修改蓝图，给出安全的编辑器操作步骤，或可脚本化的编辑器/导出管线方案，不要直接改二进制文件。

## 工作流程

1. 识别资产路径和类型：Actor Blueprint、UI Widget、Behavior Tree Task、Data Asset、Map，或未知类型。
2. 查找相邻源码、配置和文档：
   - 将资产名或路径匹配到附近的 C++、Blueprint nativization 产物、Python/Editor Utility、Verse、Lua、C#、插件脚本、配置文件、数据表或项目自定义脚本层。
   - 搜索资产名、生成类名、父类、ClassPath、组件名、Widget 名、事件/函数名、Delegate、RPC 名、Gameplay Tag、Blackboard Key、Input Action、Data Table Row 和配置引用。
   - 如果存在 `AGENTS.md`、`CONTEXT.md`、`README.md`、设计文档、插件文档或源码注释，应一起读取。
3. 在不修改资产的前提下提取二进制字符串：
   - 优先使用内置脚本：`python <skill>/scripts/extract_uasset_strings.py <asset> --json`。
   - 如果没有 Python，可使用 `strings`、PowerShell 字节读取或编辑器导出等平台工具。
4. 对提取到的线索分类：
   - 资产路径、ClassPath 和父类线索。
   - 组件名、Widget 名和暴露变量。
   - 函数名、事件名和 RPC 名。
   - Blackboard Key、Data Table 名、Tag、Socket、Animation 名和引用资产。
5. 将线索和源码、配置、文档、编辑器导出交叉验证。只在二进制里出现的字符串是弱证据；同时出现在源码、配置、文档或导出数据中的线索更强。
6. 输出简短报告。静态分析无法证明执行流时，要给出置信度和明确的编辑器复查点。

## 输出格式

除非用户指定其他格式，否则使用以下结构：

- **Asset**：路径、推断类型、相关源码/配置/导出路径。
- **Purpose**：该蓝图大概率负责什么，并标注置信度。
- **Evidence**：按已确认源码/文档证据和二进制字符串推断证据分组。
- **Runtime Contracts**：运行时依赖的组件名、Widget 名、字段、Blackboard Key、RPC、资源路径、存档/同步字段。
- **Risks / Unknowns**：仅靠静态二进制分析无法证明的内容。
- **Editor Follow-Up**：建议用户在蓝图编辑器里复查的具体项目，或可手动执行的安全改动。

## 本地命令示例

```powershell
python C:\Users\MAC\.agents\skills\unreal-blueprint-analyzer\scripts\extract_uasset_strings.py Content\Blueprints\BP_Door.uasset --json
rg "BP_Door|Door_C|OpenDoor|Interact|BeginOverlap" Source Content Config Plugins docs
```

面对项目自定义 Unreal 技术栈时，应按该项目的实际栈查找相邻代码，不要预设脚本语言。例如：`Source/` 中的 C++ 类、Editor Utility Python、UEFN 项目的 Verse、Oasis/PUBG Mobile UGC 项目的 Lua、UnrealCLR 风格集成中的 C#、插件定义的 Blueprint Library，或数据驱动配置。
