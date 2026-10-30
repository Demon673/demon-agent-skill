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
- 修改维护脚本或编码器时运行 `npm test`。它包含 Doorbell 和状态栏验收脚本，需要 [Python 校验依赖](requirements/skill-validation.txt)、Bash、PowerShell（Windows 使用 `powershell`，其他平台使用 `pwsh`）、`ffmpeg` 和 `ffprobe`；Windows skill 校验器会准备测试运行器使用的 Python 环境。
- CI 在推送到 `main` 和 pull request 时运行测试及这两道 gate（门禁）；本地 git 钩子覆盖暂存内容的快速路径，每次克隆后运行一次 `npm run install-lefthook` 即可启用。
- 在本源仓库中编辑 skill。默认的 Junction 或符号链接安装会立即反映源码编辑；`-Copy` / `--copy` 和下载的包安装需要重新安装才能获取更新。使用安装脚本创建或替换已安装条目。
- 每个非平凡变更都要新增或更新一个 [Agent Note](.agents/notes/README.md)。

## 许可

参与贡献即表示你同意你的贡献按本仓库的 MIT 许可证授权。
