// Tag -> visual mode map. This is the ONE place mode-per-tag is decided
// (see docs/DECISIONS.md, C1: draft vs brief conflict, resolved in favor of
// the draft — "mode follows content" — so reverting is a one-line change).
export const modeForTag = {
  essay: 'paper',
  build: 'deep-space',
  photo: 'deep-space',
  travel: 'deep-space',
} as const;

export type Tag = keyof typeof modeForTag;
export type Mode = (typeof modeForTag)[Tag];
