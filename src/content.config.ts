import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tag: z.enum(['essay', 'build', 'photo', 'travel']),
    summary: z.string().optional(),
    minutes: z.number().optional(),
    frames: z.number().optional(),
    location: z.string().optional(),
    cover: z.string().optional(),
    sample: z.boolean().default(false),
  }),
});

export const collections = { posts };
