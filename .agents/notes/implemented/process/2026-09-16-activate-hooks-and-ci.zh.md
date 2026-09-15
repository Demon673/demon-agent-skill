# Agent Note: 激活 git 钩子并在 CI 中运行门禁

Status: implemented

[English](2026-09-16-activate-hooks-and-ci.md) | 中文

## 问题

pack 会脚手架出 `lefthook.yml` 及其安装器，本仓库也写明了分工：本地钩子覆盖暂存内容的快速路径，CI 拥有全仓库的完整矩阵。但两半都没跑起来。`lefthook` 不是依赖项，于是 `.git/hooks/pre-commit`——那个 lefthook 的 shim——找不到二进制，什么都没检查就退出了；而 `.github/` 里没有任何 workflow。于是每一道门禁都取决于是否有人记得去跑它，而一个没人执行的钩子读起来像是覆盖，其实并不存在。

## 决策

把 `lefthook` 加入 `devDependencies`，使二进制在干净安装后依然存在，并用 `npm run install-lefthook` 激活钩子。pre-commit 的各项 job 现在会针对暂存内容运行：重新校验配对记录、检查封存的 Agent Note、拒绝暂存内容中的空白问题。新增 [.github/workflows/gates.yml](../../../../.github/workflows/gates.yml)，在每次推送到 `main` 以及每个 pull request 上运行 `npm run doc-gates` 与 `.\scripts\validate-skills.ps1`；选用 `windows-latest`，因为校验器解析的是 Windows 的 virtualenv 布局，而维护脚本是 PowerShell。把分工写进 `CONTRIBUTING.md`：CI 跑这两道门禁，钩子是暂存内容的快速路径，每次克隆后运行一次 `npm run install-lefthook` 即可启用。

## 备选方案

- **用 `--no-save` 安装 lefthook。** 否决：二进制会在下一次干净安装后消失，钩子又回到静默失效的状态，而那正是要修的东西。
- **加一个 `prepare` 脚本，让 `npm ci` 自动激活钩子。** 否决：lefthook 不可用时安装器会以非零码退出，而 `prepare` 失败会让整次安装失败，于是一台没有该二进制的机器根本装不了依赖。激活保持为显式步骤。
- **在 `ubuntu-latest` 上跑 skill 校验器。** 否决：该脚本解析 `.venv/skill-validation/Scripts/python.exe`，那是 Windows 的布局；把它移植到 POSIX 路径属于脚本自身的改动，不属于 workflow。
- **继续只靠手工执行。** 否决：没有任何门禁会在无人主动运行时生效，而一道跑不起来的红检查是文档，不是门禁。

## 后果

- 暂存了配对记录、封存 note 或行尾空白的提交会在本地被拦住；对于从未启用钩子的克隆，同样的缺陷也会在 CI 上失败。
- 全仓库矩阵现在会在每次推送到 `main` 和每个 pull request 上运行，本地跑绿不再是唯一的证据。
- `npm ci` 不会激活钩子：全新的克隆需要跑一次 `npm run install-lefthook`。
- CI 成本落在 Windows runner 上——这是维护脚本所假定的 PowerShell 与 virtualenv 工具链的代价。
