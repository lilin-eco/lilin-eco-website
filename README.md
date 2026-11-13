# 礼林生态官方网站

基于 Astro 的静态企业官网，正式网站由阿里云 ESA Pages 托管，GitHub 保存源码并触发自动发布。

- 网站：https://www.lilinst.com/
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
src/pages/solutions/[slug].astro  工程数字化方案详情
src/data/solution-details.ts      方案内容、常见问题及真实更新日期
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
src/lib/seo.ts               页面 SEO 文案与结构化数据
src/pages/robots.txt.ts      根据正式域名生成爬虫入口
scripts/check-seo.mjs        构建后的 SEO 和内部链接检查
public/                     静态资源
astro.config.mjs            Astro 及正式网站地址配置
esa.jsonc                   ESA Pages 静态构建与 404 页面配置
```

网站采用 E「柔和人文」视觉：米白底色、灰绿点缀、宋体标题、开放式图文排版。首页、业务领域、项目与实践、服务方式、公司介绍、新闻列表及详情、联系页和 404 页共用这套样式。320px 起的手机、平板及桌面使用响应式布局；移动导航支持原生展开、外部点击与 Escape 关闭。

“善心、善念、善行”以淡色背景文字融入首页及内页。背景字的透明度统一为 4.5%，标记为装饰内容，不进入屏幕阅读器的正文。颜色、间距和移动断点维护在 `src/styles/global.css`；文字层由 `src/components/CultureMark.astro` 渲染。

## 维护内容

公司全称由用户确认：**达州礼林生态科技有限责任公司**。官网依据公司于 2026-11-12 提供的完整经营范围，整理为数字技术与信息服务、工程与空间服务、生态与绿色技术、设备租赁与物资配套、运营与生活服务五个领域。首页图片为生成的建筑与工作场景意象，不作为公司实际办公场所或项目案例。

成立日期、注册资本、法定代表人、注册地址、公开电话及邮箱依据免登录可见的企业资料收录信息补充，来源与查询方式记录在 `src/data/company-public-records.json`。关于页面仅保留简短的公司简介与企业理念，不展示工商信息表；联系页仅展示电话和公司指定的联系邮箱 `contact@lilinst.com`，不显示地址、来源链接或核对备注。注册地址与办公地址分别维护，未将登记地址标为实际办公地点。经营范围按公司本次提供的原文保存于 `src/data/business-scope.ts`：55 项一般项目、8 项许可项目，仅作为内容维护依据存档，不在官网展示完整登记清单。经营范围不作为已取得资质、许可证件或已承接全部业务的证明。

更新公司资料请编辑 `src/data/company.ts`：phone、email 为公开联系方式；address 仅填写确认的实际办公地址；registeredAddress 为登记地址。联系页不展示地址，电话和邮箱支持拨号及邮件链接。五个业务领域、服务步骤及软件应用方向也集中维护在此文件。`applicationDirections` 对外介绍业务场景、分类与设计重点，不展示内部研发进度、接口实现状态或面向访客的解释性免责声明；也不将尚未验证的功能写成已具备的产品能力。项目案例、资质、客户名录须有可公开的真实材料支持，不公开内部知识库、工时或私有开发资料。页面地址保持不变。

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

确认正文可公开后，将 `draft` 改为 `false` 并推送到 main。文章按日期倒序展示，首页自动展示最近两篇；草稿不进入列表、详情路由和 sitemap。文件名对应地址，例如 `/news/company-update/`。当前仅发布官网上线公告；业务介绍及栏目视觉调整两篇维护记录保留为草稿，不作为新闻发布。

## 发布与托管

正式网站使用 GitHub 关联的 ESA Pages 项目 `lilin-eco-pages`，仅托管 `npm run build` 生成的静态 `dist/`，没有动态函数入口、数据库或云服务器。

GitHub 原生自动发布已连接到 `lilin-eco/lilin-eco-website`，生产分支和构建分支均为 `main`。每次推送 `main`，ESA 自动拉取代码、构建并发布生产版本；其他分支不触发构建。根目录 `/`，安装命令 `npm ci`，构建命令 `npm run build`，静态资源目录 `./dist`，环境变量 `ASTRO_TELEMETRY_DISABLED=1`。配置放在 `esa.jsonc`；其中 `404Page` 用于静态站点的自定义 404 页面。不要设置单页应用回退，否则错误地址可能返回首页。

项目需要 Node.js >=22.23.4，本地推荐使用 Node.js 24。ESA 根据 `package.json` 中的 `engines.node` 选择兼容版本；首次构建已自动从默认 Node.js 22.16.0 切换至 24.13.0。排查更新问题时，在 ESA 项目的「部署」页检查对应提交的构建日志和生产版本。

发布链路为：推送 `main` → ESA 拉取 GitHub 源码 → 安装依赖并构建 → ESA Pages 发布生产版本。源码仓库名为 `lilin-eco-website`，本地 `origin` 为 `https://github.com/lilin-eco/lilin-eco-website.git`。官网在域名根目录发布，不设置额外的 `base` 路径。回退时，在 ESA 项目的「部署」页选择历史成功版本发布，或在 GitHub 撤销对应提交后重新推送。

