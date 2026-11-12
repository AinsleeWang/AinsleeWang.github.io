// Type rules from docs/EDITORIAL-SPEC.md section 8, checked in a real browser.
// Usage: node scripts/check-type.mjs <url> [<url> ...]
// Prints each violation (page, element, rule; at most 10 per rule) and exits
// 1 on any; the last line is `TYPE: PASS (N pages)` or `TYPE: FAIL (...)`.
import { chromium } from 'playwright';

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error('usage: node scripts/check-type.mjs <url> [<url> ...]');
  process.exit(2);
}

const WIDTHS = [1280, 375];
const LIMIT = 10;

// Runs in the page. Returns { rule: [element summary, ...] }.
function audit() {
  const CJK = /[㐀-䶿一-鿿豈-﫿]/;
  const out = {
    'cjk-italic': [],
    'mono-outside-code': [],
    uppercase: [],
    'body-mode': [],
    'weight-over-700': [],
    'times-font': [],
  };
  const sum = (el) => {
    const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `<${el.tagName.toLowerCase()}${cls}> "${text}"`;
  };

  if (document.body.getAttribute('data-mode') !== 'paper') {
    out['body-mode'].push(`<body data-mode="${document.body.getAttribute('data-mode')}">`);
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!CJK.test(n.nodeValue)) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    const style = getComputedStyle(el).fontStyle;
    if (style === 'italic' || style.startsWith('oblique')) out['cjk-italic'].push(`${sum(el)} font-style=${style}`);
  }

  const all = [document.documentElement, ...document.body.querySelectorAll('*')];
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (/^\s*"?JetBrains Mono/i.test(cs.fontFamily) && !el.closest('pre, code, kbd, .code-bar, .wt-code-bar')) {
      out['mono-outside-code'].push(`${sum(el)} font-family=${cs.fontFamily}`);
    }
    if (cs.textTransform === 'uppercase') out.uppercase.push(sum(el));
    if (Number(cs.fontWeight) > 700) out['weight-over-700'].push(`${sum(el)} font-weight=${cs.fontWeight}`);
    if (/\bTimes\b/i.test(cs.fontFamily)) out['times-font'].push(`${sum(el)} font-family=${cs.fontFamily}`);
  }
  return out;
}

const browser = await chromium.launch({ channel: 'chrome' });
const failures = {};
let violations = 0;
for (const url of urls) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(audit);
    await page.close();
    for (const [rule, items] of Object.entries(result)) {
      const key = `${rule}`;
      failures[key] ??= [];
      for (const item of items) failures[key].push(`${url} @${width}: ${item}`);
    }
  }
}
await browser.close();

const broken = [];
for (const [rule, items] of Object.entries(failures)) {
  if (items.length === 0) continue;
  violations += items.length;
  broken.push(rule);
  console.log(`[${rule}] ${items.length} violation(s)`);
  for (const item of items.slice(0, LIMIT)) console.log(`  ${item}`);
  if (items.length > LIMIT) console.log(`  ... ${items.length - LIMIT} more`);
}

if (violations === 0) {
  console.log(`TYPE: PASS (${urls.length} pages)`);
} else {
  console.log(`TYPE: FAIL (${broken.join(', ')})`);
  process.exit(1);
}
