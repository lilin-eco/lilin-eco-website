import { getCollection } from 'astro:content';
export async function getPublishedNews() {
 return (await getCollection('news', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
export function formatDate(date: Date) {
 return date.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '.');
}