## 域名与 ESA Pages 路由

官网域名为 `lilinst.com`，`www.lilinst.com` 同样通过阿里云 ESA 免费版访问。站点已切换为 NS 接入，ESA 权威 DNS 为 `singu-chuli.ns.atrustdns.com` 和 `brahmaputra.ns.atrustdns.com`。ESA 加速区域为全球（不包含中国内地）。

| 主机记录 | 类型 | 目标 |
| --- | --- | --- |
| `@` | ESA 代理记录 | Pages 项目默认域名作为源站占位，流量由 Pages 路由接管 |
| `www` | ESA 代理记录 | Pages 项目默认域名作为源站占位，流量由 Pages 路由接管 |

DNS 记录须在当前 ESA 权威区域维护，旧的云解析区域不再控制线上解析；保留免费 HTTPS 证书。站点 ID 为 `188622332487808`，Pages 路由 `lilin-website-pages`（配置 ID `529631981656064`）将以下主机的所有路径交给 `lilin-eco-pages` 的生产版本：

```text
(http.host eq "lilinst.com") or (http.host eq "www.lilinst.com")
```

正常访问直接由 ESA Pages 的静态资源提供。保留两条 ESA 代理 DNS 记录，其源站字段使用当前项目的默认域名 `lilin-eco-pages-1764094378255018.debug.er.aliyun-esa.net` 作为接入占位，正式流量由上述路由直接处理，不访问该调试域名。路由的异常回源关闭，站点没有额外的回源覆盖规则；不要关闭 Pages 路由或开启异常回源。

站点规范链接、Open Graph 地址、robots.txt 与 sitemap 均由 `astro.config.mjs` 的 `site` 生成，统一为 `https://www.lilinst.com/`。临时预览域名仅供调试，需使用控制台生成的 60 分钟访问令牌；正式域名无需令牌。不要在仓库或工作流中保存令牌、AccessKey 或本机 OAuth 凭据。

当前函数与 Pages 账户模式为 `er_freemode`，现有 ESA 免费站点套餐为 12 个月，未启用自动续费；未开通额外付费资源。套餐到期前应在 ESA 控制台核对续用安排。本方案仍使用全球（不包含中国内地）区域，不等同于接入中国内地节点或完成 ICP 备案。

```sh
aliyun esa list-routine-builds --routine-name lilin-eco-pages --region cn-hangzhou
aliyun esa list-routine-routes --routine-name lilin-eco-pages --region cn-hangzhou
```

