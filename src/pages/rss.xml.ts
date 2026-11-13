// RSS feed. Not linked visibly; advertised through the head alternate link
// only. Published posts, newest first
// (src/lib/posts.ts).
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'wit.et',
    description: '程式、文字、照片、路上——一份永遠沒寫完的清單。',
    site: context.site ?? 'http://localhost:4321',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
      // rssSchema requires `description` to be a non-empty string when
      // present; posts without a summary omit the field entirely rather
      // than sending an empty one (per this ticket's brief: "沒有就省略").
      ...(post.data.summary ? { description: post.data.summary } : {}),
    })),
  });
}
