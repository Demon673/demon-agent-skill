# Demon Agent Skill Pack

[English](CONTEXT.md) | 中文

demon-agent-skill 仓库：一个公开的 skill（技能）源，发布可移植的维护 skill pack（技能包），并以本仓库作为其参考实现与第一个宿主。「_Avoid_」列列出英文近义词；中文译法以 [术语表](docs/i18n/terminology.md) 为准。

## Skill 与宿主

**Maintenance skill（维护技能）**：
维护仓库文档、Agent Note（决策记录）、门禁与审查纪律的 skill；可跨宿主仓库移植。
_Avoid_: repo tool（仓库工具）、housekeeping script（保洁脚本）

**Development skill（开发技能）**：
产出领域制品——游戏插件、UI demo——而非仓库卫生的 skill。
_Avoid_: product skill（产品技能）

**Host repository（宿主仓库）**：
任何被 pack 脚手架约定、维护 skill 在其中运行的仓库。本仓库是第一个宿主。
_Avoid_: target repo（目标仓库）、consumer repo（消费仓库）

**Absorption（吸收）**：
以完整对等移植 skill 方法论、并把其宿主特定事实参数化为具名示例的过程。
_Avoid_: port（移植）、copy（复制）——当指该过程时

**Instantiated convention（实例化约定）**：
维护 skill 所依赖的仓库本地内容——门禁脚本、Agent Note 树、文档标准。由 setup 在每个宿主生成；不可移植。
_Avoid_: configuration（配置）、scaffold output（脚手架产物）

**Pack（技能包）**：
本仓库发布的 skill 集合，作为整体安装进 agent 环境。
_Avoid_: bundle（捆绑包）、plugin（插件）

**Seam（边界）**：
另一 pack（Matt 的工程与写作 skill）拥有某能力时记录的边界；本 pack 链接而非复制。
_Avoid_: overlap（重叠）、hand-off（交接）

**Flow（流程路径）**：
贯穿 skill 的具名路径——主流程维护变更；治理路径把仓库文档对齐到其标准。
_Avoid_: pipeline（流水线）、workflow（工作流）——当指路由器的路径时
