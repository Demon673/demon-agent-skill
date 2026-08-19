# Agent Note: 恢复 translate-docs 与 dsh-translate-docs 的功能对等

Status: implemented

[English](2026-08-20-restore-translate-docs-parity.md) | 中文

## 问题

发布的 `translate-docs` skill（技能）只保留了 `dsh-translate-docs`（deepseek-harness 仓库 `.agents/skills/dsh-translate-docs/SKILL.md`）的 triage 与收尾骨架。移植把 74 行正文改写为 54 行，丢掉了简报驱动的更新路径（`gen-translation-brief --apply` 纯机械捷径）、行文更新与整篇批次的子 agent 委派、配对 gate（门禁）的具体细节（`.i18n.yaml` 一致性记录、`--write`/`--list` 标志、配对 manifest），以及回应评审一节。两个 skill 不再共享扩展工作流，而 `docs/i18n/README.md` 中把「简报、委派翻译」点名的分工表述也不再匹配交付的正文。

## 决策

重写 `translate-docs`，承载 `dsh-translate-docs` 的完整工作流并把宿主引用参数化：仓库的配对 gate、翻译规则、术语表、文体样例与文档 gate 取代 deepseek-harness 的路径、命令与架构事实。简报驱动的更新路径把 `pnpm run gen-translation-brief --apply` 泛化为「仓库的 translation-brief 脚本（如存在），使用其 apply 标志」，并为没有该脚本的宿主（本仓库即没有）提供 diff 回退。行文更新与整篇批次的子 agent 委派恢复；`.i18n.yaml` 一致性记录、gate 的 `--write`/`--list` 标志与配对 manifest 作为具名细节恢复；新增的回应评审一节把「术语表即契约」规则链接到 `repo-standards-review`。调用边界保持 [restore-flow-cascade](2026-08-19-restore-flow-cascade.md) 已定的默认 model 与 user 可达，而非来源的 `disable-model-invocation: true`。本记录落实而非推翻 [absorb-dsh-skill-set](2026-08-20-absorb-dsh-skill-set.md) 记录的集合级吸收决策。

## 备选方案

- **保留漂移后的正文。** 否决：被删的机制——简报驱动更新、委派、配对 gate 细节、回应评审——正是 `docs/i18n/README.md` 已点名的扩展工作流，且用户要求与来源对等。
- **移植来源的仅用户调用**（`disable-model-invocation: true`）。否决：已在 [restore-flow-cascade](2026-08-19-restore-flow-cascade.md) 决定；仅用户 skill 无法被其他 skill 触及，`ask-demon` 到 `translate-docs` 的级联会断裂。
- **把详细章节拆进 `references/`。** 否决：每一节都是工作流按序到达的步骤，不是条件性参考，因此正文保持 69 行自包含——接近 74 行来源，且在发布先例之内。
- **改名为 `dsh-translate-docs`。** 否决：`dsh-` 前缀标记 deepseek-harness 内部 skill；本仓库以普通名称发布可移植 skill。

## 后果

- `skills/agent/translate-docs/SKILL.md` 从 54 行增至 69 行，重新覆盖简报驱动更新路径、委派翻译、配对 gate 细节与回应评审。
- 本 skill 保持 model 与 user 可达，`ask-demon` 流得以级联进来；来源的仅用户边界刻意不移植。
- 本 skill 保持宿主无关：在有 translation-brief 脚本的宿主中走简报路径；没有则回退到手工 diff，并以通用措辞点名配对 gate 的 `.i18n.yaml` 记录与 `--write`/`--list` 标志。
