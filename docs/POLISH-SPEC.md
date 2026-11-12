# wit-et-site — Launch Polish Spec

Written 2026-11-12. Taste decisions for the public launch at
`https://ainsleewang.github.io`. Executors follow these and flag conflicts in
their PR description instead of re-deciding. Authority on conflict:
VIS brief > `tokens.css` > Claude Design draft (`design-ref/`) > this file >
`docs/DECISIONS.md`.

The bar: every page should look finished with zero photographs and zero posts,
and get better as real content arrives. Quiet, precise, hand-made. No effect
is added for its own sake; each one below carries meaning from the brand
("wit, et cetera." — an unfinished list; star charts; the ellipsis).

## 0. Decisions that settle earlier open questions

- **C1 (mode per tag)**: keep the draft. ESSAY = paper; BUILD/PHOTO/TRAVEL and
  all index pages = deep-space. About = paper (it is prose). Projects, 404 =
  deep-space.
- **C2 (type scale)**: keep the draft's sizes via `src/styles/site-scale.css`.
- **Client JS**: allowed only as progressive enhancement, inline, no
  framework, no dependency, total < 2 KB minified across the site. The page
  must be complete and usable with JS off. Exactly two enhancements: code
  "copy" button, BUILD-page TOC scroll-spy.
- **Starglow**: the ≤ 1 % rule from the brief is the real constraint. Allowed
  uses: logo last node, one hero star, active filter item, active TOC item
  (as in draft 1f), the brightest star of a generated constellation cover,
  the 404 star. Nothing else.
- **Mobile hero**: keep at 40 px.
- **Sample posts**: never published. `sample: true` posts are excluded from
  production builds unless `SHOW_SAMPLES=1` (used by `scripts/verify.sh` so
  layouts can still be screenshotted with content).
- **Syntax highlighting**: on, via Shiki's `css-variables` theme so the output
  contains no hex. Token → palette map (deep-space): keyword `--moss-300`,
  string `--stellar-300`, function `--starlight`, constant/number
  `--moss-100`, comment `--muted-62`, punctuation `--muted-82`. Paper mode:
  keyword `--moss-700`, string `--stellar-600`, function `--space-950`,
  constant `--moss-600`, comment `--space-950` at 55 %. No starglow.

## 1. Content plumbing

- `src/lib/posts.ts`: `getPublishedPosts()` (sorted new → old, applies the
  sample rule) is the only way pages/RSS/components obtain posts.
- Reading time: if `minutes` is absent, compute from the body
  (CJK chars / 400 + Latin words / 220, rounded up, min 1).
- `cover`: Astro `image()` schema, optional `coverAlt`. Rendered through
  `astro:assets` (`<Image>`/`<Picture>`, AVIF+WebP, responsive `widths`,
  explicit dimensions, `loading="lazy"` except the first image on a page).
  Images live next to posts in `src/content/posts/<slug>/`.
- Markdown images: one image alone in a paragraph → `<figure>` (exists).
  Two or more images in the same paragraph → `<div class="wt-gallery">` of
  figures, 2-up on ≥ 768 px, stacked below (draft 1g lines 453–456).
- Prev/next: every reading page footer links to the adjacent posts of the
  same tag ("← older title" left, "newer title →" right; omit a side that
  does not exist; keep the "更多 <tag>" link when both are missing).
- Empty states (zero published posts overall, or zero for a tag): a centred
  block — the three-dot ellipsis drawn as three `--moss-300` nodes, the line
  「清單還在寫。」, and mono caption `NOTHING HERE YET …`. Homepage with zero
  posts shows hero + filter bar + this block, and hides BUILD LOG. Filter bar
  count reads `0 posts`.

## 2. Generated constellation covers (replaces grey "IMAGE 4:3" boxes)

When a post has no `cover`, `ImageSlot` renders an inline SVG star chart
unique to that post instead of a placeholder:

