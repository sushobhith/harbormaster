// Re-render the link preview (D-027): board in Day -> docs/assets/board-day.png, then the card -> og-image.png.
// Usage, from the repo root: node scripts/render-og.mjs "$PWD"
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const dir = process.argv[2] || process.cwd();
const boardOut = `${dir}/docs/assets/board-day.png`;
const cardOut = `${dir}/og-image.png`;
const browser = await chromium.launch();
try {
  // (a) the real page in Day, board only
  {
    const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1300, height: 950 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`file://${dir}/index.html#s=gamenite&p=6`);
    await page.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
    await page.waitForTimeout(500);
    await page.locator('#board').screenshot({ path: boardOut });
    await ctx.close();
  }
  // (b) the card at 1200x630, after its fonts and the board image are in
  {
    const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`file://${dir}/docs/og-card.html`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    await page.screenshot({ path: cardOut });
    await ctx.close();
  }
} finally {
  await browser.close();
}
// (c) report
for (const p of [boardOut, cardOut]) {
  const { width, height } = PNG.sync.read(readFileSync(p));
  console.log(`${p} ${width}x${height}`);
}
