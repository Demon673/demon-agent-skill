# Agent Note: 落实 workspace-standards 审查的发现

Status: implemented

[English](2026-09-16-act-on-standards-review.md) | 中文

## 问题

workspace-standards 审查把该 skill 列为出处的每一个判定 skill——`prose-standard`、`trim-cot-leakage`、`prune-prompt-pollution`、`doc-standards`、`translate-docs`、`archive-agent-notes`、`find-simplifications`，以及 Matt 那套里的 `writing-for-agents`——都跑在整份文档语料上，另外把 Agent Note 树与 skill 语料交给两批子代理深读。发现的全是绿灯查不到的缺陷：一个私人项目名被写进公开的 skill reference；常驻的根 `AGENTS.md` 正好顶在词数上限，里面还塞着一段流程、一条环境缓存和一份手工复述的清单；同一份 gate 清单被复述在三个 home 且三处都已过期；七条决策记录描述着此后已经改变的机制；归档机制根本用不了；十五个 skill 描述在重述自己的正文。

## 决策

分批落实：

- **根 `AGENTS.md`** 删掉重复的调用规则、手工复述的 skill 清单、那句只复述每个 skill 目录里都看得见的 `agents/openai.yaml`，以及 Quality Gate 那段流程与其正则；该检查连同它的命令移入 `workspace-standards-review` 的阻塞项，那才是这项检查的归属。发布时安装的边界移入 `CONTRIBUTING.md`，属于贡献者流程。该文件从 720/720 降到 628/720 词。
- **gate 清单**只有一个 home：`run-doc-gates.mjs`。`README.md`、`docs/glossary.md` 与 `adopt-dsh-documentation-standards` 记录改为指向它，不再各自列举七项中的六项。
- **七组 Agent Note 双语对**被改成已发布现实：`publish-general-skills` 的重命名历史、`codex-metadata` 的 `allow_implicit_invocation` 断言、`restore-flow-cascade` 的发布/内部分界、`restore-translate-docs-parity` 的"本仓库没有 brief 脚本"、`pack-session-discipline` 的纪律行数、`absorb-dsh-tooling` 的钩子未激活、以及改名记录里会腐烂的提及计数。`add-roblox-ui-skill` 的中文侧按术语表把 `skill` 恢复为英文原词。
- **skill 层**：`solid-panorama-ui.md` 里的私人项目名被删除、个案研究匿名化；`setup-demon-skills` 只点名真正读取 change-scope 工具的消费者；`find-simplifications` 删掉一句宿主特定的 pre-push 断言；`change-scope.mjs` 写明它非显然的契约；Roblox 三件套统一证据分级的措辞并互相点名；`roblox-typescript-developer` 写明框架层不在范围内。
- **描述**：十五个 skill 的触发段按 `writing-for-agents` 重写——一个分支一个触发、不摆正文的橱窗清单、不用否定式引导。
- **两组 Agent Note 三件套被归档**——`bind-flow-skills` 与 `absorb-code-review-checklist`——入链改指，归档封存。归档过程暴露出三个潜伏的 gate 缺陷，均已修复：`verify-md-links` 与 `verify-md-wrap` 用正斜杠路径判断"归档树排除"，于是在 Windows 上照样检查被冻结的归档树，并因无人可改的链接判构建失败；`verify-archived-agent-notes --write` 在写完 manifest 后的那行成功日志上崩溃。
- **tracker 兑现文档所述标签**：`triage-labels.md` 声称五个规范角色就是本仓库 tracker 里的标签，而两个 issue 模板点了不存在的标签。远端创建了六个标签；文件一字未改。

## 备选方案

- **只报告发现、什么都不改。** 否决：一份缺陷留在原地的审查是关于文档的报告，不是审查工作；而且其中几项——公开的私人项目名、已发布 skill 里的失效指针、用不了的归档——都有真实代价。
- **降级 `triage-labels.md` 的措辞，而不是去创建标签。** 否决：这个文件存在的意义就是让 Matt 的 `triage` 与 `wayfinder` 角色在本仓库 tracker 上可用；让 tracker 成真只需一条命令，且表格与模板都保持有效。
- **等 gate 能处理归档树之后再做归档。** 否决：gate 本来就是错的，修它比把两条已被取代的记录留在活跃树里更小。
- **把 Quality Gate 的命令留在根 `AGENTS.md`。** 否决：常驻文件不是流程的合适 home，而该检查本就归 review skill 所有。

## 后果

- 在本次审查检查过的位置上，文档语料与已发布现实一致；根 `AGENTS.md` 只承载常备指令，并重新有了余量。
- 归档可用了：两组三件套已封存，且 `verify-md-links`/`verify-md-wrap` 在各平台都会跳过被冻结的树。
- 刻意的保留：证据分级那句话在三个 Roblox skill 里保持重复，因为宿主可能只安装其中一个，需要在该处就有完整契约；`show-me` 的描述保持上游原文，因为 `sync-show-me.ps1` 逐字镜像该文件；`ask-demon` 对每个 skill 的复述保留，因为 router 点名自己的 skill 属于路由而非重复——若它开始漂移再回看。
- 审查本身不在此复述：它的方法、覆盖范围，以及那些没有导致改动的发现，记录在运行它的会话里。
