# 礼林生态官方网站

基于 Astro 的静态企业官网，正式网站由阿里云 ESA Pages 托管，GitHub 保存源码并触发自动发布。

- 网站：https://lilinst.com/
- 仓库：https://github.com/lilin-eco/lilin-eco-website
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
src/pages/solutions.astro    五个业务领域
src/pages/cases.astro        项目与实践（数字化应用方向）
src/pages/services.astro     服务方式
src/pages/business.astro     原业务地址，跳转至业务领域
src/pages/contact.astro      联系我们
src/pages/news/              新闻列表与详情
src/content/news/            Markdown 新闻内容
src/data/company.ts          公司名称与对外联系方式
src/data/business-scope.ts   公司提供的完整经营范围
src/styles/global.css        全站样式与移动端适配
src/components/              背景文化字、页头、新闻列表与联系入口
src/assets/                  建筑光影与工作台图片（构建时输出响应式 WebP）
public/                     静态资源
astro.config.mjs            Astro 及正式网站地址配置
esa.jsonc                   ESA Pages 静态构建与 404 页面配置
```

网站采用 E「柔和人文」视觉：米白底色、灰绿点缀、宋体标题、开放式图文排版。首页、业务领域、项目与实践、服务方式、公司介绍、新闻列表及详情、联系页和 404 页共用这套样式。320px 起的手机、平板及桌面使用响应式布局；移动导航支持原生展开、外部点击与 Escape 关闭。

“善心、善念、善行”以淡色背景文字融入首页及内页。背景字的透明度统一为 4.5%，标记为装饰内容，不进入屏幕阅读器的正文。颜色、间距和移动断点维护在 `src/styles/global.css`；文字层由 `src/components/CultureMark.astro` 渲染。

## 维护内容

公司全称由用户确认：**达州礼林生态科技有限责任公司**。官网依据公司于 2026-11-12 提供的完整经营范围，整理为数字技术与信息服务、工程与空间服务、生态与绿色技术、设备租赁与物资配套、运营与生活服务五个领域。首页图片为生成的建筑与工作场景意象，不作为公司实际办公场所或项目案例。

成立日期、注册资本、法定代表人、注册地址、公开电话及邮箱依据免登录可见的企业资料收录信息补充，来源与查询方式记录在 `src/data/company-public-records.json`，页面显示核对日期及来源链接。注册地址与办公地址分别维护，未将登记地址标为实际办公地点。经营范围按公司本次提供的原文保存于 `src/data/business-scope.ts`：55 项一般项目、8 项许可项目，在关于页面中分别展开。经营范围不作为已取得资质、许可证件或已承接全部业务的证明。

更新公司资料请编辑 `src/data/company.ts`：phone、email 为公开联系方式；address 仅填写确认的实际办公地址；registeredAddress 为登记地址。地址未确认时联系页显示注册地址，电话和邮箱支持拨号及邮件链接。五个业务领域、服务步骤及软件应用方向也集中维护在此文件。`applicationDirections` 对外介绍业务场景、分类与设计重点，不展示内部研发进度、接口实现状态或面向访客的解释性免责声明；也不将尚未验证的功能写成已具备的产品能力。项目案例、资质、客户名录须有可公开的真实材料支持，不公开内部知识库、工时或私有开发资料。页面地址保持不变。

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

正式网站使用 GitHub 关联的 ESA Pages 项目 `lilin-eco-pages`，仅托管 `npm run build` 生成的静态 `dist/`，没有动态函数入口、数据库或云服务器。

GitHub 原生自动发布已连接到 `lilin-eco/lilin-eco-website`，生产分支和构建分支均为 `main`。每次推送 `main`，ESA 自动拉取代码、构建并发布生产版本；其他分支不触发构建。根目录 `/`，安装命令 `npm ci`，构建命令 `npm run build`，静态资源目录 `./dist`，环境变量 `ASTRO_TELEMETRY_DISABLED=1`。配置放在 `esa.jsonc`；其中 `404Page` 用于静态站点的自定义 404 页面。不要设置单页应用回退，否则错误地址可能返回首页。

项目需要 Node.js >=22.23.4，本地推荐使用 Node.js 24。ESA 根据 `package.json` 中的 `engines.node` 选择兼容版本；首次构建已自动从默认 Node.js 22.16.0 切换至 24.13.0。排查更新问题时，在 ESA 项目的「部署」页检查对应提交的构建日志和生产版本。

发布链路为：推送 `main` → ESA 拉取 GitHub 源码 → 安装依赖并构建 → ESA Pages 发布生产版本。源码仓库名为 `lilin-eco-website`，本地 `origin` 为 `https://github.com/lilin-eco/lilin-eco-website.git`。官网在域名根目录发布，不设置额外的 `base` 路径。回退时，在 ESA 项目的「部署」页选择历史成功版本发布，或在 GitHub 撤销对应提交后重新推送。

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

正常访问直接由 ESA Pages 的静态资源提供。两条 ESA 代理 DNS 记录是 CNAME 接入与路由生效的必要配置，其源站字段使用当前项目的默认域名 `lilin-eco-pages-1764094378255018.debug.er.aliyun-esa.net` 作为接入占位，正式流量由上述路由直接处理，不访问该调试域名。路由的异常回源关闭，站点没有额外的回源覆盖规则；不要关闭 Pages 路由或开启异常回源。

站点规范链接、Open Graph 地址与 sitemap 由 `astro.config.mjs` 的 `site` 生成，`public/robots.txt` 使用官网域名。临时预览域名仅供调试，需使用控制台生成的 60 分钟访问令牌；正式域名无需令牌。不要在仓库或工作流中保存令牌、AccessKey 或本机 OAuth 凭据。

当前函数与 Pages 账户模式为 `er_freemode`，现有 ESA 免费站点套餐为 12 个月，未启用自动续费；未开通额外付费资源。套餐到期前应在 ESA 控制台核对续用安排。本方案仍使用全球（不包含中国内地）区域，不等同于接入中国内地节点或完成 ICP 备案。

```sh
aliyun esa list-routine-builds --routine-name lilin-eco-pages --region cn-hangzhou
aliyun esa list-routine-routes --routine-name lilin-eco-pages --region cn-hangzhou
```

部署参考：[ESA Pages 构建与路由](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/build-pages)、[连接 GitHub 仓库](https://www.alibabacloud.com/help/zh/edge-security-acceleration/esa/user-guide/connect-pages-to-github)。
