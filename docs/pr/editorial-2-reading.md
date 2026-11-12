# editorial-2: reading pages

## What

Implements `docs/EDITORIAL-SPEC.md` section 5. Section 6 (關於, 作品, 404,
archive) is not touched.

- `ArticleLayout.astro` is the one reading layout (head, optional cover,
  summary band, 680px prose, prev/next, footer). It replaces
  `EssayLayout`, `BuildLayout`, `PhotoLayout` (`git rm`). `posts/[slug].astro`
  always uses it. `Base` has a `bleed` prop so the band can span the page.
- `src/styles/article.css` replaces `prose-legacy.css`; sizes are new
  `--fs-*` in `site-scale.css`, code comments use a new named colour
  `--ink-62`.
- `src/lib/markdown-plugins.mjs`: a Shiki transformer (`title="..."`,
  `{2,5-7}` in the info string) and one rehype plugin: code panel and bar,
  `output` block, numbered figure / wide figure / gallery, 注意 / 補充 note,
  references list, closing credit, Latin-only quote paragraphs. It replaces
  `rehypeCodeBar` and `rehypeFigureImages`.
- Table of contents (>= 3 `h2`): sticky list at >= 1180px, `<details>` below.
  `Enhance.astro` is still one inline script (1308 bytes), now emitted only
  when a page has a code panel or a TOC.
- `Phrases.astro`: a line breaks only after `，` (home feature, list rows,
  band).
- New sample `sample-build-kitchen-sink` (with `scripts/make-sample-shots.py`
  for its stand-in screenshots); `docs/WRITING.md` for the author.

## Why

The owner approved `design-ref/editorial/essay.html` and `build.html`; this
order moves them into the site. Computed values match the mocks at 1280
(h1, meta, band, prose, h2, quote, code panel, output, figure, wide, note,
ordered list, TOC width and position).

## How to test

```
MILESTONE=ed2 ROUTES="/,/posts/vancouver-w1-problem-or-feeling/,/posts/sample-build-kitchen-sink/,/posts/kaohsiung-harbor-cargo-ship-3am/,/posts/git-worktree-no-more-stash/" scripts/verify.sh
SHOW_SAMPLES=0 MILESTONE=ed2-prod ROUTES="/,/posts/vancouver-w1-problem-or-feeling/,/posts/vancouver-w4-every-touch-leaves-a-trace/" scripts/verify.sh
```

Both end in `VERIFY: PASS`. Open `/posts/sample-build-kitchen-sink/` (needs
`SHOW_SAMPLES=1` or dev) next to `build.html`, and w1 next to `essay.html`.

## Trade-offs and [TBD]

- The real essays type their quotes as a plain two-line paragraph, not `>`.
  A paragraph that is exactly an English curly-quoted line plus a `『』` /
  `「」` / `——『』` line becomes a quotation. Where the Chinese line carries
  more text (w1's "every action leaves a trace." paragraph) it is left alone.
- Closing credit = the paragraphs after the last top-level `---` when there
  are at most 3 and under 300 characters; otherwise they stay normal prose.
- Figures without alt text get no caption and no number. A gallery is wide
  if any of its images says `"wide"`; three or more images wrap to rows of two.
- Keyword weight 500 from the mock's code colours is dropped (the
  `css-variables` theme only carries colour). Comments are 62%, as the spec.
- Mock quirks kept: on phones the band text is indented 22px more than the
  prose (`padding: 28px 22px`). [TBD] align it?
- The wide breakout is -90px above 859px but -22px from 820 to 859px (the mock
  would overflow the viewport there). The TOC column sits at the wrap's
  padding edge as in the mock, so it can overlap a wide figure by ~10px.
- Added: a plain `h3` (20px) since the spec names none; ordered lists ignore a
  start number other than 1.
- The scroll-spy listens to `scroll` instead of `IntersectionObserver`, so a
  jump past a heading cannot leave a stale item.
- Footer keeps `margin-top: 56px` (home mock) rather than the reading mock's 72px.
- Cover is set at 16:9 inside the page measure (1068px), not edge to edge.
