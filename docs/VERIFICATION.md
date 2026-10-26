# 验证记录

验证日期：2026-10-26。实际安装包：Ideas 0.4.11-dsh.0.2.1，以及从 GitHub Release 下载的 Goals 0.2.3-dsh.0.2.1。

| 检查 | alpha.1 | alpha.2 | rc.2 |
| --- | --- | --- | --- |
| 官方 CLI 安装实际 tgz（离线） | 通过 | 通过 | 通过 |
| 官方兼容检查，无版本豁免 | 通过 | 通过 | 通过 |
| Web profile 配置与实际启动 | 通过 | 通过 | 通过 |
| Goals 创建目标、步骤及读取状态 | 通过 | 通过 | 通过 |
| Ideas 完成后回写关联 Goals 步骤 | 通过 | 通过 | 通过 |
| 其他步骤、整个目标状态保持不变 | 通过 | 通过 | 通过 |
| 重复读取不重复写入完成状态 | 通过 | 通过 | 通过 |
| 客户端移除聊天头部入口，保留布局与同步功能 | 通过 | 通过 | 通过 |

Ideas 使用 rc.2 官方依赖完成构建，59 项测试全部通过，包含真实 Gateway、Agent 循环、SlotCore / React DOM 与 Goals 完成反馈。客户端测试确认侧边栏入口、全页、右侧栏和任务操作仍正常，聊天头部没有注册 Ideas 快捷入口。

目标服务联动使用用户新上传的 Goals 0.2.3 tgz；其 SHA256 与 GitHub 公布摘要一致。另使用下载的 Goals 客户端和 React DOM 验证八个方向的会话交接与自定义表单移除，测试替换低层控件和会话发送边界，没有调用真实模型。

结果见 [alpha.1](compatibility/alpha1.json)、[alpha.2](compatibility/alpha2.json)、[rc.2](compatibility/rc2.json)。三个官方宿主均使用独立 DSH_HOME、Ideas dataDir 和示例数据。测试关闭自动推荐与开发热更新，没有读取个人数据或调用付费模型。

测试主机为 macOS x86_64、Node.js 26.1.0。未额外验证 Desktop profile、其他系统、真实模型追问效果或长期排程。
