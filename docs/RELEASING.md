# 维护与发布

Release 提供固定文件名 `dsh-ideas.tgz`，README 中的 `releases/latest/download/dsh-ideas.tgz` 可随最新版本更新。

## 本地构建与打包

```sh
npm install
npm test
mkdir -p artifacts
npm pack --pack-destination artifacts
```

将输出的版本化 tgz 复制为 `artifacts/dsh-ideas.tgz`。本次版本为 `personal-ai-ideas-dsh-plugin-0.4.10-dsh.0.2.1.tgz`。

## 首次发布

先在终端完成 `gh auth login`；不需要把令牌放进仓库。

```sh
gh repo create dawn0713/dsh-ideas --public --source . --remote origin --push --description "Ideas for DeepSeek Harness: memory, goals, and action tracking"
gh release create v0.4.10-dsh.0.2.1 artifacts/dsh-ideas.tgz artifacts/personal-ai-ideas-dsh-plugin-0.4.10-dsh.0.2.1.tgz --repo dawn0713/dsh-ideas --title "Ideas 0.4.10 · DSH alpha.1 / alpha.2 / rc.2" --notes-file RELEASE_NOTES.md --latest
```

## 后续更新

更新版本号、更新记录并完成构建和相关测试后，推送代码，再为新标签创建 Release，继续附带文件名为 `dsh-ideas.tgz` 的安装包。

只将发布所需源码、构建产物、文档和示例图片提交到仓库。`node_modules/`、本地预览、用户记录、环境文件和生成的安装包目录由 `.gitignore` 排除。
