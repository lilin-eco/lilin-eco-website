import { company } from '../data/company';

export const sitePages: Record<string, { title: string; description: string; label: string; type: string }> = {
  '/': {
    title: '礼林生态官网｜达州礼林生态科技有限责任公司',
    description: '达州礼林生态科技有限责任公司官方网站。立足四川达州，业务涵盖软件开发与信息服务、工程与空间服务、生态与绿色技术、设备物资配套及运营生活服务。了解公司、业务领域与联系方式。',
    label: '首页', type: 'WebPage',
  },
  '/solutions/': {
    title: '业务领域｜软件开发、工程与生态服务｜礼林生态',
    description: '了解礼林生态的五个业务领域：软件开发与系统集成、工程设计与安装维护、生态与绿色技术、设备租赁与物资配套、物业保洁与生活服务。立足达州，结合实际需求沟通合作。',
    label: '业务领域', type: 'CollectionPage',
  },
  '/cases/': {
    title: '工程数字化应用｜项目管理与图纸资料管理｜礼林生态',
    description: '礼林生态围绕装饰工程项目管理与设计图纸资料管理，介绍进度、预算、材料、财务资料协同，以及图纸分类、版本修订、审核发放和归档等数字化应用方向。',
    label: '项目与实践', type: 'CollectionPage',
  },
  '/services/': {
    title: '服务方式｜需求沟通、实施交付与维护跟进｜礼林生态',
    description: '了解礼林生态的服务流程：需求沟通、范围确认、方案安排、实施交付与维护跟进。围绕软件开发、工程配套、技术服务及日常运营，明确服务内容、分工和交付要求。',
    label: '服务方式', type: 'WebPage',
  },
  '/about/': {
    title: '关于礼林｜达州礼林生态科技有限责任公司',
    description: '礼林生态成立于2023年，立足四川达州，业务涵盖软件与信息服务、工程与空间服务、生态技术、设备物资配套及运营生活服务。了解公司简介与善心、善念、善行的企业理念。',
    label: '关于礼林', type: 'AboutPage',
  },
  '/news/': {
    title: '新闻动态｜公司消息与官方公告｜礼林生态',
    description: '礼林生态官方新闻动态，发布达州礼林生态科技有限责任公司的公司消息、官方公告与业务服务动态，了解礼林生态最新公开信息。',
    label: '新闻动态', type: 'CollectionPage',
  },
  '/contact/': {
    title: '联系我们｜电话与业务咨询邮箱｜礼林生态',
    description: '联系达州礼林生态科技有限责任公司，沟通软件开发、工程配套、生态技术、设备物资及运营生活服务需求。电话：13088146876；邮箱：contact@lilinst.com。',
    label: '联系我们', type: 'ContactPage',
  },
};

export function createStructuredData(options: {
  site: URL; canonical: URL; title: string; description: string; image: string;
  article?: { title: string; publishedTime: string; modifiedTime?: string; category: string };
}) {
  const { site, canonical, title, description, image, article } = options;
  const home = new URL('/', site).href;
  const organizationId = home + '#organization';
  const websiteId = home + '#website';
  const pageId = canonical.href + '#webpage';
  const metadata = sitePages[canonical.pathname];
  const crumbs = [{ name: '首页', item: home }];
  if (article) crumbs.push({ name: '新闻动态', item: new URL('/news/', site).href });
  if (canonical.pathname !== '/') crumbs.push({ name: metadata?.label ?? article?.title ?? title, item: canonical.href });
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization', '@id': organizationId,
      name: company.name, legalName: company.fullName, url: home,
      description: company.description,
      telephone: company.phone, email: company.email,
    },
    {
      '@type': 'WebSite', '@id': websiteId, url: home, name: '礼林生态',
      alternateName: company.fullName, inLanguage: 'zh-CN', publisher: { '@id': organizationId },
    },
    {
      '@type': metadata?.type ?? 'WebPage', '@id': pageId,
      url: canonical.href, name: title, description, inLanguage: 'zh-CN',
      isPartOf: { '@id': websiteId }, about: { '@id': organizationId },
      primaryImageOfPage: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
      ...(canonical.pathname !== '/' ? { breadcrumb: { '@id': canonical.href + '#breadcrumb' } } : {}),
    },
  ];
  if (canonical.pathname !== '/') graph.push({
    '@type': 'BreadcrumbList', '@id': canonical.href + '#breadcrumb',
    itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
  });
  if (article) graph.push({
    '@type': 'Article', '@id': canonical.href + '#article',
    mainEntityOfPage: { '@id': pageId }, headline: article.title, description,
    datePublished: article.publishedTime, articleSection: article.category, inLanguage: 'zh-CN',
    ...(article.modifiedTime ? { dateModified: article.modifiedTime } : {}),
    author: { '@id': organizationId }, publisher: { '@id': organizationId }, image: [image],
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}

// Keep content from breaking out of a JSON-LD script element.
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
