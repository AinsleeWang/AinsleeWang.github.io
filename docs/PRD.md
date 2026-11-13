# wit.et — Product Requirements and Roadmap

As of 2026-11-13. Describes what the site is for, what is built, and what
it can grow into. Design rules live in `docs/EDITORIAL-SPEC.md`; authoring
syntax lives in `docs/WRITING.md`. This file does not repeat them.

## 1. Purpose

A personal publication for storing and sharing the owner's own writing,
technical and non-technical, under the brand **wit.et** ("wit, et cetera").
It is not a portfolio and not a résumé: repositories live on GitHub, and
the site links there.

## 2. Readers and what they need

| Reader | Need |
|---|---|
| Someone arriving from Instagram | Read one essay comfortably on a phone |
| A technical peer or interviewer | Read a lab write-up with code, output and screenshots, and judge the reasoning |
| The owner | Publish by adding one Markdown file; never touch layout |

## 3. Principles

1. Reading comes first: one paper-like mode, a 680px column, Chinese set
   in an upright serif.
2. Literary-magazine tone; nothing that looks machine-generated.
3. Brand identity only. No real name, school, employer, city or email.
4. Nothing fabricated: sample posts are never published.
5. Static and light: works without JavaScript, no trackers, no third-party
   services at runtime except web fonts.

## 4. Non-goals (decided)

- No projects page (GitHub is the index of repositories).
- No visible RSS link. The feed file is still generated.
- No résumé section on 關於 for now.
- No structured summary block (environment / materials / conclusion) on
  technical posts.
- No dark or "deep-space" mode on the site.

## 5. What is built

### 5.1 For readers

| Area | Feature |
|---|---|
| Home | Masthead, tag filter bar with post count, feature block for the newest post, numbered list of the rest |
| Tags | One page per tag: 隨筆, 實作, 攝影, 旅行 |
| Archive | All posts by year at `/archive/` |
| Reading page | Kicker, title, date · place · reading time, aphorism band, prose, previous/next within the tag |
| Quotations | Blockquotes with Latin lines in Garamond italic; a paragraph made of an English quoted line plus a 『』 Chinese line is set as a quotation automatically |
| Technical posts | Table of contents with scroll-spy (≥ 3 headings), highlighted code with filename bar and copy button, line highlights, output blocks, numbered figures, wide figures, galleries, 注意/補充 callouts, numbered steps, reference lists |
| Images | Covers and figures served as AVIF/WebP at responsive sizes, lazy-loaded |
| Other pages | 關於, 404 |
| Sharing | Per-page share card image, sitemap, robots.txt, RSS file |
| Accessibility | Skip link, visible focus ring, reduced-motion support, AA text contrast, 44px touch targets |
| Motion | Page-to-page view transitions |

### 5.2 For the author

- A post is one Markdown file (or a folder with `index.md` and images) in
  `src/content/posts/`.
- Frontmatter: title, date, tag, optional `summary` (the aphorism),
  `location`, `cover` + `coverAlt`, `sample`.
- All technical-post parts are plain Markdown conventions; no components
  to import. See `docs/WRITING.md`.
- `sample: true` posts appear only in local previews started with
  `SHOW_SAMPLES=1`.

### 5.3 Engineering

- Astro static build; design tokens synced from the wit.et design system.
- `scripts/verify.sh`: type check, build, colour-token audit, link check,
  typography rules (no italic Chinese, no monospace outside code, no
  uppercase, weight ≤ 700, no fallback to Times), screenshots.
- GitHub Actions: checks on every pull request; deploy to GitHub Pages on
  merge to `main`.
- Lighthouse (mobile) at the time of writing: performance 97–98,
  accessibility / best practices / SEO 100.

## 6. Publishing workflow

1. Add the Markdown file on a branch.
2. `npm run dev` to preview; `bash scripts/verify.sh` to check.
3. Open a pull request; checks run.
4. Merge; the site redeploys by itself.

## 7. Possible extensions

Effort: S = under a day of agent work, M = a few days, L = larger or
needs an outside service. "Needs" lists what the owner must supply.

### 7.1 Writing and reading

| Idea | What it gives | Effort | Needs / trade-off |
|---|---|---|---|
| Series | Group posts such as the four Vancouver weeks, with an index and "part 2 of 4" | S | A `series` field in frontmatter |
| Book and source citations | Quotation with a formatted source line (author, title, page) | S | A Markdown convention for the source line |
| Footnotes / margin notes | Asides without breaking the paragraph | S–M | Margin notes need a wider layout on desktop |
| Math | Formulas in technical posts | S | Adds a stylesheet to pages that use it |
| Diagrams | Flow and sequence diagrams from text | M | Rendered at build time to keep pages script-free |
| Code diff view | Added/removed lines in code blocks | S | — |
| Finer topics | A second level under 實作 (forensics, web, systems) | S | Decide the vocabulary first |
| Related posts | Two or three suggestions at the end of a post | S | Meaningful only past ~15 posts |
| Drafts and scheduled posts | Write ahead, publish on a date | S | Scheduled publishing needs a daily rebuild job |
| English versions | Selected posts in English with a language switch | M–L | Translation effort is the real cost |

### 7.2 Photography and travel

| Idea | What it gives | Effort | Needs / trade-off |
|---|---|---|---|
| Photo essay layout | Full-width sequences, captions, optional camera data | M | Real photographs; a layout mock to approve |
| Lightbox | Tap a figure to view it large | S | A small script |
| Route map | A static map on travel posts | M | Map tiles come from a third party unless drawn as an image at build time |

### 7.3 Finding and following

| Idea | What it gives | Effort | Needs / trade-off |
|---|---|---|---|
| Search | Full-text search without a server | S | A script and index loaded on demand |
| Visible RSS / email newsletter | Readers get new posts | S / L | Newsletter needs a mailing service and a contact address |
| Custom domain | e.g. `wit.et`-style address instead of `github.io` | S | Buying and renewing a domain |

### 7.4 Feedback and numbers

| Idea | What it gives | Effort | Needs / trade-off |
|---|---|---|---|
| Comments | Discussion under posts via GitHub Discussions | S | Readers need a GitHub account; adds a third-party script |
| Privacy-friendly analytics | Which posts are read | S | A third-party or self-hosted counter; conflicts mildly with principle 5 |

### 7.5 Identity

| Idea | What it gives | Effort | Needs / trade-off |
|---|---|---|---|
| Experience section on 關於 | Context for technical readers | S | Owner supplies the facts; moves away from brand-only |
| Projects page | Curated write-ups rather than a repo list | S | Removed once on purpose; bring back only with case-study content |
| Dark mode | Night reading | M | A second palette to design and approve |

## 8. Suggested order

1. First 實作 post (exercises every technical part with real content).
2. Series, for the Vancouver essays.
3. Source citations for quotations.
4. Search, once there are roughly ten posts.
5. Photo essay layout, when photographs are ready.

## 9. Open decisions

- [TBD] Whether the footer keeps a link to `/archive/`.
- [TBD] Whether reading time (約 N 分鐘) stays.
- [TBD] Whether to remove the RSS file as well as its links.
