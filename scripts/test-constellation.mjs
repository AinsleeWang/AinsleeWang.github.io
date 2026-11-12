#!/usr/bin/env node
// scripts/test-constellation.mjs — property test for src/lib/constellation.ts
// (docs/POLISH-SPEC.md section 2). Runs 200 random slugs x 4 ratios x both
// label corners and asserts the layout rules; exits 1 on any failure.
//
// Usage: node scripts/test-constellation.mjs
// Imports the .ts source directly: needs Node >= 22.18 (type stripping on by
// default) or `node --experimental-strip-types` on 22.12-22.17.

import { constellation } from '../src/lib/constellation.ts';

const RATIOS = ['2.4/1', '4/3', '16/9', '3/2'];
const CORNERS = ['bottom-left', 'top-right'];
const SLUG_COUNT = 200;

// Slugs come from a fixed-seed LCG so a failure can be reproduced.
let state = 20261112;
const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789-';
const slugs = Array.from({ length: SLUG_COUNT }, () =>
  Array.from({ length: 6 + Math.floor(next() * 30) }, () => ALPHABET[Math.floor(next() * ALPHABET.length)]).join(''),
);

const failures = [];
const stats = { charts: 0, stars: {}, chain: {}, minDist: Infinity, minAlphaOrbit: Infinity, minLabelGap: Infinity };

const distToRect = (px, py, r) =>
  Math.hypot(Math.max(r.x - px, 0, px - (r.x + r.width)), Math.max(r.y - py, 0, py - (r.y + r.height)));

function orbitSamples(o) {
  const phi = (o.rotate * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < 1440; i++) {
    const t = (i / 1440) * Math.PI * 2;
    const ex = o.rx * Math.cos(t);
    const ey = o.ry * Math.sin(t);
    pts.push({ x: o.cx + ex * Math.cos(phi) - ey * Math.sin(phi), y: o.cy + ex * Math.sin(phi) + ey * Math.cos(phi) });
  }
  return pts;
}

for (const slug of slugs) {
  for (const ratio of RATIOS) {
    for (const corner of CORNERS) {
      const id = `${slug} @ ${ratio} ${corner}`;
      const fail = (msg) => failures.push(`${id}: ${msg}`);
      let c;
      try {
        c = constellation(slug, ratio, corner);
      } catch (err) {
        fail(`threw ${err.message}`);
        continue;
      }
      stats.charts++;
      const { width: W, height: H, stars, chain, orbit, label } = c;

      // Deterministic.
      if (JSON.stringify(constellation(slug, ratio, corner)) !== JSON.stringify(c)) fail('not deterministic');

      // 5-8 stars.
      if (stars.length < 5 || stars.length > 8) fail(`star count ${stars.length}`);
      stats.stars[stars.length] = (stats.stars[stars.length] ?? 0) + 1;

      // Radii from the three classes; exactly one alpha.
      if (stars.some((s) => ![1.5, 2.5, 3.5].includes(s.r))) fail('radius outside the three classes');
      if (stars.filter((s) => s.alpha).length !== 1) fail('alpha count is not 1');

      // No two stars closer than 12 % of the width.
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          stats.minDist = Math.min(stats.minDist, d / W);
          if (d < W * 0.12) fail(`stars ${i},${j} are ${d.toFixed(1)} apart`);
        }
      }

      // Stars (whole disc) inside the frame and off the label area.
      for (const s of stars) {
        if (s.x - s.r < 0 || s.x + s.r > W || s.y - s.r < 0 || s.y + s.r > H) fail('star outside the frame');
        const gap = distToRect(s.x, s.y, label) - s.r;
        stats.minLabelGap = Math.min(stats.minLabelGap, gap);
        if (gap <= 0) fail('star overlaps the label area');
      }

      // Label area inside the frame.
      if (label.x < 0 || label.y < 0 || label.x + label.width > W || label.y + label.height > H) fail('label outside the frame');

      // Chain: 4-6 stars, x-ordered, ends on the alpha, never through the label.
      stats.chain[chain.length] = (stats.chain[chain.length] ?? 0) + 1;
      if (chain.length < 4 || chain.length > 6) fail(`chain length ${chain.length}`);
      if (chain.some((i) => !stars[i])) fail('chain index out of range');
      for (let i = 0; i < chain.length - 1; i++) {
        const a = stars[chain[i]];
        const b = stars[chain[i + 1]];
        if (!(a.x < b.x)) fail('chain is not in x-order');
        for (let k = 0; k <= 50; k++) {
          const t = k / 50;
          if (distToRect(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, label) <= 0) {
            fail('chain crosses the label area');
            break;
          }
        }
      }
      if (!stars[chain[chain.length - 1]]?.alpha) fail('chain does not end on the alpha');

      // Orbit: endpoints on the frame edge, arc clear of the alpha and the label.
      for (const p of [orbit.from, orbit.to]) {
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) fail('orbit endpoint outside the frame');
        const onEdge = Math.min(p.x, W - p.x, p.y, H - p.y) < 0.6;
        if (!onEdge) fail('orbit endpoint not on the frame edge');
      }
      const alpha = stars.find((s) => s.alpha);
      for (const p of orbitSamples(orbit)) {
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue;
        const d = Math.hypot(p.x - alpha.x, p.y - alpha.y) - alpha.r;
        stats.minAlphaOrbit = Math.min(stats.minAlphaOrbit, d);
        if (d < 6) {
          fail('orbit passes through or grazes the alpha');
          break;
        }
        if (distToRect(p.x, p.y, label) <= 0) {
          fail('orbit crosses the label area');
          break;
        }
      }
    }
  }
}

// Different slugs give different charts.
const seen = new Map();
let duplicates = 0;
for (const slug of slugs) {
  const key = JSON.stringify(constellation(slug, '4/3').stars);
  if (seen.has(key)) duplicates++;
  seen.set(key, slug);
}
if (duplicates > 0) failures.push(`${duplicates} slugs share a chart with another slug`);

console.log(`charts checked: ${stats.charts} (${SLUG_COUNT} slugs x ${RATIOS.length} ratios x ${CORNERS.length} label corners)`);
console.log(`star counts: ${JSON.stringify(stats.stars)}`);
console.log(`chain lengths: ${JSON.stringify(stats.chain)}`);
console.log(`closest star pair: ${(stats.minDist * 100).toFixed(1)} % of width (floor 12 %)`);
console.log(`closest star edge to label area: ${stats.minLabelGap.toFixed(1)} units`);
console.log(`closest orbit pass to alpha edge: ${stats.minAlphaOrbit.toFixed(1)} units`);
console.log(`duplicate charts across slugs: ${duplicates}`);
for (const f of failures.slice(0, 20)) console.log(`FAIL ${f}`);
console.log(failures.length === 0 ? 'CONSTELLATION: PASS (0 failures)' : `CONSTELLATION: FAIL (${failures.length} failures)`);
process.exit(failures.length === 0 ? 0 : 1);
