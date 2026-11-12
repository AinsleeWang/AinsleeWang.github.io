// Generated constellation covers (docs/POLISH-SPEC.md section 2).
//
// constellation(slug, ratio) is a pure function: the same slug always yields
// the same chart, so builds are reproducible and a post keeps its chart for
// life. It returns geometry only (no markup) in a coordinate space that is
// always 300 units wide; ImageSlot turns it into an inline SVG.
//
// Vocabulary, taken from the logo and the homepage hero chart: a handful of
// stars, a thin chain through some of them that ends on the one bright
// ("alpha") star, and a single orbit arc crossing the frame.

export const CHART_WIDTH = 300;

export type LabelCorner = 'bottom-left' | 'top-right';

export interface Star {
  x: number;
  y: number;
  r: number; // 1.5 | 2.5 | 3.5 (units of a 300-wide frame)
  alpha: boolean; // exactly one star per chart
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Orbit {
  // The full ellipse the arc is cut from.
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number; // degrees
  // The visible arc, clipped to the frame: endpoints sit on the frame edge.
  from: { x: number; y: number };
  to: { x: number; y: number };
  d: string; // SVG path data for the arc
}

export interface Constellation {
  width: number;
  height: number;
  stars: Star[];
  chain: number[]; // indices into `stars`, in x-order; the last one is the alpha
  orbit: Orbit;
  catalogue: string; // e.g. "WT-0417"
  label: Rect; // area reserved for the mono label; nothing is drawn through it
}

// Stars keep this far from the frame edge (centre to edge).
const EDGE = 20;
// Spec floor is 12 % of the width (36); two units of slack absorb rounding.
const MIN_DIST = CHART_WIDTH * 0.12 + 2;
// The label is HTML text of fixed pixel size laid over the chart, so the
// reserved area is sized for the narrowest slot the site renders (~280 px).
const LABEL_WIDTH = 150;
const LABEL_HEIGHT = 38;
const RADII = [2.5, 1.5, 2.5, 1.5, 1.5, 3.5, 2.5];

// FNV-1a, 32 bit.
export function hashSlug(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseRatio(ratio: string): number {
  const [w, h] = ratio.split(/[/:]/).map(Number);
  const value = w / (h || 1);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`constellation: bad ratio "${ratio}"`);
  return value;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function distToRect(px: number, py: number, rect: Rect): number {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.width));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

function segmentNearRect(ax: number, ay: number, bx: number, by: number, rect: Rect, pad: number): boolean {
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (distToRect(ax + (bx - ax) * t, ay + (by - ay) * t, rect) < pad) return true;
  }
  return false;
}

type Point = { x: number; y: number; r: number };

// Jittered grid: one star per cell at most, each rejected until it clears the
// frame edge, the label area and every star already placed.
function placeStars(rand: () => number, width: number, height: number, label: Rect): Point[] | null {
  const cols = width / height >= 2 ? 5 : 4;
  const rows = height >= 190 ? 3 : 2;
  const cellW = (width - EDGE * 2) / cols;
  const cellH = (height - EDGE * 2) / rows;
  const cells: [number, number][] = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) cells.push([c, r]);

  const most = cells.length >= 12 ? 8 : cells.length >= 10 ? 7 : 6;
  const target = Math.min(most, 5 + Math.floor(rand() * 4));
  const radii = shuffle(RADII, rand);
  const stars: Point[] = [];

  for (const [c, r] of shuffle(cells, rand)) {
    if (stars.length === target) break;
    const radius = radii[stars.length % radii.length];
    for (let attempt = 0; attempt < 12; attempt++) {
      const x = EDGE + (c + rand()) * cellW;
      const y = EDGE + (r + rand()) * cellH;
      if (distToRect(x, y, label) < radius + 6) continue;
      if (stars.some((s) => Math.hypot(s.x - x, s.y - y) < MIN_DIST)) continue;
      stars.push({ x: round1(x), y: round1(y), r: radius });
      break;
    }
  }
  return stars.length >= 5 ? stars : null;
}

