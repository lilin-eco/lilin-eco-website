# 礼林生态官方网站

基于 Astro 的静态企业官网，正式网站由阿里云 ESA Pages 托管，GitHub 保存源码，GitHub Pages 保留为备用站。

- 网站：https://lilinst.com/
- GitHub Pages 备用站：https://lilin-eco.github.io/
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
esa.jsonc                   ESA Pages 静态构建与 404 页面配置
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

## 发布与托管

正式网站使用 GitHub 关联的 ESA Pages 项目 `lilin-eco-pages`，仅托管 `npm run build` 生成的静态 `dist/`，没有动态函数入口、数据库或云服务器。此前通过阿里云官方部署技能上传的 `lilin-eco-website` 项目保留为回退版本，不接收自动更新。

GitHub 原生自动发布已连接到 `lilin-eco/lilin-eco.github.io`，生产分支和构建分支均为 `main`。每次推送 `main`，ESA 自动拉取代码、构建并发布生产版本；其他分支不触发构建。根目录 `/`，安装命令 `npm ci`，构建命令 `npm run build`，静态资源目录 `./dist`，环境变量 `ASTRO_TELEMETRY_DISABLED=1`。配置放在 `esa.jsonc`；其中 `404Page` 用于静态站点的自定义 404 页面。不要设置单页应用回退，否则错误地址可能返回首页。

项目需要 Node.js >=22.23.4，本地和 GitHub Actions 使用 Node.js 24。ESA 根据 `package.json` 中的 `engines.node` 选择兼容版本；首次构建已自动从默认 Node.js 22.16.0 切换至 24.13.0。排查更新问题时，在 ESA 项目的「部署」页检查对应提交的构建日志和生产版本。

推送 `main` 会通过现有 GitHub Actions 自动更新 GitHub Pages 备用站，也可手动运行 `Deploy to GitHub Pages`。GitHub Pages 的构建来源保持 **GitHub Actions**，自定义域名保持为空，不添加 `public/CNAME`。本仓库发布在域名根目录，不设置额外的 `base` 路径。

## 域名与 ESA Pages 路由

官网域名为 `lilinst.com`，`www.lilinst.com` 同样通过阿里云 ESA 免费版访问。站点使用 CNAME 接入，阿里云云解析保留权威 DNS。ESA 加速区域为全球（不包含中国内地）。

| 主机记录 | 类型 | 目标 |
| --- | --- | --- |
| `@` | CNAME | `lilinst.com.a1.initxa.com` |
| `www` | CNAME | `www.lilinst.com.a1.initxa.com` |
| `_esaauth` | TXT | ESA 分配的站点归属验证码，保留此记录 |

域名沿用已有 DNS 和免费 HTTPS 证书，无需更换解析目标。站点 ID 为 `188622332487808`，Pages 路由 `lilin-website-pages`（配置 ID `529631981656064`）将以下主机的所有路径交给 `lilin-eco-pages` 的生产版本：

```text
(http.host eq "lilinst.com") or (http.host eq "www.lilinst.com")
```

正常访问直接由 ESA Pages 的静态资源提供，不再跨境回源 GitHub Pages。路由启用异常回源，原有两条代理记录及 HTTPS 回源配置保留为备用：源站、Host 和 SNI 均为 `lilin-eco.github.io`，且校验证书。需要回退时，在 ESA 控制台关闭上述 Pages 路由即可恢复此前的 GitHub Pages 代理方式，DNS 不变。

站点规范链接、Open Graph 地址与 sitemap 由 `astro.config.mjs` 的 `site` 生成，`public/robots.txt` 使用官网域名。临时预览域名仅供调试，需使用控制台生成的 60 分钟访问令牌；正式域名无需令牌。不要在仓库或工作流中保存令牌、AccessKey 或本机 OAuth 凭据。

当前函数与 Pages 账户模式为 `er_freemode`，现有 ESA 免费站点套餐为 12 个月，未启用自动续费；未开通额外付费资源。套餐到期前应在 ESA 控制台核对续用安排。本方案仍使用全球（不包含中国内地）区域，不等同于接入中国内地节点或完成 ICP 备案。

```sh
gh run list --repo lilin-eco/lilin-eco.github.io --limit 5
gh api repos/lilin-eco/lilin-eco.github.io/pages
```

部署参考：[ESA Pages 构建与路由](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/build-pages)、[连接 GitHub 仓库](https://www.alibabacloud.com/help/zh/edge-security-acceleration/esa/user-guide/connect-pages-to-github)、[Astro GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)。
