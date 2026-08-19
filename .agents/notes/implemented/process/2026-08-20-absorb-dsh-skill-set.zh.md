# Agent Note: 吸收 deepseek-harness 技能集

Status: implemented

[English](2026-08-20-absorb-dsh-skill-set.md) | 中文

## 问题

2026-08-17 的移植把九个 deepseek-harness 维护 skill（技能）改写成了约一半篇幅的通用空壳，留下三处 major 漂移（pre-push-checks、prose-standard、translate-docs）、两处 minor 漂移（archive-agent-notes、trim-cot-leakage）、三个缺口（code-review、doc-site-sync、record-browser-gif），以及一条夸大了 doc-standards 贡献的融合记录。用户的目标是学习 deepseek-harness 的开发 skill 集，同时与 Matt 的 pack 保持一个能力一个归属。

## 决策

按 [docs/skills-map.md](../../../../docs/skills-map.md) 的处置表吸收 deepseek-harness 技能集：把漂移的 skill 恢复为泛化的 1:1 移植；把 dsh-code-review 吸收为 repo-standards-review 下的检查清单参考（review 流程仍归 Matt 的 code-review）；移植 record-browser-gif 及其编码器；等某宿主有文档站点投影时再移植 doc-site-sync；跳过两个 Cordis 产品 skill 与 badge。每个 skill 的变更各自携带 implemented note（决策记录）；本记录保存集合级决策与 seam（边界）。

## 备选方案

- **以同名 skill 移植 code-review。** 否决：名字与触发条件会和 Matt 的 code-review 冲突；检查清单进 references 的路线保住唯一 review 归属。
- **吸收 Cordis 产品 skill。** 否决：它们绑定 deepseek-harness 运行时；原版留在其仓库可用。
- **现在就移植 doc-site-sync。** 否决：本仓库没有文档站点投影，没有宿主机制的 skill 是死重。

## 后果

- 十一个 deepseek-harness 维护 skill 中十个已作为 skill 或检查清单参考存在；仅 doc-site-sync 暂缓。
- 一个能力一个归属成立：Matt 拥有工程循环，本 pack 拥有维护流；seam 记录在 docs/skills-map.md 与 ask-demon。
- 每对的 parity 可通过地图与各自 note 核验。
