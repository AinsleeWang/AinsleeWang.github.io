# launch-engineering: SEO, share cards, deploy, CI

## What

- `astro.config.mjs`: `site` defaults to `https://ainsleewang.github.io`
  (`SITE_URL` overrides); `@astrojs/sitemap` writes `sitemap-index.xml` (tag
  pages and `/404` left out); `public/robots.txt` points to it.
- `Base.astro` head: canonical, `og:*`, `twitter:card`, `article:published_time`
  on posts, default description, apple-touch-icon and manifest links, and
  JSON-LD (`WebSite` on home, `BlogPosting` on posts; author is `wit.et`).
- `scripts/og.mjs`: 1200x630 paper-style cards for every published post and a
  default, into git-ignored `public/og/`. Runs as `prebuild` (`npm run og`).
  Colours are read from `tokens.css`, tag names from `labels.ts`. Any failure
  only warns: posts fall back to `default.png`, or no `og:image` at all.
- `scripts/icons.mjs` + committed `public/apple-touch-icon.png`,
  `public/site.webmanifest`.
- `.github/workflows/deploy.yml` (push to `main` / manual: build, upload,
  deploy to Pages; no sample switch) and `ci.yml` (pull requests: check, build,
  links, colours, type rules). `.nvmrc` pins Node 24.
- `scripts/check-colors.sh` is shared by `verify.sh` and `ci.yml`; `verify.sh`
  prints `COLOR_AUDIT skipped` when `../wit-et-design-system` is absent.
- `README.md` replaces the Astro template.
- Lighthouse fix: secondary text `--ink-50` (3.5:1) is now `--ink-60` (60 %,
  4.8:1 on paper), renamed everywhere in `src/`.

## Why

The site is about to be opened by recruiters and pasted into chats: it needs a
correct canonical domain, readable search results, a good share card, a
deploy that cannot publish sample posts, and a CI gate on pull requests.

## How to test

```
npm run build && grep -c og:image dist/index.html
MILESTONE=launch ROUTES="/,/about/,/projects/,/archive/,/posts/sample-build-kitchen-sink/" scripts/verify.sh
SHOW_SAMPLES=0 MILESTONE=launch-prod ROUTES="/,/about/,/projects/,/archive/,/posts/vancouver-w1-problem-or-feeling/" scripts/verify.sh
npx astro preview --port 4321   # then: npx lighthouse http://localhost:4321/ --chrome-flags="--headless=new"
```

Lighthouse (mobile, production build): all four pages score Performance 97-98,
Accessibility 100, Best Practices 100, SEO 100.

Trade-offs and [TBD]:

- [TBD] GitHub Pages must be switched to "GitHub Actions" in the repository
  settings by hand; this change does not touch repository settings.
- [TBD] Workflows use the latest majors found on 2026-11-13 (checkout v7,
  setup-node v7, upload-pages-artifact v5, deploy-pages v5); they could not
  be run here.
- `--ink-50` -> `--ink-60` is a small visual change (slightly darker grey for
  stack lines, end line, small meta). `docs/EDITORIAL-SPEC.md` still says
  `--ink-50` and was not edited.
- Cards need Chrome and Google Fonts at build time; without them they fall
  back to a system font or are skipped. GitHub's ubuntu runners have Chrome.
- The sitemap omits tag pages (three of four are empty today).
- `og:image` points to the card only if the file exists in `public/og/`.
- The site domain contains the owner's handle; JSON-LD uses `wit.et` as the
  author name and contains no real name or email.
