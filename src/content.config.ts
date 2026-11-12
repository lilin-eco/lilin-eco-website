import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const news = defineCollection({
 loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
 schema: z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: z.string().default('公司动态'),
  draft: z.boolean().default(false),
 }),
});
export const collections = { news };
