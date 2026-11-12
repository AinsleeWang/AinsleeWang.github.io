// The only module allowed to call getCollection('posts'). Pages, RSS and
// components obtain posts through these helpers so the sample-post rule and
// the sort order live in exactly one place (docs/POLISH-SPEC.md section 1).
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// Samples are shown in dev and whenever SHOW_SAMPLES=1 (scripts/verify.sh
// sets it so layouts can be screenshotted); a production build without it
// drops every `sample: true` post.
function includeSamples(): boolean {
  return !import.meta.env.PROD || process.env.SHOW_SAMPLES === '1';
}

export async function getPublishedPosts(): Promise<Post[]> {
  const all = await getCollection('posts');
  const visible = includeSamples() ? all : all.filter((p) => !p.data.sample);
  return visible.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

const CJK = /[㐀-䶿一-鿿豈-﫿]/g;
const LATIN_WORD = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

// Frontmatter `minutes` wins; otherwise CJK chars / 400 + Latin words / 220,
// rounded up, minimum 1.
export function readingMinutes(post: Post): number {
  if (post.data.minutes != null) return post.data.minutes;
  // Drop URLs so link/image targets do not count as words.
  const text = (post.body ?? '').replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, '');
  const cjk = text.match(CJK)?.length ?? 0;
  const latin = text.replace(CJK, ' ').match(LATIN_WORD)?.length ?? 0;
  return Math.max(1, Math.ceil(cjk / 400 + latin / 220));
}

// Neighbours within the same tag. `all` must be sorted new -> old (the
// output of getPublishedPosts).
export function adjacentPosts(post: Post, all: Post[]): { older: Post | null; newer: Post | null } {
  const sameTag = all.filter((p) => p.data.tag === post.data.tag);
  const i = sameTag.findIndex((p) => p.id === post.id);
  if (i === -1) return { older: null, newer: null };
  return { newer: sameTag[i - 1] ?? null, older: sameTag[i + 1] ?? null };
}
