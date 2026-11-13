import type { APIRoute } from 'astro';
import { getPublishedNews } from '../lib/news';
import { solutionDetails, solutionPath } from '../data/solution-details';
export const GET: APIRoute = async ({ site }) => {
  const pages = ['/', '/about/', '/solutions/', '/cases/', '/services/', '/news/', '/contact/', ...solutionDetails.map(item => solutionPath(item.slug))]
    .map(path => ({ path, lastmod: solutionDetails.find(item => solutionPath(item.slug) === path)?.updatedDate }));
  const articles = (await getPublishedNews()).map(post => ({
    path: '/news/' + post.id + '/',
    lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
  }));
  const entries = [...pages, ...articles].map(page => '<url><loc>' + new URL(page.path, site).href + '</loc>' + (page.lastmod ? '<lastmod>' + page.lastmod + '</lastmod>' : '') + '</url>');
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries.join('') + '</urlset>', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
