# launch-3: motion, interaction and syntax colour

Branch `feat/launch-3-motion` (from `main`). Implements `docs/POLISH-SPEC.md`
section 4 and the "Syntax highlighting" decision in section 0. Sections 6
and 7 are untouched.

## What

- **Syntax highlighting.** `markdown.syntaxHighlight: 'shiki'` with
  `shikiConfig.theme: 'css-variables'`. Tokens carry
  `color:var(--astro-code-token-*)`; the map to palette tokens lives in
  `prose-deep.css` (deep-space) and `prose-paper.css` (paper).
  `rehypeCodeBar` reads the language from Shiki's `data-language`.
- **Motion tokens.** `global.css` defines `--dur-fast` (160ms),
  `--dur-page` (180ms), `--dur-draw` (900ms), `--dur-node` (320ms),
  `--dur-stagger` (140ms) and `--ease-out`. No other file holds a time
  value.
- **View transitions.** `@view-transition { navigation: auto; }`, a 180ms
  root cross-fade, and `view-transition-name: site-logo` on the header
  mark.
- **Hero entrance.** Both lines draw in over 900ms and the five nodes fade
  in left to right, once, CSS only.
- **Cards.** Hover and focus-visible move the title to `--moss-300`
  (deep-space) / `--moss-700` (paper) and the cover border from 18% to
  40% moss. No transform, no shadow.
- **Prose links.** 1px underline at 3px offset, 2px on hover, both modes.
- **Focus.** One `:focus-visible` ring (2px `--functional`, 3px offset) for
  every focusable element.
- **Reduced motion.** `prefers-reduced-motion: reduce` removes every
  animation and transition and sets `@view-transition` to
  `navigation: none`.
- **Client script.** `src/components/Enhance.astro`, inline, 1425 bytes as
  shipped, rendered by `BuildLayout` only when the post has a TOC or a
  fenced code block. It adds the COPY button to each code bar and the TOC
  scroll-spy.

## Why

The site was static in the literal sense: pages swapped with a hard cut,
code was one colour, the TOC did not say where you were. Each addition here
is tied to something the reader is doing (arriving, pointing, tabbing,
scrolling, copying) and is tuned to be noticed only when it is missing.

## How to test

```sh
MILESTONE=launch-3 ROUTES="/,/tags/build/,/posts/git-worktree-no-more-stash/,/posts/vancouver-w1-problem-or-feeling/,/posts/kaohsiung-harbor-cargo-ship-3am/" scripts/verify.sh
SHOW_SAMPLES=0 MILESTONE=launch-3-prod ROUTES="/,/posts/vancouver-w4-every-touch-leaves-a-trace/" scripts/verify.sh
```

Both end in `VERIFY: PASS`. By hand, with `SHOW_SAMPLES=1 npm run build &&
npm run preview`:

1. `/`: reload and watch the hero chart draw once. Hover a card: the title
   turns moss and the cover border firms up; nothing moves.
2. Click an essay from `/`: the page cross-fades from deep-space to paper
   with no white frame, and the logo stays where it is.
3. `/posts/git-worktree-no-more-stash/`: code is coloured; COPY copies the
   block and reads COPIED for 1.6s; scrolling lights the TOC item of the
   current section in gold.
4. Disable JavaScript and reload that page: no button, same layout, TOC
   links still jump.
5. Turn on "reduce motion" in the OS: no hero animation, no cross-fade, no
   hover transitions.
6. Tab through any page: every stop shows the same ring.

Measured values (Chrome, 1280 wide) are in the hand-back report; the
Playwright scripts that produced them are in `.evidence/launch-3-qa/`
(not committed, like the rest of `.evidence/`).

## Decisions made without asking

- **Variable prefix is `--astro-code-`, not `--shiki-`.** Astro's built-in
  `css-variables` theme uses that prefix. Getting `--shiki-` would mean
  importing `createCssVariablesTheme` from `shiki`, which is only a
  transitive dependency here.
- **Paper comment colour is `--space-950` at 62%, not the spec's 55%.**
  55% measures 3.88:1 on the `--moss-100` code ground; 62% (the existing
  `--muted-paper-62`) measures 4.84:1. This is a conflict with
  POLISH-SPEC section 0 and wants a ruling. Deep-space comment
  (`--muted-62` on `--space-800`) is 5.93:1.
- **Token kinds the spec does not name.** Parameter stays the text colour;
  string-expression follows string; link follows `--functional`; paper
  punctuation stays the text colour.
- **The script is only on BUILD pages.** The code bar exists only there
  (`rehypeCodeBar` is scoped to `tag: build`), so an essay with a code
  block gets colour but no script and no button.
- **Copy button is not created when `navigator.clipboard` is missing**
  (insecure origin), so there is never a button that cannot work.
- **Scroll-spy rule.** Active = the last h2 whose top is within the upper
  30% of the viewport. Nothing is active above the first heading, which
  differs from draft 1f where the first item is lit at the top.
- **The logo's view-transition group does not animate.** With the default
  group animation the mark flew in from above the viewport whenever the
  previous page had been scrolled. Now it sits where the new page puts it
  and its old and new images cross-fade.
- **Hero nodes fade in without moving.** "Fade up" in the spec was read as
  opacity only.
- **`--ease-out` is the CSS `ease-out` keyword**, as the spec words it.
- **Mobile hero chart is `visibility: hidden` instead of `display: none`.**
  Returning from `display: none` restarted the entrance (seen when a
  full-page screenshot resized the viewport).
- **Focus ring exceptions.** A code block's `<pre>` (focusable because
  Shiki adds `tabindex="0"`) draws its ring at `-2px` offset, because
  `.wt-code` clips anything outside it.
- **Copy button hit area** is 28px tall on every width. A 44px target
  would make the bar taller with JS than without.
- **`1600` in `Enhance.astro`** is the one duration outside `global.css`;
  the script cannot read it from CSS without costing more than it saves.
- **`scripts/verify.sh` is unchanged.** It never had a "no `<script`"
  step, so there was nothing to update.

## [TBD]

- **Last TOC item on short posts.** On a tall window the final section of
  a short post cannot reach the 30% line, so its item never lights
  (`git-worktree-no-more-stash` at 1280×900 ends with the second item
  active). Lighting the last item at the bottom of the page fixes it but
  contradicts "second item active when the second h2 is at the top" on
  that same page. Needs a decision.
- **No sample post has a keyword token or a prose link.** Both were
  checked with temporary posts built outside the repo; a real BUILD post
  in a language other than bash would make that check permanent.
- **`scripts/shoot.mjs` can catch the hero mid-entrance** (it shoots about
  0.7s after load), so the home screenshot's last node may be faint.
- **View transitions need Chrome/Edge 126+ or Safari 18.2+.** Other
  browsers navigate with a normal cut.
