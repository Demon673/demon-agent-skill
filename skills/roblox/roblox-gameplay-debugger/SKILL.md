---
name: roblox-gameplay-debugger
description: Diagnose Roblox gameplay, replication, performance, and runtime issues. Use when debugging Roblox bugs, Luau errors, replication issues, RemoteEvent problems, DataStore failures, UI not updating, physics/network ownership issues, memory leaks, or performance regressions in Roblox experiences.
---

# Roblox 玩法调试器

用于 Roblox 游戏里的运行时问题诊断。优先建立可复现路径，再定位 Server/Client 边界和数据流。

## 诊断顺序

1. 复现问题：
   - 问清 Play Solo、Start Server + Players、线上服务器还是特定设备。
   - 收集 Output 报错、堆栈、触发步骤、玩家数量和网络条件。
2. 缩小边界：
   - 判断问题发生在 Server、Client、Replication、Physics、UI、DataStore 还是外部服务。
   - 找到对应 Script、LocalScript、ModuleScript 和 Remote。
3. 追踪数据流：
   - 输入来源：玩家输入、触碰、ProximityPrompt、UI 按钮、Remote。
   - 状态存储：Attribute、ValueObject、CollectionService Tag、Module 缓存、DataStore。
   - 输出结果：UI、角色状态、物理对象、网络复制、存档。
4. 加最小仪表：
   - 打印关键 Remote 参数、玩家 UserId、Instance 路径、状态版本号。
   - 对高频事件加采样或开关，避免刷爆 Output。
   - 临时日志要易移除。
5. 修复后回归：
   - 单人、多人、重生、离开重进、服务器关闭、低帧率或高延迟场景至少覆盖相关项。

## 常见定位点

- UI 不更新：检查 LocalScript 是否运行、事件是否连接、Remote 是否到达客户端。
- 服务端没反应：检查 Remote 位置、参数类型、权限校验和服务端脚本所在服务。
- 多人不同步：检查状态是否只存在客户端，或 Instance 是否不在可复制容器。
- 物理异常：检查 NetworkOwnership、Anchored、CollisionGroup、Massless 和约束。
- 性能下降：检查 `Heartbeat`/`RenderStepped`、无限循环、过多 Instance、频繁路径查找。
- 存档丢失：检查 DataStore 限流、pcall、BindToClose、玩家离开保存和 session lock。

## 输出格式

- **复现路径**：如何触发问题。
- **边界判断**：Server/Client/Replication/DataStore/UI/Physics。
- **根因**：用代码路径说明，不只给猜测。
- **修复**：最小改动和风险。
- **验证**：实际检查项；无法 Studio 运行时说明静态验证限制。
