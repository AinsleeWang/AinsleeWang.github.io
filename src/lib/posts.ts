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

export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;
}

// A post's number is its ordinal among all published posts by date
// (oldest = 01), so it never changes when newer posts are added to a tag
// page or the home list. `all` must be sorted new -> old.
export function postNumbers(all: Post[]): Map<string, string> {
  return new Map(all.map((p, i) => [p.id, String(all.length - i).padStart(2, '0')]));
}

// First ~110 characters of the body as plain text, cut at a sentence end
// where possible. Markdown marks, code, images, headings, quotes and the
// `---` credit block are dropped.
export function excerpt(post: Post, target = 110): string {
  const lines = (post.body ?? '')
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^(#|>|!\[|[-*_]{3,}$|<|\|)/.test(l) && !/^▌/.test(l));
  const text = lines
    .map((l) =>
      l
        .replace(/^([-*+]|\d+\.)\s+/, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_`]+/g, ''),
    )
    .join('')
    .replace(/\s+/g, ' ');
  if (text.length <= target) return text;
  const head = text.slice(0, target + 1);
  const cut = Math.max(head.lastIndexOf('。'), head.lastIndexOf('！'), head.lastIndexOf('？'));
  if (cut >= target * 0.5) return text.slice(0, cut + 1);
  const after = text.slice(target).search(/[。！？]/);
  if (after !== -1 && after <= 40) return text.slice(0, target + after + 1);
  return `${text.slice(0, target)}⋯`;
}
