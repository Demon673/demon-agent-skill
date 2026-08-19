# Agent Note: 恢复 archive-agent-notes 的 sidecar 处理

Status: implemented

[English](2026-08-20-restore-archive-agent-notes-sidecar.md) | 中文

## 问题

发布的 `archive-agent-notes` 以 `foo.md` + `foo.zh.md` 的 pair（一对）为单位移动和删除 Agent Note（决策记录），但本仓库的 Agent Note 是双语文档的三件套——`foo.md` + `foo.zh.md` + `foo.i18n.yaml` 一致性记录——封存门禁（`verify-archived-agent-notes.mjs`）会用两侧当前的 git blob hash 校验该记录。移植丢掉了 deepseek-harness 的 sidecar 步骤：封存步骤只移动两个语言文件，rejected 删除与合并步骤只删除 pair，而且在两次仅改元数据的 `Archived:` 编辑之后没有任何步骤重新记录一致性记录。被移动或删除的 Agent Note 因此会不一致地遗留或丢失其 `.i18n.yaml`，被封存的三件套则会在 sidecar hash 校验上变红。

## 决策

恢复 `archive-agent-notes` 中的 sidecar 步骤并加以通用化：被移动或删除的单位始终是完整的三件套，pair 的一致性记录在任何编辑之后都通过仓库的配对记录器以写模式机械地重新记录（本仓库为 `node scripts/verify-translation-pairing.mjs --write <en-path>`）。封存步骤只在两个语言文件中于 `Status: implemented` 之下插入 `Archived: YYYY-MM-DD`，在 Agent Note 仍位于 `implemented/` 时为这两次仅改元数据的编辑重新记录一致性记录，然后把完整的三件套移动到 `archived/`。取代段落以三件套为单位封存，rejected 删除步骤删除整个三件套，合并规则表述为整体删除被吸收的三件套。「Validate and report」加入先封存后校验的顺序：以仅追加的写模式封存 manifest（元数据清单），然后运行封存门禁、文档门禁与 `git diff --check`。配对记录器与封存门禁保持通用命名，本仓库的具体命令只作为具名示例。本记录落实 [2026-08-20-absorb-dsh-skill-set](2026-08-20-absorb-dsh-skill-set.md) 中 `archive-agent-notes` 这一项。

## 备选方案

- **保留 "pair" 并只加重新记录步骤。** 否决：「pair」对合并与 rejected 删除而言同样低估了单位；任何移动或删除 Agent Note 的动作都必须带上其 `.i18n.yaml`，因此只要单位移动，术语就应是「三件套」。
- **在移动之后、针对封存路径重新记录。** 否决：配对记录器会拒绝范围之外（封存）的路径，所以重新记录必须在 Agent Note 仍位于 `implemented/` 时、移动之前运行；`git mv` 保留内容，因此 hash 在搬移后仍然有效。
- **手工改写 `.i18n.yaml` 的 hash。** 否决：配对记录器确定性地计算 git blob hash；手工改写会引入漂移，并绕过门禁所信任的记录器。
- **照搬 deepseek-harness 的 pnpm 命令。** 否决：本仓库运行自己的 node 脚本；具体命令只作为通用「配对记录器」与「封存门禁」的具名示例，而不是宿主事实。

## 后果

- `skills/agent/archive-agent-notes/SKILL.md` 现在以三件套为单位移动和删除，在仅改元数据的 `Archived:` 编辑之后重新记录一致性记录，并在校验之前封存 archive（封存区）。
- 封存门禁的 sidecar hash 校验由重新记录步骤满足，因此一次正确执行的封存无需手工改动 hash 即可通过 `verify-archived-agent-notes.mjs`。
- 重新记录在 Agent Note 仍位于 `implemented/` 时运行；配对记录器对封存路径的范围之外拒绝，正是该步骤先于移动而非后于移动的原因。
- 本记录自身的三件套由配对记录器记录，实际演练了本 skill 现在所记载的命令。
