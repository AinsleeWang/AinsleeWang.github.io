# wit-et-site — Editorial Direction

Written 2026-11-12 after the owner reviewed the site with real content and
asked for a literary-magazine feel (reference: 新活水 / Fountain), less
"AI-looking", easy to read. The owner approved the three mocks in
`design-ref/editorial/` (`home.html`, `essay.html`, `build.html`).

**The mocks are the source of truth for layout and CSS values.** Lift their
CSS; do not reinterpret it. This file states the rules the mocks imply and
what happens to the earlier work. It supersedes `docs/POLISH-SPEC.md` and
`docs/DECISIONS.md` wherever they differ; anything they say that is not
contradicted here still holds (tokens-only colour, no raw hex, view
transitions, focus ring, skip link, reduced motion, link checks, sample
posts never published).

## 1. One publication, one mode

- Every page is **paper mode**. `data-mode="paper"` on every `<body>`.
- Deep-space is no longer used on the site. Remove what only existed for it:
  `Backdrop`, generated constellation covers (`src/lib/constellation.ts`,
  its test script, the chart branch of `ImageSlot`), `Hero`'s star chart and
  entrance animation, `BuildLog`, `ListSoFar`, `RailCard`, `prose-deep.css`,
  `src/lib/modes.ts`, the per-mode font switch, the deep-space branches of
  components. No dead code stays behind.
- The vendored `article.css` is no longer imported; reading pages use the
  site's own stylesheet built from the mocks. `scripts/sync-tokens.sh` keeps
  syncing `tokens.css` and the logo files only.
- A post without a `cover` simply has no image. No placeholder of any kind.

## 2. Type

Four faces, each with one job:

| Face | Job |
|---|---|
| Noto Serif TC (400/500/700) | all Chinese; running Latin inside Chinese body text |
| EB Garamond (400/500, roman + italic) | Latin display and Latin/numeric metadata |
| JetBrains Mono (400/500) | code only: `pre`, `code`, `kbd`, the language/filename label on a code bar |
| Space Grotesk 500 | the `wit.et` wordmark in the header, nothing else |

Hard rules (each is machine-checked, see §8):

1. **Chinese is never italic.** No text node containing a CJK character may
   compute to `font-style: italic` or `oblique`. The browser fakes a slanted
   明體 and it looks broken. Italic is applied only to elements whose text is
   Latin letters, digits and punctuation: the masthead, dates, place names
   written in Latin, numerals, `rss / instagram / github`, English quotes.
   Mixed lines are split: `<i class="l">2026.08.02</i>　約 <i class="l">5</i> 分鐘`.
   Provide a tiny component for this (`<Lat>`), do not hand-write spans.
2. Chinese secondary text (meta, labels, captions, prev/next labels) is
   upright Noto Serif TC, set apart by size, letter-spacing and `--ink-70` /
   `--ink-50`, never by slant.
3. No monospace outside code. No uppercase-mono micro-labels anywhere.
4. Heaviest weight is 700.
5. Body: 17px / 2.05, `letter-spacing: .045em`, `text-align: justify`,
   `text-wrap: pretty`, column 680px. Headings `text-wrap: balance`.

All sizes go in `src/styles/site-scale.css`; all alpha colours are named in
`global.css` (`--ink-70`, `--ink-50`, `--rule`, `--rule-strong`, `--band`,
from the mocks). `--starglow` appears only in the logo's last node.

## 3. Words

Interface language is Traditional Chinese. URL slugs do not change.

| Thing | Text |
|---|---|
| Nav | 文章 (`/`) · 作品 (`/projects/`) · 關於 (`/about/`) · `rss` |
| Tags | essay 隨筆 · build 實作 · photo 攝影 · travel 旅行 · all 全部 |
| Count | 共 N 篇 |
| Reading time | 約 N 分鐘 |
| Prev / next | 上一篇 · 下一篇 |
| End of list / empty | 清單還在寫 ⋯ |
| Figures | 圖一, 圖二 … (Chinese numerals to 圖二十, then 圖 21) |
| Code bar | language or filename · 複製 → 已複製 |
| TOC | 目錄 |
| Callouts | 注意 · 補充 |
| Skip link | 跳到內容 |
| Footer | `wit, et cetera.` · `rss` `instagram` `github` `© 2026` |

Not used: 繼續讀 / "read more" links (the whole block is the link).
One map (`src/lib/labels.ts`) holds the tag names; nothing else hardcodes them.