- Deterministic: seeded PRNG from the slug (same slug → same chart at build).
- Ground `--space-800`, hairline border as today, `--radius-sm`.
- 5–8 stars placed on a jittered grid (no two closer than 12 % of width),
  radii in three classes (1.5 / 2.5 / 3.5 at a 300 px-wide slot, scaling with
  the viewBox), fill `--moss-300`; one star (the "alpha") filled `--starglow`.
- A 1 px polyline through 4–6 of the stars in x-order, `--moss-300` at 35 %.
- One orbit arc (single 1 px elliptical arc, `--moss-300` at 22 %) crossing
  the frame, never through the alpha star.
- Bottom-left mono label, as the old placeholder label was positioned: the
  post's tag + a catalogue number derived from the seed, e.g. `ESSAY · WT-0417`.
- `role="img"` with `aria-label="Generated star chart for <title>"`.
- Works at every ratio ImageSlot is used at (2.4:1, 4:3, 16:9, 3:2).

## 3. Site chrome

- **Footer** on every page, both modes. Top hairline. Left: the three-node
  ellipsis mark + `wit, et cetera.` Right (mono caps, `--fs-nav`): `RSS`,
  `GITHUB` (https://github.com/AinsleeWang), `© 2026 wit.et`. Stacks on
  mobile, 44 px targets. Below, one mono caption line at 62 % opacity:
  `SET IN SPACE GROTESK, NOTO SERIF/SANS TC & JETBRAINS MONO · BUILT WITH ASTRO`.
- **Header**: one nav everywhere — `索引` → `/`, `關於` → `/about/`,
  `PROJECTS` → `/projects/`, `RSS`. `aria-current="page"` on the active item
  with a 1 px underline in the nav colour (not starglow). Bottom hairline on
  every page except the homepage (the hero supplies its own top rule).
- **Homepage right rail** (desktop): never empty. BUILD LOG when build posts
  exist; otherwise a card of the same shell titled `THE LIST SO FAR` — four
  mono rows, one per tag, each linking to its tag page with a two-digit
  count (`ESSAY 04`), a tag with no posts showing `—` at 62 % opacity, and a
  last row that is just the three-node ellipsis. On mobile it follows the
  stream, as BUILD LOG does. (Found with real content: four essays and no
  build posts left the right column blank.)
- **Reading-page top spacing**: 72 px between the header rule and the meta
  row on desktop, 28 px on mobile, on all three reading layouts (the essay
  page currently has none).
- **Paper-mode gallery**: `.wt-gallery` gets the same 2-up layout in paper
  mode, in the site's own stylesheet (the vendored `article.css` is not
  edited).
- **Skip link** ("跳到內容") visible on focus. `<main id="main">` everywhere.
- **Backdrop** (deep-space pages only): a fixed, `aria-hidden`,
  pointer-events-none SVG star-chart grid behind content — sparse (≤ 14
  nodes, a few 1 px links), `--moss-300` at 10–14 %, no starglow. It must be
  barely noticeable; if it competes with text it is too strong.
- `::selection`: paper `--moss-100` ground; deep-space `--moss-700` ground,
  `--starlight` text. `theme-color` meta per mode (`--paper` / `--space-950`).

## 4. Motion and interaction

- Cross-document view transitions, CSS only:
  `@view-transition { navigation: auto; }`, 180 ms root cross-fade. The logo
  mark gets a shared `view-transition-name` so it stays put between pages.
- Hero constellation: on first paint the links draw in (stroke-dashoffset,
  900 ms, ease-out) and nodes fade up in sequence. Once, no loop.
- Cards: the whole card is the link. Hover/focus-visible: title colour shifts
  to `--moss-300` (deep-space) / `--moss-700` (paper) and the cover's border
  goes from 18 % to 40 % moss; 160 ms. No transforms, no shadows.
- Text links in prose: `--functional`, 1 px underline offset 3 px; hover
  thickens to 2 px.
