# Agent Note: 把会话纪律打包进 setup 与 ask

Status: implemented

[English](2026-08-20-pack-session-discipline.md) | 中文

## 问题

pack 的行为护栏只以正文形式存在于本仓库。采纳 pack 的宿主仓库会得到各种约定，却得不到执行纪律——意图门槛、红灯禁止提交、验证后才声称、破坏性动作需点名确认——这些行都是真实会话从真实失败中提炼出来的。

## 决策

四条 standing-order 行随 pack 走：setup-demon-skills 把它们追加进宿主仓库的根 AGENTS.md（常驻上下文，是门唯一能守住的形态）；ask-demon 承载 Session discipline 一节，解释每行如何运转，指向宿主的行而不是把它们重述成第二份规则。不建 confirm-intent skill：必须在误判瞬间生效的纪律属于 standing order，不属于触发式加载的 skill。

## 备选方案

- **confirm-intent skill。** 否决：模型在误判瞬间不会去加载它；门必须常驻上下文。
- **只做 ask-demon。** 否决：没有宿主那行，手册给宿主带不来任何强制力。
- **只做 setup-demon-skills。** 否决：用户需要路由器承载的操作化解释。

## 后果

- 每个经 pack 初始化的仓库，standing order 里自带四条会话纪律。
- ask-demon 解释纪律而不复制其家；规则保持每行一条、住在宿主 AGENTS.md。
- 本仓库已承载第一行；其余三行在下次于本仓库或其他仓库运行 setup 时写入。