## 4. Home (`design-ref/editorial/home.html`)

Header → masthead (two-line italic `wit, et cetera.`, the Chinese tagline,
the vertical line 「興趣雜得像一張永遠寫不完的清單」 hidden below 820px) →
filter bar → feature → numbered list → end line → footer.

- Feature = the newest published post. Left: kicker (tag name) and the
  post's `summary` set large; right: title, meta, the first ~110 characters
  of the body as an excerpt (plain text, cut at a sentence end where
  possible). If the post has no `summary`, the title is set large and the
  right column omits it. If it has a `cover`, the image (3:2) sits above the
  large line in the left column.
- List = every other post, newest first. The number is the post's ordinal
  among all published posts by date (oldest = 01), so numbers are stable.
  Large line = `summary`, small line = title; without `summary` the title is
  the large line and there is no small line.
- No right rail. Zero posts: masthead, bar (共 0 篇), the end line.
- Tag pages: same list (all posts of the tag, numbered the same way), no
  masthead; instead a head with the tag name as `h1` and the count.

## 5. Reading pages (`essay.html`, `build.html`)

One layout for all four tags. Head (kicker, `h1`, meta with date · location
· reading time) → band with `summary` when present → 680px prose → prev/next
within the tag → footer.

- `h2` carries the moss bar from the author's own `▌` marker.
- Blockquote: thin moss rule; an English line inside is Garamond italic.
- Closing credit lines after the last `---`: small, upright, `--ink-50`.
- `cover`: full-width image between head and band (photo/travel and any
  post that has one), with `coverAlt`.

Technical posts (any tag; used by 實作):

| Part | Markdown the author writes | Result |
|---|---|---|
| Summary table | frontmatter `env`, `materials`, `conclusion` (all optional strings) | 環境 / 材料 / 結論 rows under the band; absent fields omit their row |
| TOC | automatic from `h2` when the post has ≥ 3 | sticky list in the left margin ≥ 1180px with scroll-spy (active item `--ink` + 700; no starglow); `<details>` titled 目錄 above the prose below that |
| Code | fenced block; optional `title="verify.py"` and `{6}` / `{2,5-7}` in the info string | tinted panel, bar with filename (or language) and 複製, highlighted lines, Shiki colours from the paper map in POLISH-SPEC §0 with the comment at 62 % |
| Output | fenced block with language `output` | quiet block with a left rule labelled 輸出, no bar, no highlighting |
| Figure | `![caption](src)` alone in a paragraph | framed image, caption numbered 圖一… |
| Wide figure | `![caption](src "wide")` | breaks out 90px each side (full-bleed on mobile) |
| Gallery | two or more images in one paragraph | side by side, one shared number per image, stacked on mobile |
| Callout | blockquote whose first line is `注意` or `補充` | bordered note with a moss bar |
| Steps | ordered list | Garamond italic numerals |
| References | ordered list under an `h2` named 參考資料 | numbered list, links in `--functional` |

The copy button and scroll-spy stay the one inline script from the motion
work order, now emitted on any page that has a code block or a TOC.

## 6. Other pages

`design-ref/editorial/pages-copy.md` holds the locked copy for 關於, 作品 and
404. They are paper pages built from the same parts: 關於 uses the reading
layout; 作品 is a numbered list like the home list (name, description, stack
as plain text separated by ·, links as Garamond italic `source` / `live`);
404 is the masthead style with 「這一頁不在清單上。」. Wherever that file says
mono, uppercase or deep-space, this spec wins. Add `/archive/` (全部文章 by
year) and link it from the end line on the home page.

## 7. Carried over unchanged

Content plumbing (published-posts helper, covers through `astro:assets`,
prev/next logic, reading time), view transitions, focus ring, skip link,
`::selection`, reduced-motion handling, link checker, token sync.

## 8. Checks added to `scripts/verify.sh`

`scripts/check-type.mjs` (Playwright, run against the built site on every
route given to verify.sh):

- zero text nodes containing CJK with a computed `font-style` other than
  `normal`;
- zero elements outside `pre, code, kbd, .code-bar` whose computed
  `font-family` starts with JetBrains Mono;
- zero elements with `text-transform: uppercase`;
- every `<body>` has `data-mode="paper"`;
- no computed `font-weight` above 700;
- no element computes to a font family of `Times`.
