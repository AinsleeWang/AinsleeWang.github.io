#!/usr/bin/env node
// scripts/og.mjs — share cards (1200x630) for the site and every published
// post, written to public/og/. Runs before the build (`prebuild`); needs no
// running site. Colours are read from src/styles/vendor/tokens.css, tag names
// from src/lib/labels.ts. A failure prints a warning and exits 0: pages fall
// back to default.png (or to no og:image) instead of breaking the build.
//
// Chinese is never italic here either: italic is used only on Latin text
// (the date, `wit, et cetera.`).
import { readFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public', 'og');
const POSTS = join(ROOT, 'src', 'content', 'posts');

const tokens = readFileSync(join(ROOT, 'src/styles/vendor/tokens.css'), 'utf8');
const tok = (name) => {
  const m = tokens.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`tokens.css has no --${name}`);
  return m[1].trim();
};
const C = { paper: tok('paper'), ink: tok('space-950'), moss: tok('moss-600'), glow: tok('starglow') };

const labels = Object.fromEntries(
  [...readFileSync(join(ROOT, 'src/lib/labels.ts'), 'utf8').matchAll(/^\s*(essay|build|photo|travel):\s*'([^']+)'/gm)].map((m) => [m[1], m[2]]),
);

const TAGLINE = '才智，以及其他。一張永遠沒寫完的清單——程式、文字，et cetera。';

// Flat frontmatter only (the content schema has no nested keys).
function readPosts() {
  const files = [];
  for (const e of readdirSync(POSTS, { withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith('.md')) files.push([e.name.slice(0, -3), join(POSTS, e.name)]);
    else if (e.isDirectory() && existsSync(join(POSTS, e.name, 'index.md'))) files.push([e.name, join(POSTS, e.name, 'index.md')]);
  }
  const posts = [];
  for (const [slug, file] of files) {
    const fm = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const get = (k) => {
      const m = fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
      return m ? m[1].trim().replace(/^(["'])(.*)\1$/, '$2') : undefined;
    };
    if (get('sample') === 'true') continue;
    posts.push({ slug, title: get('title') ?? slug, summary: get('summary'), tag: get('tag'), date: get('date') });
  }
  return posts;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LOGO = `<svg width="54" height="26" viewBox="0 0 100 48" fill="none" aria-hidden="true">
  <polyline points="6,8 28,40 50,12 72,40 94,6" stroke="${C.moss}" stroke-width="2" fill="none"></polyline>
  <circle cx="6" cy="8" r="4.5" fill="${C.moss}"></circle><circle cx="28" cy="40" r="3" fill="${C.moss}"></circle>
  <circle cx="50" cy="12" r="3.5" fill="${C.moss}"></circle><circle cx="72" cy="40" r="3" fill="${C.moss}"></circle>
  <circle cx="94" cy="6" r="4" fill="${C.glow}"></circle></svg>`;

const FONTS =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=EB+Garamond:ital,wght@0,500;1,400;1,500&family=Space+Grotesk:wght@500&display=swap';

function html({ label, date, main, mainClass, sub }) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:630px;background:${C.paper};color:${C.ink};font-family:"Noto Serif TC",serif;display:flex;flex-direction:column;padding:56px 72px 52px;overflow:hidden}
  .top{display:flex;justify-content:space-between;align-items:center;height:36px}
  .label{display:flex;align-items:center;gap:16px;font-weight:700;font-size:26px;letter-spacing:.14em}
  .label::before{content:"";width:48px;height:1px;background:${C.ink}}
  .date{font-family:"EB Garamond",serif;font-style:italic;font-size:32px;color:${C.ink};opacity:.7}
  .mid{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}
  .main{font-weight:700;line-height:1.4;letter-spacing:.02em;font-size:76px}
  .main.latin{font-family:"EB Garamond",serif;font-style:italic;font-weight:500;line-height:1;letter-spacing:-.02em;font-size:176px}
  .sub{margin-top:34px;font-size:30px;line-height:1.7;letter-spacing:.06em;opacity:.7}
  .foot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${C.ink};padding-top:26px}
  .foot .l{display:flex;align-items:center;gap:16px;font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:30px}
  .foot .r{font-family:"EB Garamond",serif;font-style:italic;font-size:36px}
  </style></head><body>
  <div class="top">${label ? `<div class="label">${esc(label)}</div>` : '<div></div>'}<div class="date">${date ?? ''}</div></div>
  <div class="mid"><div class="main ${mainClass ?? ''}" id="main">${main}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>
  <div class="foot"><div class="l">${LOGO}<span>wit.et</span></div><div class="r">${sub ? '' : 'wit, et cetera.'}</div></div>
  </body></html>`;
}

// Break after each full-width comma so a line never splits a short phrase.
const withBreaks = (s) => esc(s).replace(/，/g, '，<br>');

async function shoot(browser, file, doc) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  try {
    await page.setContent(doc, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Shrink the main text until the middle block fits.
    await page.evaluate(() => {
      const main = document.getElementById('main');
      const mid = main.parentElement;
      let size = parseFloat(getComputedStyle(main).fontSize);
      while (mid.scrollHeight > mid.clientHeight + 1 && size > 36) {
        size -= 2;
        main.style.fontSize = `${size}px`;
      }
    });
    await page.screenshot({ path: file });
  } finally {
    await page.close();
  }
}

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ channel: 'chrome' });
  let made = 0;
  const jobs = [
    [
      'default',
      html({ main: 'wit, et cetera.', mainClass: 'latin', sub: TAGLINE }),
    ],
    ...readPosts().map((p) => [
      p.slug,
      html({
        label: labels[p.tag] ?? '',
        date: p.date ? p.date.replace(/-/g, '.') : '',
        main: withBreaks(p.summary ?? p.title),
      }),
    ]),
  ];
  for (const [name, doc] of jobs) {
    try {
      await shoot(browser, join(OUT, `${name}.png`), doc);
      made += 1;
    } catch (err) {
      console.warn(`og: ${name} failed (${err.message}); pages fall back to the default card`);
    }
  }
  await browser.close();
  console.log(`og: ${made}/${jobs.length} cards written to public/og/`);
}

main().catch((err) => {
  console.warn(`og: skipped (${err.message}); pages fall back to the default card or no og:image`);
});