function combinations(n: number, k: number): number[][] {
  const out: number[][] = [];
  const walk = (start: number, picked: number[]) => {
    if (picked.length === k) {
      out.push(picked.slice());
      return;
    }
    for (let i = start; i < n; i++) {
      picked.push(i);
      walk(i + 1, picked);
      picked.pop();
    }
  };
  walk(0, []);
  return out;
}

function chainIsClean(chain: number[], stars: Point[], label: Rect): boolean {
  for (let i = 0; i < chain.length - 1; i++) {
    const a = stars[chain[i]];
    const b = stars[chain[i + 1]];
    // Near-vertical or very long links read as scaffolding, not a figure.
    if (b.x - a.x < 12) return false;
    if (Math.hypot(b.x - a.x, b.y - a.y) > CHART_WIDTH * 0.56) return false;
    if (segmentNearRect(a.x, a.y, b.x, b.y, label, 5)) return false;
    // A link never runs through, or grazes, a star that is not on the chain.
    for (let s = 0; s < stars.length; s++) {
      if (chain.includes(s)) continue;
      if (distToSegment(stars[s].x, stars[s].y, a.x, a.y, b.x, b.y) < stars[s].r + 8) return false;
    }
    // No needle-sharp turns.
    if (i > 0) {
      const p = stars[chain[i - 1]];
      const ux = p.x - a.x;
      const uy = p.y - a.y;
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const cos = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
      if (Math.acos(Math.max(-1, Math.min(1, cos))) < (42 * Math.PI) / 180) return false;
    }
  }
  return true;
}

// 4-6 stars in x-order. Returns indices into `stars` (which must already be
// sorted by x), or null when no clean chain exists for this layout.
function pickChain(rand: () => number, stars: Point[], label: Rect): number[] | null {
  const longest = Math.min(6, stars.length);
  const wanted = Math.min(longest, 4 + Math.floor(rand() * 3));
  const lengths = [wanted];
  for (let k = longest; k >= 4; k--) if (k !== wanted) lengths.push(k);
  for (const k of lengths) {
    for (const chain of shuffle(combinations(stars.length, k), rand)) {
      if (chainIsClean(chain, stars, label)) return chain;
    }
  }
  return null;
}

function orbitPoint(o: { cx: number; cy: number; rx: number; ry: number; rotate: number }, t: number) {
  const phi = (o.rotate * Math.PI) / 180;
  const ex = o.rx * Math.cos(t);
  const ey = o.ry * Math.sin(t);
  return { x: o.cx + ex * Math.cos(phi) - ey * Math.sin(phi), y: o.cy + ex * Math.sin(phi) + ey * Math.cos(phi) };
}

