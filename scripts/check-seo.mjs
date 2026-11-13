import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

// Check the built artifacts: run after `npm run build`.
const root = path.resolve('dist');
const site = 'https://www.lilinst.com';
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
const files = (await walk(root)).filter(file => file.endsWith('.html'));
const indexed = new Map();
const titles = new Set();
const descriptions = new Set();
let links = 0;
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const label = path.relative(root, file).replaceAll('\\', '/');
  if (label === 'business/index.html') {
    assert.match(html, /http-equiv="refresh"/i, 'Legacy route must remain a redirect fallback');
    continue;
  }
  assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length, 1, `${label}: exactly one H1`);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && description, `${label}: missing title or description`);
  assert.ok(!titles.has(title), `${label}: duplicate title`);
  assert.ok(!descriptions.has(description), `${label}: duplicate description`);
  titles.add(title); descriptions.add(description);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (label === '404.html') {
    assert.match(html, /name="robots" content="noindex, follow"/, '404 must be noindex');
    assert.equal(canonical, undefined, '404 must not declare a canonical page');
    continue;
  }
  const expectedPath = '/' + label.replace(/index\.html$/, '');
  assert.equal(canonical, site + expectedPath, `${label}: canonical host/path mismatch`);
  assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
  assert.equal(html.match(/property="og:url" content="([^"]+)"/)?.[1], canonical);
  const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(image?.startsWith(site + '/_astro/'), `${label}: missing absolute sharing image`);
  await access(path.join(root, new URL(image).pathname));
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(json, `${label}: missing JSON-LD`);
  const data = JSON.parse(json);
  assert.equal(data['@context'], 'https://schema.org');
  const graph = data['@graph'];
  assert.equal(new Set(graph.map(node => node['@id'])).size, graph.length, `${label}: duplicate entity IDs`);
  assert.ok(graph.some(node => node['@type'] === 'Organization' && node.email === 'contact@lilinst.com'));
  assert.ok(graph.some(node => node['@type'] === 'WebSite' && node.url === site + '/'));
  assert.ok(!graph.some(node => node.address), 'Do not reintroduce the removed address through schema');
  if (expectedPath !== '/') {
    const crumbs = graph.find(node => node['@type'] === 'BreadcrumbList');
    assert.ok(crumbs, `${label}: missing breadcrumbs`);
    assert.equal(crumbs.itemListElement.at(-1).item, canonical);
  }
  if (expectedPath.startsWith('/news/') && expectedPath !== '/news/') {
    assert.match(html, /property="og:type" content="article"/);
    const article = graph.find(node => node['@type'] === 'Article');
    assert.ok(article?.datePublished && article.author && article.publisher, `${label}: incomplete article`);
  }
  if (expectedPath.startsWith('/solutions/') && expectedPath !== '/solutions/') {
    const service = graph.find(node => node['@type'] === 'Service');
    assert.equal(service?.url, canonical, `${label}: solution needs a matching Service entity`);
    assert.equal(service?.provider?.['@id'], site + '/#organization');
    const crumbs = graph.find(node => node['@type'] === 'BreadcrumbList');
    assert.deepEqual(crumbs.itemListElement.map(item => item.item), [site + '/', site + '/solutions/', canonical]);
    assert.ok(html.includes('aria-label="面包屑"'), `${label}: visible breadcrumb missing`);
    assert.ok(html.includes('<details') && html.includes('/contact/'), `${label}: missing practical questions/contact path`);
  }
  indexed.set(canonical, file);
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(mailto:|tel:|https?:\/\/)/.test(href) && !href.startsWith(site + '/')) continue;
    const target = new URL(href, canonical);
    const destination = path.join(root, target.pathname.endsWith('/') ? target.pathname + 'index.html' : target.pathname);
    await access(destination).catch(() => assert.fail(`${label}: broken link ${href}`));
    if (target.hash) {
      const destinationHtml = await readFile(destination, 'utf8');
      assert.ok(destinationHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${label}: missing anchor ${href}`);
    }
    links++;
  }
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual([...sitemapUrls].sort(), [...indexed.keys()].sort(), 'Sitemap must match all indexable pages exactly');
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));
for (const slug of ['business-scope-update', 'website-software-services-update']) {
  assert.ok(!sitemap.includes(slug), 'Draft must not appear in sitemap');
  await access(path.join(root, 'news', slug, 'index.html')).then(() => assert.fail('Draft route is published'), () => {});
}
console.log(`SEO checks passed: ${indexed.size} indexable pages, unique metadata, valid JSON-LD, matching sitemap, ${links} internal links.`);
