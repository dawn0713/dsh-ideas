Ideas 0.4.10 新增 DSH 0.2.1-rc.2 支持，继续兼容 alpha.1 / alpha.2 Web。

- 同一个 tgz 覆盖三个宿主版本，安装、启动、Goals 读写与 Ideas 完成回写均验证通过。
- 支持新版 Cordis / Schemastery，Ideas 通过全部 59 项测试。
- 保留 Ideas 与 Goals 的双向联动：完成关联 Idea 后回写对应步骤，整体目标仍由用户确认。
- 提供固定安装文件、版本化文件与 SHA256SUMS.txt。
- 原有数据格式保持一致，升级插件后重启 DSH 并刷新页面。

固定安装地址：
https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz

配套插件：https://github.com/dawn0713/dsh-goals
