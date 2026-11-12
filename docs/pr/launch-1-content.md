# launch-1: content plumbing

## What
Implements POLISH-SPEC section 1.
- `src/lib/posts.ts`: `getPublishedPosts()` (new to old; drops `sample: true` in production unless `SHOW_SAMPLES=1`), `readingMinutes()`, `adjacentPosts()`. It is the only place that calls `getCollection`.
- Schema: `cover` is `image().optional()`, plus `coverAlt` and `lang`. Glob now loads `*.md` and `*/index.md` (slug = folder name); the 11 existing posts are untouched.
- `ImageSlot` renders `astro:assets` `<Picture>` (AVIF + WebP, JPG fallback, widths, sizes, ratio crop) when a cover exists; first image on a page is eager. Without a cover the placeholder is unchanged.
- Gallery: 2+ images in one paragraph become `div.wt-gallery` of figures (2-up from 768px, stacked below).
- `PostNav` (older left, newer right, same tag; "← 更多 <tag>" when neither exists) replaces the footers in all three layouts.
- `EmptyState` for zero posts (home, tag pages); home hides BUILD LOG; RSS stays valid with zero items.
- `scripts/verify.sh`: `SHOW_SAMPLES` (default 1) and a `prod-shape` step.

## Why
The 11 posts are placeholder content and must not ship; layout screenshots still need content. Real posts and photos arrive later, so the image pipeline, gallery, reading time, adjacent navigation and empty states are prepared first.

## How to test
- `MILESTONE=launch-1 ROUTES="/,/tags/build/,..." scripts/verify.sh` ends with `VERIFY: PASS` and `PROD_SHAPE exit=0`.
- `SHOW_SAMPLES=0 npx astro build --outDir /tmp/wt-prod`: no `posts/`, empty-state text on the home page, four tag pages, empty RSS.
- Add `cover: ./x.jpg` to a post with the image beside it, or a folder post with two images in one paragraph.

## Trade-offs and [TBD]
- Reading time ignores nothing but URLs; code blocks count as words.
- Gallery CSS is deep-space only (spec names prose-deep.css); a gallery in an essay (paper) stacks as plain figures. [TBD] add paper styling if wanted.
- Cover with overlay (feature card) gets a `--space-950` gradient scrim for legibility; not in the spec.
- Spec acceptance expected `why-programmers-should-write-essays` to have both neighbours, but it is the newest essay (08-21); the middle essay is `about-et-a-list-never-finished`. Logic is correct; the expectation was off.
- The old "上一篇 · title" essay footer wording is replaced by the spec's "← title".
- `lang` is in the schema only; applying it to the article element belongs to spec section 5.
- Jpg fallback chosen for the `<img>`; transparent PNG covers would lose alpha in the fallback.
