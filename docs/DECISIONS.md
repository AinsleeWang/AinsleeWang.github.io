# wit-et-site — Locked Decisions

Written 2026-10-04 (overnight run). Executors follow these; conflicts get
flagged in `docs/NIGHT-REPORT.md`, never silently re-decided.

## Sources and authority

- Visual source of truth for the site: `design-ref/wit.et Blog.dc.html`
  (Claude Design project 28c64dd5…, pulled 2026-10-04). Artboards:
  - `1a` homepage hero/header, `1c` index ("main direction"),
  - `1e` ESSAY reading page, `1f` BUILD reading page, `1g` PHOTO/TRAVEL page,
  - `1h` mobile (index follows `1b` rhythm; BUILD page).
  - `1b`, `1d` are rejected alternatives — do not implement.
- Brand rules: `~/code/wit-et-design-system/docs/wit-et_VIS_brief_for_Claude-Design.md`.
- Tokens: `~/code/wit-et-design-system/tokens/tokens.css` (identical to the
  copy inside the Claude Design project, verified 2026-10-04). Never redefine
  palette hex values in the site.

## Known conflicts (draft vs. brief) and tonight's resolution

| # | Brief says | Draft says | Tonight | Owner |
|---|---|---|---|---|
| C1 | E-1 article pages = paper mode | ESSAY paper; BUILD/PHOTO/TRAVEL deep-space ("mode follows content") | Follow draft. Mode per tag lives in ONE map (`src/lib/modes.ts`) so reverting is a one-line change. Every page is still single-mode. | user decides |
| C2 | Body 16/1.75 (zh 1.9); Caption 13 mono | Body 18/1.9; meta 11–12 mono; titles 26/30/34 | `article.css` defaults to brief scale via custom properties; the site overrides them in ONE file (`src/styles/site-scale.css`) to match the draft. | user decides |
| C3 | — | Uses `rgba()` of palette colors | `qa/color_audit.py` only checks 6-digit hex, so `rgba()` is unaudited. Site rule: alpha colors only via `color-mix(in srgb, var(--token) N%, transparent)`; no raw `rgb(`/`rgba(`/8-digit hex in source. | flagged |

## Structure

- Homepage `/`: `1a` header + hero (deep-space), then the filter bar, then the
  `1c` two-column layout (mixed ESSAY/PHOTO/TRAVEL stream left, sticky BUILD
  LOG right). Mobile (< 768px): single column — left-column article stream
  first, then the BUILD LOG card (not sticky), in that DOM order; it does not
  fold into the stream as compact rows. (amended 2026-10-04, avoids duplicate
  DOM)
- Filter bar = plain links to `/tags/<tag>/` (static pages, no client JS).
  Active item uses `--starglow` (the only starglow besides the logo's last node).
- Content: Astro content collection `posts`, Markdown. Frontmatter:
  `title, date, tag (essay|build|photo|travel), summary?, minutes?, frames?,
  location?, cover?, sample?`. Seed posts copied from the draft carry
  `sample: true` — they are placeholders for the user's real writing.
- Images missing → render the draft's placeholder box (`--space-800`, hairline
  border, mono `IMAGE 3:2` label).
- Near-zero client JS. No UI framework integration.
- Deploy preview (roadmap E-1.1): skipped tonight — needs an external service
  and account login. `[TBD]` for the user.

## Git

- `main` holds only the initial import (design-ref + docs).
- Milestone branches stack: `feat/e1-1-scaffold` → `feat/e1-2-landing` →
  `feat/e1-3-articles`. Nothing is merged or pushed tonight.
- Conventional Commits; PR description per milestone in `docs/pr/<id>.md`
  using What / Why / How to test.

## Launch polish

Decisions for the public launch (2026-11-12) live in `docs/POLISH-SPEC.md`,
which takes precedence over this file where they differ (starglow uses,
client JS, syntax highlighting, sample posts).
