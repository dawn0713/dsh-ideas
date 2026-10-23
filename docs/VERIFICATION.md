# 验证记录

验证日期：2026-10-23。本次实际安装包：Ideas 0.4.10-dsh.0.2.1、Goals 0.2.2-dsh.0.2.1。

| 检查 | alpha.1 | alpha.2 | rc.2 |
| --- | --- | --- | --- |
| 官方 CLI 安装实际 tgz（离线） | 通过 | 通过 | 通过 |
| 官方兼容检查，无版本豁免 | 通过 | 通过 | 通过 |
| Web profile 配置合成与实际启动 | 通过 | 通过 | 通过 |
| Goals 创建目标、步骤及读取状态 | 通过 | 通过 | 通过 |
| Ideas 完成后回写关联 Goals 步骤 | 通过 | 通过 | 通过 |
| 其他步骤、整个目标状态保持不变 | 通过 | 通过 | 通过 |
| 重复读取不重复写入完成状态 | 通过 | 通过 | 通过 |
| tgz 包含卡片高度与同步状态界面 | 通过 | 通过 | 通过 |

Ideas 使用官方 rc.2 依赖构建，并通过全部 59 项测试（含真实 Gateway、Agent 循环、SlotCore / React DOM 及 Goals 完成反馈）。测试适配了新版 Gateway 的调用者声明，以及 npm 分发中不再提供私有源码的情况。

两个插件的功能源码和编译产物均与上次发布保持一致，宿主依赖交给各版本 DSH 提供；Goals 继续内置 Zod 4.4.3。结果见 [alpha.1](compatibility/alpha1.json)、[alpha.2](compatibility/alpha2.json)、[rc.2](compatibility/rc2.json)。

三个官方宿主均使用独立 DSH_HOME、Ideas dataDir 和示例数据；关闭自动推荐和开发热更新扫描，没有调用付费模型或读取个人数据。测试主机为 macOS x86_64、Node.js 26.1.0，未额外验证 Desktop profile、其他操作系统或真实模型驱动的长期排程。
