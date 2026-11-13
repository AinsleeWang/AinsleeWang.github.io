#!/usr/bin/env node
// scripts/icons.mjs — renders public/favicon.svg onto the paper colour as
// public/apple-touch-icon.png (180x180). Run by hand when the favicon changes;
// the PNG is committed.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const paper = readFileSync(join(ROOT, 'src/styles/vendor/tokens.css'), 'utf8').match(/--paper:\s*([^;]+);/)[1].trim();
const svg = readFileSync(join(ROOT, 'public/favicon.svg'));
const uri = `data:image/svg+xml;base64,${svg.toString('base64')}`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
await page.setContent(
  `<body style="margin:0;width:180px;height:180px;background:${paper};display:flex;align-items:center;justify-content:center"><img src="${uri}" width="132" height="132"></body>`,
);
await page.screenshot({ path: join(ROOT, 'public/apple-touch-icon.png') });
await browser.close();
console.log('icons: public/apple-touch-icon.png written');