部署参考：[ESA Pages 构建与路由](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/build-pages)、[连接 GitHub 仓库](https://www.alibabacloud.com/help/zh/edge-security-acceleration/esa/user-guide/connect-pages-to-github)。

## 搜索与分享

`src/lib/seo.ts` 集中维护各页标题、摘要和结构化数据；文章使用内容集合中的标题、摘要和真实发布日期。页面输出 Organization、WebSite、对应 WebPage 类型及内页面包屑；已发布文章额外输出 Article。企业结构化数据仅使用已公开的名称、电话和邮箱，不输出已移除的注册地址，也不补造客户、资质或案例。404 输出 `noindex, follow`，不声明规范页面。

分享卡片使用现有建筑光影意象，经 Astro 生成 1200 × 630 JPEG（约 90 KB），不作为办公地点或项目照片。Open Graph、Twitter Card 与结构化数据都使用绝对地址。网页仍为静态 HTML，正文和链接不依赖客户端 JavaScript。

ESA 站点保留原有 HTTPS 跳转，新增两条免费套餐内的请求重定向规则：

| 规则 | ID | 行为 |
| --- | --- | --- |
| `seo-legacy-business` | `529673966639104` | `/business`、`/business/`、`/business/index.html` 以 301 跳转到 `https://www.lilinst.com/solutions/` |
| `seo-canonical-www` | `529674002298880` | `lilinst.com` 以 301 跳转到 `https://www.lilinst.com`，保留路径与查询参数 |

两条规则均保留查询参数，后者不匹配 `www` 主机，避免循环；它们不改变已有 ESA Pages 生产路由。改域名时须同步调整 `astro.config.mjs` 和这两条 ESA 规则。若需要回退，在 ESA 请求重定向中停用对应规则，再回退源码。

```sh
npm run build
npm run check:seo
```

检查覆盖唯一标题与摘要、规范链接、JSON-LD、分享图文件、面包屑、文章元数据、404、草稿隔离、站点地图及内部链接。站点地图目前包含 10 个实际可收录页面，不放草稿、旧跳转页或 404。新增装饰工程项目管理、设计图纸资料管理两个独立方案页，由业务领域和项目与实践链接进入，提供业务场景、方案重点、沟通准备与可展开的常见问题；详情页有可见面包屑、Service 结构化数据和相关方向链接。内容介绍软件开发与方案设计需求，不宣称已交付产品、客户或资质。详情页 `updatedDate` 只在实际修改内容时更新，用于 sitemap 与页面结构化数据，不能随每次构建刷新日期。百度已完成所有权验证并手动提交原有 8 个网址；百度当前 sitemap 配额为 0，保留 robots.txt 中的 sitemap 入口。Google、Bing 尚未配置完成。不自动生成重复的营销文章。

## 百度自动提交

这是本项目添加的自动化，使用百度普通收录 API；Astro 本身不自动推送百度。

`main` 推送后，ESA 原生构建发布继续照常运行，同时 GitHub Actions 工作流 `Baidu push after ESA deployment` 开始等待。构建结束时，`scripts/build-search-manifest.mjs` 根据 sitemap 生成 `dist/search-manifest.json`，记录 Git 提交版本与页面内容 SHA-256，并为可收录 HTML 写入不影响视觉的校验 meta。工作流必须确认正式域名上的版本与本次提交一致、所有页面的校验标记一致，才会调用百度；构建失败、旧缓存、跳转和 HTTP 错误都不会触发提交。生产版本 15 分钟左右仍未可访问时，等待步骤报错，排查后手动重跑。

只比较线上已发布页面，提交相对上次百度成功接收记录新增或变化的网址；配额有限时优先新增页面，再更新已知页面，避免新增内容被排在最后。草稿、404、旧跳转页和未进入 sitemap 的页面不会提交。删除的页面从记录中移除，不向百度提交删除请求。首次记录以已手动提交的 8 个页面为基线，位于 `.github/baidu-initial-state.json`；不要修改基线来清除历史记录。

凭据只放在仓库 Settings → Secrets and variables → Actions 的加密 Secret **`BAIDU_PUSH_TOKEN`** 中，由最后的提交步骤读取；不放源代码、GitHub Variables、构建环境或日志。密钥另存于已授权的私密钉钉「官网运维」知识库。工作流不需要阿里云 AccessKey，不重新启用 GitHub Pages。`output/` 已忽略，禁止提交凭据临时文件。

成功记录保存于独立分支 **`codex/baidu-push-state`** 的 `.github/baidu-state.json`，只含公开网址、摘要和提交版本，不含任何密钥。工作流的 `contents: write` 用于维护该分支，不写入 main；ESA 仅自动部署 main，不会因更新记录重复部署。请勿删除状态分支或将它合并回 main。每个网址得到百度明确接收后才保存其摘要；配额不足、凭据失效或接口故障会令工作流报错，尚未成功的网址保留待提交，下次部署或手动重跑继续处理。少量请求在接收后、记录保存前中断时可能重复提交，采用可重试设计防止遗漏。

百度界面目前提供 HTTP 接口，`data.zz.baidu.com` 的 HTTPS 证书存在主机名不匹配。实现通过百度同一服务的 `ziyuan.baidu.com` 建立验证证书的 HTTPS 连接，使用 `Host: data.zz.baidu.com` 路由到提交接口，并明确保持 TLS SNI 为 `ziyuan.baidu.com`。`site` 参数须保留平台给出的原始 `https://www.lilinst.com` 字面值，百分号编码该参数会被此接口以 400 拒绝；请求格式已有回归测试。不关闭证书检查、不降级为 HTTP、不跟随接口重定向；如果百度调整此路由，工作流会报错，需复核接口，不能直接放开 TLS。

维护检查：

```sh
npm run test:search
npm run build
npm run check:seo
gh run list --workflow baidu-push.yml
gh workflow run baidu-push.yml --ref main
```

手动重跑同样只提交尚未确认接收的变化页面。多个发布串行处理，旧版本被较新 main 提交替代时跳过，由最新任务补齐所有待提交页面。自动提交有助于通知百度发现更新，不保证收录或排名。