// One elliptical arc whose ellipse is centred outside the frame, so only a
// shallow sweep of it crosses the chart. Kept clear of every star (the alpha
// by a wide margin) and of the label.
function pickOrbit(rand: () => number, width: number, height: number, stars: Star[], label: Rect): Orbit | null {
  const inside = (p: { x: number; y: number }) => p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
  const STEPS = 720;

  for (let attempt = 0; attempt < 60; attempt++) {
    const below = rand() < 0.5;
    const ry = height * (0.9 + rand() * 0.9);
    const apex = below ? height * (0.12 + rand() * 0.4) : height * (0.48 + rand() * 0.4);
    const ellipse = {
      cx: width * (0.15 + rand() * 0.7),
      cy: below ? apex + ry : apex - ry,
      rx: width * (0.6 + rand() * 0.5),
      ry,
      rotate: (rand() - 0.5) * 36,
    };

    // Walk the ellipse and collect the runs that fall inside the frame.
    const flags: boolean[] = [];
    for (let i = 0; i < STEPS; i++) flags.push(inside(orbitPoint(ellipse, (i / STEPS) * Math.PI * 2)));
    const starts: number[] = [];
    for (let i = 0; i < STEPS; i++) if (flags[i] && !flags[(i + STEPS - 1) % STEPS]) starts.push(i);
    if (starts.length !== 1) continue; // must be a single arc

    let end = starts[0];
    while (flags[(end + 1) % STEPS]) end++;
    const span = end - starts[0];
    if (span < 8) continue;

    let ok = true;
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = starts[0]; i <= end && ok; i++) {
      const p = orbitPoint(ellipse, (i / STEPS) * Math.PI * 2);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      if (distToRect(p.x, p.y, label) < 6) ok = false;
      for (const s of stars) {
        if (Math.hypot(s.x - p.x, s.y - p.y) < (s.alpha ? 16 : s.r + 7)) ok = false;
      }
    }
    if (!ok || maxX - minX < width * 0.7) continue;

    // Clip each end onto the frame edge by bisection.
    const edge = (inT: number, outT: number) => {
      let a = inT;
      let b = outT;
      for (let i = 0; i < 24; i++) {
        const mid = (a + b) / 2;
        if (inside(orbitPoint(ellipse, mid))) a = mid;
        else b = mid;
      }
      const p = orbitPoint(ellipse, a);
      return {
        x: Math.round(Math.max(0, Math.min(width, p.x)) * 100) / 100,
        y: Math.round(Math.max(0, Math.min(height, p.y)) * 100) / 100,
      };
    };
    const step = (Math.PI * 2) / STEPS;
    const from = edge(starts[0] * step, (starts[0] - 1) * step);
    const to = edge(end * step, (end + 1) * step);
    const rx = round1(ellipse.rx);
    const ryR = round1(ellipse.ry);
    const rotate = round1(ellipse.rotate);
    return {
      cx: round1(ellipse.cx),
      cy: round1(ellipse.cy),
      rx,
      ry: ryR,
      rotate,
      from,
      to,
      // Increasing parameter runs clockwise on screen (y points down): sweep 1.
      d: `M${from.x} ${from.y}A${rx} ${ryR} ${rotate} 0 1 ${to.x} ${to.y}`,
    };
  }
  return null;
}

export function constellation(slug: string, ratio: string, labelCorner: LabelCorner = 'bottom-left'): Constellation {
  const width = CHART_WIDTH;
  const height = Math.round((width / parseRatio(ratio)) * 100) / 100;
  const seed = hashSlug(slug);
  const catalogue = `WT-${String(seed % 10000).padStart(4, '0')}`;
  const label: Rect =
    labelCorner === 'top-right'
      ? { x: width - LABEL_WIDTH, y: 0, width: LABEL_WIDTH, height: LABEL_HEIGHT }
      : { x: 0, y: height - LABEL_HEIGHT, width: LABEL_WIDTH, height: LABEL_HEIGHT };

  // Each attempt reseeds deterministically; the first layout that satisfies
  // every rule wins. In practice the first or second attempt does.
  for (let attempt = 0; attempt < 400; attempt++) {
    const rand = mulberry32((seed ^ Math.imul(attempt + 1, 0x9e3779b1)) >>> 0);
    const placed = placeStars(rand, width, height, label);
    if (!placed) continue;
    placed.sort((a, b) => a.x - b.x);

    const chain = pickChain(rand, placed, label);
    if (!chain) continue;

    // The chain ends on the bright star, as the logo's last node does.
    const alphaIndex = chain[chain.length - 1];
    const stars: Star[] = placed.map((s, i) => ({ x: s.x, y: s.y, r: i === alphaIndex ? 3.5 : s.r, alpha: i === alphaIndex }));
    if (stars.some((s) => distToRect(s.x, s.y, label) < s.r + 4)) continue;

    const orbit = pickOrbit(rand, width, height, stars, label);
    if (!orbit) continue;

    return { width, height, stars, chain, orbit, catalogue, label };
  }
  throw new Error(`constellation: no valid layout for "${slug}" at ${ratio}`);
}
