# editorial-3: about, projects, 404, archive

## What

Implements `docs/EDITORIAL-SPEC.md` section 6 with the locked copy in
`design-ref/editorial/pages-copy.md` (text used verbatim, nothing added).

- `/about/` (`pages/about.astro`): reading layout (head, band, 680px prose
  from `article.css`); no date, reading time or prev/next. Tag notes are
  `<dl>` rows (tag name links to `/tags/<tag>/`), find-me is two rows.
  `ReadingHead` now also works without a post (`kicker`, `title`, `latin`).
- `/projects/` (`pages/projects.astro`, `data/projects.ts`): numbered list
  05 -> 01, names in Garamond roman 500, year via `Lat`, stack as one line,
  `live` / `source` in Garamond italic (`rel="noopener"`).
- `/404` (`pages/404.astro`): masthead-style `404`, one line, link back; `noindex`.
- `/archive/` (`pages/archive.astro`): grouped by year (Garamond italic),
  rows = ordinal, title, `MM.DD`, tag name; end line when empty or at the end.
  Footer gets `archive` before `rss`; the home end line links 全部文章 only
  when more than 10 posts are published (`PostList` prop `archive`).
- Shared parts: `styles/list.css` (list rows extracted from `PostList`, now
  used by home, tags, archive, projects) and `ListHead.astro` (tag page head).
- `check-links.mjs` allowlist is empty. New vars in `site-scale.css`:
  `--fs-year`, `--fs-year-m`, `--fs-stack`, `--fs-close-en`.

## Why

The header already linked to 作品 and 關於 (404 until now), and a public
launch needs a way back from a dead URL and a full list of posts. Reusing the
list and reading parts keeps the pages looking like the same publication.

## How to test

```
MILESTONE=ed3 ROUTES="/,/about/,/projects/,/archive/,/404.html,/tags/essay/" scripts/verify.sh
SHOW_SAMPLES=0 MILESTONE=ed3-prod ROUTES="/,/about/,/projects/,/archive/" scripts/verify.sh
```

Both end in `VERIFY: PASS`. Prod archive: one year (2026), 4 rows
(08.02, 07.26, 07.19, 07.12). With samples there are 16 rows (all 16 posts).

Trade-offs and [TBD]:

- [TBD] About h1 is Garamond italic 500 at `--fs-h1` (no existing Latin-title
  rule); it may want a larger size.
- The closing English line renders `*Et*` upright inside the italic paragraph
  (conventional reversal); the copy only says `*Et*`.
- Latin inside Chinese descriptions (e.g. "Mark the players you like!") is
  plain Noto Serif TC, not `Lat`, per the "running Latin" rule; only `*et*` uses `Lat`.
- Archive has no "共 N 篇" deck, since pages-copy gives none.
- The inline "原始碼公開在 GitHub" link in a paragraph is 24px tall (inline
  text link, not a row); all list/row links are >= 44px.
- 404 is not given a FilterBar or count; header has no current item.
