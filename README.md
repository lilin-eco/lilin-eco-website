# 礼林生态官方网站

基于 Astro 官方 Minimal 模板初始化，通过 GitHub Actions 构建并发布至 GitHub Pages。

- 网站：https://lilin-eco.github.io/
- 仓库：https://github.com/lilin-eco/lilin-eco.github.io
- Node.js：推荐 24 LTS（见 `.nvmrc`）
- 包管理器：npm，提交 `package-lock.json` 以保持依赖一致

## 本地开发

```sh
npm ci
npm run dev
```

开发地址默认为 `http://localhost:4321/`。

```sh
npm run build
npm run preview
```

构建结果位于 `dist/`，无需手动提交该目录。

## 目录

```text
src/pages/index.astro        官网初始页
public/                     静态资源
astro.config.mjs            Astro 及正式网站地址配置
.github/workflows/deploy.yml GitHub Pages 自动发布工作流
```

当前首页为网站建设中页面，后续可逐步加入公司介绍、业务信息和新闻栏目。

## 发布

推送到 `main` 分支会自动触发构建和部署，也可在 GitHub Actions 中手动运行 `Deploy to GitHub Pages`。

Pages 的构建来源需设为 **GitHub Actions**。本仓库是组织主页仓库 `lilin-eco.github.io`，发布在域名根目录，因此不设置额外的 `base` 路径。

```sh
gh run list --repo lilin-eco/lilin-eco.github.io --limit 5
gh api repos/lilin-eco/lilin-eco.github.io/pages
```

部署参考：[Astro 官方 GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)。
