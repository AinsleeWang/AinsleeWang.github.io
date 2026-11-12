# launch-2a: generated covers, site chrome, typography

## What
Implements POLISH-SPEC sections 2, 3 and 5 (section 4 and 6-7 are later work orders).

**Section 2, constellation covers**
- `src/lib/constellation.ts`: pure `constellation(slug, ratio, labelCorner?)`. FNV-1a hash of the slug seeds mulberry32; returns stars, the chain, the orbit arc, the catalogue number and the reserved label area in a 300-unit-wide frame. No randomness outside the seed, so the same slug gives the same chart on every build.
- `ImageSlot` draws that as inline SVG when a post has no `cover` (`role="img"`, `aria-label="Generated star chart for <title>"`), with the mono label `TAG · WT-nnnn`. The grey `IMAGE 4:3` boxes are gone.
- `scripts/test-constellation.mjs`: 200 random slugs x 4 ratios x both label corners, asserting the layout rules.

**Section 3, chrome**
- `SiteFooter` on every page (rendered by `Base`): ellipsis mark + `wit, et cetera.`, then `RSS` / `INSTAGRAM` / `GITHUB` / `© 2026 wit.et`, then the colophon line.
- `SiteHeader`: one nav everywhere (索引 / 關於 / PROJECTS / RSS), `aria-current="page"` with a 1px underline in the nav colour, bottom hairline on every page but the homepage.
- Right rail: `ListSoFar` (`THE LIST SO FAR`) when there are no build posts; it and `BuildLog` share the `RailCard` shell.
- Reading pages: 72px (desktop) / 28px (mobile) from the header rule to the meta row on all three layouts.
- Skip link (跳到內容) as the first focusable element; `<main id="main">` on every page.
- `Backdrop`: fixed, `aria-hidden` star-chart grid on deep-space pages.
- `::selection` per mode, `theme-color` per mode, paper-mode `.wt-gallery` (new `src/styles/prose-paper.css`).

**Section 5, typography**
- `text-wrap: balance` on headings and card titles, `pretty` on paragraphs; `font-kerning`, `text-autospace` on body; `hanging-punctuation: first` on paper prose; `tabular-nums` on mono meta rows.
- `lang="en"` on the article when frontmatter says `lang: en`.
- Fonts: paper pages request Noto Serif TC only, deep-space pages Noto Sans TC only.

**Bug found on the way**
- `--font-stack` was declared on `:root`, where `--font-zh` does not exist (it is set on `[data-mode]`). A custom property that references an undefined one is invalid, so every `font-family: var(--font-stack)` on the site computed to the browser default (`Times`), and the page only looked right because of system fallbacks. It is now declared on `[data-mode]`. Deep-space card titles, summaries and BUILD LOG rows now really render in Space Grotesk + Noto Sans TC, so Latin text in them looks different from before. This is the intended design, but it is a visible change.

## Why
The site has to look finished with no photographs. Before this, a post without a cover showed a grey placeholder, pages ended without a footer, the nav differed between pages, and a homepage with only essays had an empty right column.

## How to test
- `node scripts/test-constellation.mjs` prints `CONSTELLATION: PASS (0 failures)`.
- `MILESTONE=launch-2a ROUTES="/,/tags/essay/,/tags/photo/,/posts/vancouver-w1-problem-or-feeling/,/posts/git-worktree-no-more-stash/,/posts/kaohsiung-harbor-cargo-ship-3am/,/posts/hualien-third-stay-same-hotel/" scripts/verify.sh` ends with `VERIFY: PASS`.
- `SHOW_SAMPLES=0 MILESTONE=launch-2a-prod ROUTES="/,/tags/essay/,/tags/build/,/posts/vancouver-w4-every-touch-leaves-a-trace/" scripts/verify.sh` ends with `VERIFY: PASS`.
- By eye: `/` with samples (feature chart, two 4:3 charts, BUILD LOG) and without (`THE LIST SO FAR`, `ESSAY 04`); a photo post (16:9 chart); press Tab once on any page (skip link); select text in both modes.

## Visual decisions made here
- **Alpha star ends the chain.** The bright star is always the last (rightmost) node of the chain and always the largest class, as the logo's last node is. Stars off the chain are loose field stars.
- **Star size is capped.** The spec says radii scale with the viewBox. They do up to about 514px of slot width (1.5 / 2.5 / 3.5px at 300px), then stop at 2.6 / 4.3 / 6px. Uncapped, the 1136px cover drew a 27px gold disc. Done with CSS `r` in container units; browsers without it get the 300px sizes. **This departs from the letter of the spec.**
- **Lines stay 1px** at every size (non-scaling strokes).
- **Feature card**: the label moves to the top-right as before, and the chart reserves that corner instead. Under the overlaid title there is a scrim in the slot's own ground colour, so the stars fade out behind the text and the panel is not darkened. On phones the scrim covers the whole text block.
- **Label area** is sized for the narrowest slot (about 280px), so on wide slots the chart keeps more clearance from the label than it strictly needs.
- **Backdrop**: 14 nodes, 5 links, 10 % lines and 14 % nodes. The linked groups sit only in the page margins, so no line runs behind text. It is not shown below 1200px: there is no margin there, and the lone nodes looked like specks on the screen. The spec does not say this.
- **`aria-current`** is set only on the homepage (索引). Tag pages and reading pages set none: the attribute means "this link is the page you are on", and the filter bar already marks the current tag.
- **Tag pages**: the filter bar drops its own top rule there, because the header's hairline now sits directly above it and the two made a double line.
- **Mobile TOC on BUILD pages** moved from above the article to under the title. The spec wants 28px from the header rule to the meta row, and the disclosure sat in between.
- **Nav font**: `"JetBrains Mono", var(--font-zh)` (`--font-mono-stack`), so 索引 / 關於 use the mode's CJK face instead of a system font. On paper pages that means Noto Serif TC in the nav.
- **`© 2026 wit.et`** is not uppercased and is set at 62 %, to read as a note beside the links.
- **`THE LIST SO FAR`** has no total in its header; counts are in the foreground colour, dashes at 62 %.
- **Footer brand** is 15px (`--fs-footer-brand`), skip link 14px (`--fs-skip`); both new in `site-scale.css`.
- **`theme-color`** is read from the vendored `tokens.css` at build time (`src/lib/tokens.ts`), so no colour literal is added to `src/`.

## Starglow uses after this change
`Hero.astro` (hero star), `SiteHeader.astro` (logo last node), `FilterBar.astro` (active filter), `ImageSlot.astro` (alpha star of a generated cover). All four are on the POLISH-SPEC section 0 list.

## Trade-offs and [TBD]
- `hanging-punctuation` and `text-autospace` only take effect where the browser supports them (Safari for the first, recent Chrome for the second).
- `PostNav` still uses plain `var(--font-mono)` for CJK titles (system fallback). Not touched here. [TBD] switch it to `--font-mono-stack`.
- Tag pages still use the larger logo with the glow ring, reading pages the small one. Unchanged. [TBD] pick one when section 4 adds the shared view-transition name.
- The same post gets a different arrangement at different ratios (card 4:3, cover 16:9), with the same catalogue number. [TBD] if one arrangement per post is wanted.
- `/about/` and `/projects/` are linked from the nav and still 404 until the next work order (`check-links.mjs` allows them).
- The spec's footer line was amended in this branch (`INSTAGRAM` added) on the coordinator's instruction; that is the only edit to `POLISH-SPEC.md`.
