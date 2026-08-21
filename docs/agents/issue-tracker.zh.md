# Issue tracker：GitHub

[English](issue-tracker.md) | 中文

本仓库的 issue 与 spec 存放在 GitHub issue 中。所有操作使用 `gh` CLI。

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`。多行正文用 heredoc。
- **读取 issue**：`gh issue view <number> --comments`，用 `jq` 过滤评论并同时获取 labels。
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，配合合适的 `--label` 与 `--state` 过滤。
- **评论 issue**：`gh issue comment <number> --body "..."`
- **应用 / 移除 labels**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **关闭**：`gh issue close <number> --comment "..."`

从 `git remote -v` 推断仓库；在克隆内运行时 `gh` 会自动完成。

## Pull requests 作为 triage（分诊）入口

**PRs as a request surface: no。**（若本仓库把外部 PR 视为功能请求则置为 `yes`；`/triage` 读取此标志。）

置为 `yes` 时，PR 走与 issue 相同的 labels 与状态，使用 `gh pr` 等价命令：

- **读取 PR**：`gh pr view <number> --comments`，diff 用 `gh pr diff <number>`。
- **列出待 triage 的外部 PR**：`gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`，只保留 `authorAssociation` 为 `CONTRIBUTOR`、`FIRST_TIME_CONTRIBUTOR` 或 `NONE` 的项（剔除 `OWNER`/`MEMBER`/`COLLABORATOR`）。
- **评论 / 加标签 / 关闭**：`gh pr comment`、`gh pr edit --add-label`/`--remove-label`、`gh pr close`。

GitHub 的 issue 与 PR 共享同一编号空间，因此裸 `#42` 可能是两者之一：先用 `gh pr view 42` 解析，失败则回退到 `gh issue view 42`。

## 当某个 skill 说 "publish to the issue tracker"

创建一个 GitHub issue。

## 当某个 skill 说 "fetch the relevant ticket"

运行 `gh issue view <number> --comments`。

## Wayfinding 操作

供 `/wayfinder` 使用。**map（地图）** 是单个 issue，**child（子工单）** issue 是 tickets。

- **Map**：一个带 `wayfinder:map` label 的 issue，承载 Notes / Decisions-so-far / Fog 正文。`gh issue create --label wayfinder:map`。
- **Child ticket**：作为 GitHub sub-issue 链接到 map 的 issue（对 sub-issues 端点用 `gh api`）。若 sub-issues 未启用，则把 child 加入 map 正文的任务列表，并在 child 正文顶部写 `Part of #<map>`。Labels：`wayfinder:<type>`（`research`/`prototype`/`grilling`/`task`）。认领后，ticket 指派给驱动开发的 dev。
- **阻塞**：GitHub 的**原生 issue 依赖**，规范的、UI 可见的表示。用 `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 添加边，其中 `<blocker-db-id>` 是阻塞者的数字**database id**（`gh api repos/<owner>/<repo>/issues/<n> --jq .id`，_不是_ `#number` 或 `node_id`）。GitHub 报告 `issue_dependencies_summary.blocked_by`（仅未关闭的阻塞者，实时门禁）。依赖不可用时，回退到 child 正文顶部的 `Blocked by: #<n>, #<n>` 行。所有阻塞者关闭后 ticket 解除阻塞。
- **Frontier query**：列出 map 的未关闭 children（`gh issue list --state open`，限定到 map 的 sub-issues / 任务列表），剔除带未关闭阻塞者（`issue_dependencies_summary.blocked_by > 0`，或 `Blocked by` 行里有未关闭 issue）或已有 assignee 的项；按 map 顺序取第一个。
- **认领**：`gh issue edit <n> --add-assignee @me`，会话的第一次写入。
- **解决**：`gh issue comment <n> --body "<answer>"`，然后 `gh issue close <n>`，再把上下文指针（gist + 链接）追加到 map 的 Decisions-so-far。
