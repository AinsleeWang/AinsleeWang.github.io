# editorial-1: foundation

## What

Moves the site to the editorial direction in `docs/EDITORIAL-SPEC.md`,
sections 1-4 plus site-wide header/footer and the type check from section 8.

- One mode: every `<body>` is `data-mode="paper"`; `Base.astro` renders the
  header, `.wrap` and footer. Fonts: Noto Serif TC, EB Garamond, JetBrains
  Mono, Space Grotesk 500 only.
- `global.css` holds the named colours (`--ink`, `--ink-70`, `--ink-50`,
  `--rule`, `--rule-strong`, `--band`) and `--zh/--en/--mono`;
  `site-scale.css` holds every font size (one `--fs-*` per size).
- New: `Lat` (Garamond italic for Latin/digits), `Mixed` (splits a string
  into Latin runs and Chinese runs), `Masthead`, `PostList` (numbered rows
  plus end line), `ReadingHead`, `src/lib/labels.ts` (tag names).
- Rewritten: `SiteHeader`, `SiteFooter`, `FilterBar`, `PostNav`, `ImageSlot`
  (renders only with a `cover`), home, tag pages, the three reading layouts.
- Home: feature = newest post; list numbers are the ordinal among all
  published posts (oldest = 01); end line `清單還在寫 ⋯`.
- `scripts/check-type.mjs` (six checks, 1280 and 375 wide) is wired into
  `scripts/verify.sh` as `TYPE`.
- Deleted (`git rm`): `src/components/{Backdrop,BuildLog,ListSoFar,RailCard,
  EmptyState,Hero,PostCard,MonoTag,EllipsisMark}.astro`,
  `src/lib/{constellation,modes}.ts`, `scripts/test-constellation.mjs`,
  `src/styles/prose-deep.css`, `src/styles/vendor/article.css`.
  `prose-paper.css` was renamed to `prose-legacy.css`.
  `scripts/sync-tokens.sh` no longer syncs `article.css`.

## Why

The owner reviewed the site with real content and asked for a literary
magazine feel, less "AI-looking", easy to read, and approved the mocks in
`design-ref/editorial/`. This order lifts the mock CSS values for the shell,
home and tag pages. Reading-page layout (section 5) and the other pages
(section 6) are editorial-2.

## How to test

```
MILESTONE=ed1 ROUTES="/,/tags/essay/,/tags/build/,/tags/photo/,/posts/vancouver-w1-problem-or-feeling/,/posts/git-worktree-no-more-stash/,/posts/kaohsiung-harbor-cargo-ship-3am/" scripts/verify.sh
SHOW_SAMPLES=0 MILESTONE=ed1-prod ROUTES="/,/tags/essay/,/tags/build/,/posts/vancouver-w4-every-touch-leaves-a-trace/" scripts/verify.sh
node scripts/check-type.mjs http://localhost:4321/   # against a preview server
```

Both end in `VERIFY: PASS` and print `TYPE: PASS`. Open `/` and `/tags/essay/`
at 1280 and 375 next to `design-ref/editorial/home.html`.

## Trade-offs and [TBD]

- Reading pages are temporary: `prose-legacy.css` (header says so) gives
  paper-readable prose for all three layouts; editorial-2 replaces it. The
  `.wt-prose` class replaces `.wt-article` and `.wt-deep-article`.
- Photo `frames` is no longer shown (the section 5 meta is date, place,
  reading time). The frontmatter field is untouched.
- Feature stretches its large-line link over the whole block, so the block
  is one link with no "read more". The mock has the link on the large line
  only.
- The mock's feature large line has a hand-placed `<br>`; the site uses
  the post's `summary` as written, so wrapping at narrow widths differs.
- Excerpt: first ~110 characters of body text (headings, quotes, code,
  images, credit block dropped), cut at the last 。！？ if one falls in the
  second half of the window, else at the next sentence end within 40
  characters, else `⋯`. The mock's excerpt skips a sentence; the site's does
  not.
- `check-type` treats `.code-bar` and the existing `.wt-code-bar` as code.
  It runs at 1280 and 375, so "pages" counts URLs, not viewports.
- Copy button and TOC label are Chinese (`複製` / `已複製` / `目錄`) now, as
  section 3 asks; the code bar still shows the raw language name.
- Reading pages with neither neighbour link back to the tag page (`更多` +
  tag name); the spec does not cover this case.
- `[TBD]` Nav links `/projects/` and `/about/` still 404 until editorial-2
  (the link checker has an allowlist for them).
- Reading-page headers do not set `aria-current` (only `/` and `/tags/*`
  mark 文章).
