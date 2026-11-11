import type { APIRoute } from 'astro';
import { getPublishedNews } from '../lib/news';
export const GET: APIRoute = async ({ site }) => {
  const paths = ['/', '/about/', '/solutions/', '/cases/', '/services/', '/news/', '/contact/', ...(await getPublishedNews()).map(post => '/news/' + post.id + '/')];
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map(path => '<url><loc>' + new URL(path, site).href + '</loc></url>').join('') + '</urlset>', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