- `:focus-visible`: 2 px `--functional` outline, 3 px offset, everywhere.
- `prefers-reduced-motion: reduce` disables every animation and transition
  above, including view transitions.
- Copy button: real `<button>` in the code bar, injected by the inline script
  (absent without JS), mono caps; label `COPY` → `COPIED` for 1.6 s,
  `aria-live="polite"`.
- TOC scroll-spy: IntersectionObserver; active item `--starglow` with a
  starglow left rule, others `--moss-300` (draft 1f lines 391–394).

## 5. Typography refinements

- Headings and card titles: `text-wrap: balance`. Paragraphs:
  `text-wrap: pretty`. Body: `text-autospace: normal` (CJK–Latin spacing
  where supported), `font-kerning: normal`, `hanging-punctuation: first`
  on paper-mode prose where supported.
- Numerals in mono meta rows: `font-variant-numeric: tabular-nums`.
- English runs inside CJK paragraphs need no markup; pure-English posts set
  `lang="en"` on the article via optional frontmatter `lang` (default
  `zh-Hant`).
- Fonts: load only what the mode needs — paper pages request Noto Serif TC,
  deep-space pages Noto Sans TC; both get Space Grotesk + JetBrains Mono.
  `preconnect` + `display=swap` stay.

## 6. New pages

- **/about/** (paper, `.wt-article`): mono tag `ABOUT`, h1 `wit, et cetera.`,
  lede 「才智，以及其他。」, then prose in the brand's voice (curious, honest,
  quietly funny; Traditional Chinese first, short English closing paragraph).
  Content limits — public identity is the brand only: no real name, school,
  employer, city, or email. Sections: what "et" means (the unfinished list;
  the visitor's curiosity), what gets posted here (the four tags, each one
  sentence), colophon (dual-mode system, tokens, typefaces, built with
  Astro, source on GitHub), contact = GitHub link only. No invented
  biography: nothing about years of experience, jobs, or places.
- **/projects/** (deep-space): mono-tagged list of public work only, data in
  `src/data/projects.ts` (name, one-line description, stack tags, year,
  links). Each row: name, description, mono stack tags, `SOURCE →` /
  `LIVE →` links. Facts come from the research file handed to the executor;
  anything not in that file is not written.
- **404** (deep-space): a lone starglow star off a broken constellation
  line, h1 `…`, 「這一頁不在清單上。」, mono link `← 回到索引`.

## 7. Launch engineering

- `site` = `https://ainsleewang.github.io`; canonical link on every page.
- Meta: description, Open Graph + Twitter card on every page; one default
  OG image `public/og-default.png` (1200×630, deep-space, logo mark +
  `wit, et cetera.`), produced by a committed script from an HTML template.
- `@astrojs/sitemap`, `robots.txt` pointing to it; JSON-LD `WebSite` on the
  homepage and `BlogPosting` on reading pages.
- Favicon set: existing SVG + 180 px apple-touch-icon + web manifest.
- GitHub Actions: `deploy.yml` (push to `main` → build → Pages) and `ci.yml`
  (pull requests → `astro check`, build, link check, raw-colour grep, a
  vendored copy of the colour audit).
- Budgets, measured on the production build served locally with Lighthouse
  (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95,
  SEO ≥ 95 on `/`, `/about/`, `/projects/` (and one reading page of each
  kind when built with `SHOW_SAMPLES=1`).
- `README.md`: what the site is, how to write a post (frontmatter reference),
  how to run and verify, how deploy works.

## 8. Standing rules (unchanged)

Colours only through tokens (`color-mix` for alpha, named in `global.css`);
font sizes only through `site-scale.css`; mixed text uses `var(--font-stack)`;
never `var(--font-en), var(--font-zh)`; one mode per page; every work order
ends with `scripts/verify.sh` passing and a PR description in `docs/pr/`.
