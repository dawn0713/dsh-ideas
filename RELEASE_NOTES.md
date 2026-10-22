Ideas 把个人记忆、Goals 未完成步骤和近期对话整理成可直接开始的下一步，并在聊天中跟踪实际执行进展。

本次提供适用于 DSH 0.2.1-alpha.1 和 alpha.2 Web 的通用包，包含卡片等高、按钮底部对齐，以及 Ideas 完成后回写关联 Goals 步骤的功能。同步失败可重试，整个目标仍由用户明确确认完成。

**安装**：在 DSH 左侧“插件 → 添加插件”粘贴：

```text
https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz
```

安装并启用后重启 `dsh web`，刷新页面即可。已有同名插件可直接更新，保留原有数据。

两个宿主版本已完成官方 CLI 安装、启动、Goals 完成回写和客户端 DOM 验证。Meow 记忆与 Goals 联动为可选配套能力，需分别安装相应插件。

MIT License。截图使用示例数据，安装包不包含个人记忆、聊天记录或密钥。
