# 礼林生态官方网站

基于 Astro 官方 Minimal 模板初始化，通过 GitHub Actions 构建并发布至 GitHub Pages。

- 网站：https://lilin-eco.github.io/
- 仓库：https://github.com/lilin-eco/lilin-eco.github.io
- Node.js：推荐 24 LTS（见 `.nvmrc`）
- 包管理器：npm，提交 `package-lock.json` 以保持依赖一致

## 本地开发

```sh
npm ci
npm run dev -- --background
```

开发地址默认为 `http://127.0.0.1:4321/`。使用 `npm run dev -- status` 查看状态、`npm run dev -- logs` 查看日志、`npm run dev -- stop` 停止后台服务。若环境不允许写入全局遥测配置，可设置环境变量 `ASTRO_TELEMETRY_DISABLED=1`。

```sh
npm run build
npm run preview
```

构建结果位于 `dist/`，无需手动提交该目录。

## 目录

```text
src/pages/index.astro        官网首页
src/pages/about.astro        公司介绍
src/pages/solutions.astro    产品与解决方案
src/pages/cases.astro        项目案例
src/pages/services.astro     实施与服务
src/pages/business.astro     原业务地址，跳转至解决方案
src/pages/contact.astro      联系我们
src/pages/news/              新闻列表与详情
src/content/news/            Markdown 新闻内容
src/data/company.ts          公司名称与对外联系方式
src/styles/global.css        全站样式与移动端适配
src/components/              背景文化字、页头、新闻列表与联系入口
src/assets/                  建筑光影与工作台图片（构建时输出响应式 WebP）
public/                     静态资源
astro.config.mjs            Astro 及正式网站地址配置
.github/workflows/deploy.yml GitHub Pages 自动发布工作流
```

网站采用 E「柔和人文」视觉：米白底色、灰绿点缀、宋体标题、开放式图文排版。首页、解决方案、项目案例、实施服务、公司介绍、新闻列表及详情、联系页和 404 页共用这套样式。320px 起的手机、平板及桌面使用响应式布局；移动导航支持原生展开、外部点击与 Escape 关闭。

“善心、善念、善行”以淡色背景文字融入首页及内页。背景字的透明度统一为 4.5%，标记为装饰内容，不进入屏幕阅读器的正文。颜色、间距和移动断点维护在 `src/styles/global.css`；文字层由 `src/components/CultureMark.astro` 渲染。

## 维护内容

公司全称由用户确认：**达州礼林生态科技有限责任公司**。业务为工程项目软件服务；对外文案以实际业务问题和解决方案为主。解决方案页面描述建设思路，不代表已发布产品清单。首页图片为生成的建筑与工作场景意象，不作为公司实际办公场所或项目案例。

成立日期、注册资本、法定代表人、注册地址、公开电话及邮箱依据免登录可见的企业资料收录信息补充，来源与查询方式记录在 `src/data/company-public-records.json`，页面显示核对日期及来源链接。注册地址与办公地址分别维护，未将登记地址标为实际办公地点。经营范围仅提取与软件服务相关的项目，不表示拥有工程施工资质。

更新公司资料请编辑 `src/data/company.ts`：phone、email 为公开联系方式；address 仅填写确认的实际办公地址；registeredAddress 为登记地址。地址未确认时联系页显示注册地址，电话和邮箱支持拨号及邮件链接。项目案例、资质、客户名录仍待真实资料支持。服务方向与实施步骤也集中维护在此文件；页面内容分别维护在 about、solutions、cases、services 页面。

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

确认正文可公开后，将 `draft` 改为 `false` 并推送到 main。文章按日期倒序展示，首页自动展示最近两篇；草稿不进入列表、详情路由和 sitemap。文件名对应地址，例如 `/news/company-update/`。现有新闻为真实的网站上线和本次官网栏目更新公告。

## 发布

推送到 `main` 分支会自动触发构建和部署，也可在 GitHub Actions 中手动运行 `Deploy to GitHub Pages`。

Pages 的构建来源需设为 **GitHub Actions**。本仓库是组织主页仓库 `lilin-eco.github.io`，发布在域名根目录，因此不设置额外的 `base` 路径。

```sh
gh run list --repo lilin-eco/lilin-eco.github.io --limit 5
gh api repos/lilin-eco/lilin-eco.github.io/pages
```

部署参考：[Astro 官方 GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)。
