# Agent Note: 同步可移植的上游技能更新

Status: implemented

[English](2026-10-30-sync-upstream-skills.md) | 中文

## 问题

各上游来源独立演进。逐字镜像、经过适配的维护工作流，以及生成的 API 快照需要不同的更新政策；统一替换会丢失本地调用规则，并引入宿主专属路径、模板或依赖。

## 决策

按不可变版本同步现有来源：DeepSeek Harness [`f3803c9`](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/.agents/skills)、HumanLayer [`653b641`](https://github.com/humanlayer/skills/tree/653b6411c1f70c275a18e37673b042ff99f67ceb/plugins/show-me)，以及 Dota 2 tools [`7488fc4`](https://github.com/BigCiba/vscode-dota2-tools/tree/7488fc4583868ef2014dee88a0eb0f729170df0e)。[技能地图](../../../../docs/skills-map.md)记录当前 DeepSeek Harness skill（技能）的处置结果，包括暂缓引入的新增项。

维护 skill 吸收生效路径和使用方追踪、文档操作验证、生成行文审查、测试隔离检查、合并检查点保留，以及带有针对性回归测试的连续视频 GIF 编码。通用名称、本地元数据、按需加载的参考资料、翻译调用政策，以及仓库自身的 Agent Note（决策记录）保留规则仍具权威性。不引入宿主文档模板、站点机制、Session 专属测试分组，以及直接删除小型 implemented 记录的政策。

[show-me 镜像决策](../feature/2026-09-04-mirror-show-me-skill.md)保留逐字节一致性及上游的手动调用设置。Dota 刷新使用其生成器，并在 `UPSTREAM.json` 中记录来源版本；Markdown 空白遵循[确定性规范化政策](../bug-fix/2026-10-30-normalize-vendor-markdown.md)。[GIF 移植决策](2026-08-20-absorb-record-browser-gif.md)保留通用的 staging 与证据规则，同时支持连续视频和截图输入。既有吸收记录保留各自独立的理由；本次同步更新来源基线，不取代其归属决策。

## 备选方案

**用上游文件替换全部 skill。** 否决：经过适配的 skill 会引入未受支持的宿主路径、结构和工作流政策。

**引入上游全部新增 skill。** 暂缓：每个新增 trigger（触发条件）都需要实际用途，并与已安装的工程 skill 核对重叠。

**手动规范 vendor 快照。** 否决：这些文件归生成器所有，保留上游内容才能复现来源验证。

## 后果

可移植行为更新与生成的 API 数据可以分开审查。技能验证、文档 gate（门禁）、针对性的 GIF 媒体测试，以及 Dota 检索冒烟检查提供证据；真实应用录制和游戏运行时验证仍是独立任务。全量空白检查包含按生成器政策规范化的快照。
