# Agent Note: 为 hook 门铃适配事件铃声

Status: implemented

[English](2026-10-14-doorbell-event-chimes.md) | 中文

## 问题

hook 门铃在 Windows 上的蜂鸣模式和 POSIX 上的系统铃声没有包含门铃插件使用的五种事件声音。审批与运行错误共用需要输入和受阻的提示，听者无法区分这些事件。Node 助手安装在 ES module 包下也会失败，Windows 后台启动会拆开含空格的路径或摘要参数。

## 决策

[agent-doorbell](../../../../skills/agent/agent-doorbell/SKILL.md) 保留独立的 hook 管理功能，并自带按 MIT 许可的[门铃声音配方](https://github.com/Demon673/demon-dsh-plugins/blob/ec8c53d/packages/doorbell/src/attention.ts) 渲染的五个短单声道 PCM WAV 文件。原生 runner 通过 Windows SoundPlayer、macOS afplay 或 Linux paplay/aplay 播放文件，以平台声音作为回退。权限请求使用审批提示，运行错误使用失败提示，显式取消保持静默。生成器负责声音配方；运行时播放无需 Node 或插件宿主。

Node 助手在本地声明 CommonJS 模块类型。两个安装器保留 Claude 的可执行文件形式 hook，使用独立参数数组，并继续识别旧 hook，以便替换和卸载。Windows runner 使用编码命令，保留路径和摘要参数。插件拥有的会话状态、客户端路由和常驻播放器留在 skill 之外，因为独立生命周期 hook 没有共同的服务生命周期。

## 备选方案

- **退役 skill，改用插件。** 插件的声音配方和原生播放能够独立使用；CLI 用户仍需要在没有插件宿主时安装和移除 hook。
- **复制插件的常驻播放器和会话路由。** 独立 hook 进程无法拥有插件的会话事件流或服务生命周期；新守护进程会增加超出提醒需求的协调工作。
- **每次 hook 触发时合成铃声。** 自带 WAV 可保持默认 runner 使用原生工具，在无需启动合成器或引入运行时依赖的情况下复现声音。

## 后果

- WAV 播放可用时，支持的平台拥有可区分的事件声音；Linux 需要 paplay 或 aplay 才能播放该音色，quiet/normal 使用系统音量。
- CLI 事件决定默认声音；原生 runner 不从响应文本判断目标受阻。跨客户端去重和插件设置仍属于宿主能力。
- [静默验收检查](../../../../skills/agent/agent-doorbell/references/verification.md) 覆盖 WAV 加载、事件选择、命令格式、安装幂等性、卸载范围及无关设置保留。硬件可听性和真实 CLI 事件投递还需这些检查之外的平台验收。
