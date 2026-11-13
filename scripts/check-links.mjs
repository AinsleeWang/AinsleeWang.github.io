#!/usr/bin/env node
// scripts/check-links.mjs — static internal-link checker for dist/.
//
// Scans every dist/**/*.html for href="..."/src="..." attributes whose
// value starts with "/" and does not contain "//" (i.e. site-internal,
// not an external absolute URL or a protocol-relative one), then checks
// that dist/ actually has a file for each target:
//   "/x/"    -> dist/x/index.html
//   "/x.xml" -> dist/x.xml
//   "/x"     -> dist/x/index.html (generic fallback for any other case)
// "#fragment" and "?query" suffixes are stripped before checking — this
// script verifies the page/file exists, not that an in-page anchor does.
//
// Usage: node scripts/check-links.mjs [distDir]
// Exit 0 + "LINKS: PASS (N checked)", or exit 1 + "LINKS: FAIL (M broken)"
// with each broken link listed as "source page -> target" first.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

// Routes known to be absent from dist/ by design, so the checker skips them.
// Empty now that every linked page exists; anything missing is a real broken link.
const ALLOWLIST = new Set([]);

const distDir = process.argv[2] ?? join(process.cwd(), 'dist');

function listHtmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function extractInternalLinks(html) {
  const found = [];
  const re = /\b(?:href|src)\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1];
    if (raw.startsWith('/') && !raw.includes('//')) {
      found.push(raw);
    }
  }
  return found;
}

function resolveTarget(link) {
  // Strip fragment and query — this script checks the page/file exists,
  // not that a specific #anchor inside it does.
  const path = link.split('#')[0].split('?')[0];
  if (path === '') return '/';
  if (path.endsWith('/')) {
    return join(distDir, path, 'index.html');
  }
  if (extname(path) !== '') {
    return join(distDir, path);
  }
  return join(distDir, path, 'index.html');
}

if (!existsSync(distDir)) {
  console.error(`check-links: no such directory ${distDir}`);
  process.exit(1);
}

const htmlFiles = listHtmlFiles(distDir);
let checked = 0;
const broken = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const sourcePage = '/' + relative(distDir, file).split('\\').join('/');
  const links = extractInternalLinks(html);

  for (const link of links) {
    const normalized = link.split('#')[0].split('?')[0] || '/';
    if (ALLOWLIST.has(normalized)) continue;

    checked += 1;
    const target = resolveTarget(link);
    if (!existsSync(target)) {
      broken.push(`${sourcePage} -> ${link}`);
    }
  }
}

if (broken.length > 0) {
  for (const line of broken) console.log(line);
  console.log(`LINKS: FAIL (${broken.length} broken)`);
  process.exit(1);
} else {
  console.log(`LINKS: PASS (${checked} checked)`);
  process.exit(0);
}
