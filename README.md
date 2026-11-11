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
src/pages/index.astro        官网首页
src/pages/about.astro        公司介绍
src/pages/business.astro     业务展示
src/pages/contact.astro      联系我们
src/pages/news/              新闻列表与详情
src/content/news/            Markdown 新闻内容
src/data/company.ts          公司名称与对外联系方式
src/styles/global.css        全站样式与移动端适配
public/                     静态资源
astro.config.mjs            Astro 及正式网站地址配置
.github/workflows/deploy.yml GitHub Pages 自动发布工作流
```

网站包含首页、公司介绍、业务展示、新闻动态、联系我们与 404 页面。

## 维护内容

公司全称由用户确认：**达州礼林生态科技有限责任公司**。公开网络检索暂未找到可核验的公司业务、电话、邮箱和办公地址，因此这些信息在页面中标注为待公布，不使用相似企业的资料。更新联系方式请编辑 `src/data/company.ts`，填写公开的 phone、email、address；电话和邮箱会自动显示拨号及邮件链接。公司介绍与业务资料确认后，可分别编辑 about、business 页面。

新增新闻：在 `src/content/news/` 添加 `.md` 文件，例如 `company-update.md`：

```markdown
---
title: 新闻标题
description: 新闻摘要
pubDate: 2026-11-11
category: 公司动态
draft: true
---

新闻正文。
```

确认正文可公开后，将 `draft` 改为 `false` 并推送到 main。文章按日期倒序展示，首页自动展示最近三篇；草稿不进入列表、详情路由和 sitemap。文件名对应地址，例如 `/news/company-update/`。目前只发布真实的网站上线公告。

## 发布

推送到 `main` 分支会自动触发构建和部署，也可在 GitHub Actions 中手动运行 `Deploy to GitHub Pages`。

Pages 的构建来源需设为 **GitHub Actions**。本仓库是组织主页仓库 `lilin-eco.github.io`，发布在域名根目录，因此不设置额外的 `base` 路径。

```sh
gh run list --repo lilin-eco/lilin-eco.github.io --limit 5
gh api repos/lilin-eco/lilin-eco.github.io/pages
```

部署参考：[Astro 官方 GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)。
