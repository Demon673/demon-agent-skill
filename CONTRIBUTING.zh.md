# 参与贡献

[English](CONTRIBUTING.md) | 中文

感谢你的贡献意愿。本仓库是可复用 agent skill 的公开源仓库；欢迎新增、改进或修复 skill 的贡献。

## 报告问题

- 当某个 skill 误触发、给出错误指导或校验失败时，请开 issue。附上简短复现步骤和你期望的结果。
- 使用匹配的 issue 模板：bug 对应缺陷，feature 对应新 skill 或能力，task 对应维护工作。

## 贡献 skill

- 每个 skill 聚焦一个可复用能力，并遵循 [skill 编写规则](AGENTS.md)。
- `SKILL.md` 默认用英文书写；frontmatter 的 `name` 用连字符命名，`description` 以行为为基础、以触发为焦点。
- 开 PR 前，对变更的 skill 运行 `.\scripts\validate-skills.ps1`，对任何文档或 Agent Note 变更运行 `npm run doc-gates`。
- 每个非平凡变更都要新增或更新一个 [Agent Note](.agents/notes/README.md)。

## 许可

参与贡献即表示你同意你的贡献按本仓库的 MIT 许可证授权。
