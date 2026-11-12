// Full-page screenshots at several widths; prints horizontal overflow per width.
// Usage: node scripts/shoot.mjs <url-or-file> <outPrefix> [widths=375,768,1280]
import { chromium } from 'playwright';
const [, , target, out, widthsArg = '375,768,1280'] = process.argv;
const url = /^https?:|^file:/.test(target) ? target : 'file://' + new URL(target, 'file://' + process.cwd() + '/').pathname;
const browser = await chromium.launch({ channel: 'chrome' });
for (const w of widthsArg.split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Scroll through the page once so lazy images load before the capture.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `${out}-${w}.png`, fullPage: true });
  console.log(`${w}px -> ${out}-${w}.png  horizontalOverflow=${overflow}px`);
  await page.close();
}
await browser.close();
