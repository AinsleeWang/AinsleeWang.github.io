# content: four Vancouver workshop essays

## What
- Adds the first four real posts (tag `essay`, location Vancouver), converted
  from the author's source files: `▌` section markers became `##` headings,
  zero-width characters and the duplicated title line were removed, and the
  closing hashtag/mention lines sit below a divider. Body text is otherwise
  verbatim.
- `summary` on each post is the author's own cover line from the matching
  Instagram card.
- Essay meta row now shows `location` when present (`2026.07.12 · Vancouver · 4 MIN`).

## Why
The site launches with real writing; the 11 design-draft samples stay out of
production builds.

## How to test
1. `SHOW_SAMPLES=0 MILESTONE=essays ROUTES="/,/posts/vancouver-w1-problem-or-feeling/,/tags/essay/" scripts/verify.sh` → `VERIFY: PASS`
2. `ls dist/posts` lists exactly the four `vancouver-w*` slugs.
3. Read one essay at 375 px and 1280 px.

## Open items
- `[TBD]` Dates are assumed (weekly, 2026-07-12 → 2026-08-02); the source only
  gives year and month. Awaiting the author's confirmation.
- `[TBD]` Possible typo left untouched in week 1: 「來不急」.
