import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const dir = process.argv[2];
const browser = await chromium.launch();

function check(cond, msg) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`);
  if (!cond) process.exitCode = 1;
}

// TP-31 (D-012): every absolute self-reference in <head> is on the canonical host.
const ORIGIN = 'https://harbormaster.fyi/';
{
  const page = await browser.newPage();
  await page.goto(`file://${dir}/index.html`);
  const h = await page.evaluate(() => {
    const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) ?? null;
    return {
      canonical: attr('link[rel=canonical]', 'href'),
      ogUrl: attr('meta[property="og:url"]', 'content'),
      ogImage: attr('meta[property="og:image"]', 'content'),
      twImage: attr('meta[name="twitter:image"]', 'content'),
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
      head: document.head.innerHTML,
    };
  });
  await page.close();
  for (const k of ['canonical', 'ogUrl', 'ogImage', 'twImage'])
    check(typeof h[k] === 'string' && h[k].startsWith(ORIGIN), `TP-31 ${k} starts with ${ORIGIN} (${h[k]})`);
  h.ld.forEach((txt, i) => {
    let obj = null;
    try { obj = JSON.parse(txt); } catch { /* reported below */ }
    check(obj !== null, `TP-31 JSON-LD block ${i} parses`);
    if (obj && 'url' in obj) check(String(obj.url).startsWith(ORIGIN), `TP-31 JSON-LD block ${i} url starts with ${ORIGIN} (${obj.url})`);
  });
  check(!h.head.includes('vercel.app'), 'TP-31 no "vercel.app" in <head>');
}

// TP-32 (D-012): sitemap + robots name the new host; lastmod in [2026-10-26, today UTC].
{
  const sitemap = readFileSync(`${dir}/sitemap.xml`, 'utf8');
  const robots = readFileSync(`${dir}/robots.txt`, 'utf8');
  const loc = sitemap.match(/<loc>([^<]*)<\/loc>/)?.[1];
  check(loc === ORIGIN, `TP-32 sitemap <loc> is ${ORIGIN} (${loc})`);
  const sm = robots.match(/^Sitemap:\s*(\S+)/m)?.[1];
  check(sm === `${ORIGIN}sitemap.xml`, `TP-32 robots Sitemap: is ${ORIGIN}sitemap.xml (${sm})`);
  const lastmod = sitemap.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1];
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(lastmod ?? '') && !isNaN(Date.parse(`${lastmod}T00:00:00Z`))
    && new Date(`${lastmod}T00:00:00Z`).toISOString().slice(0, 10) === lastmod;
  const today = new Date().toISOString().slice(0, 10);
  check(iso && lastmod >= '2026-10-26' && lastmod <= today, `TP-32 sitemap <lastmod> is an ISO date in [2026-10-26, ${today}] (${lastmod})`);
}

async function audit(page, label) {
  const r = await page.evaluate(() => {
    const svg = document.getElementById('board');
    const hexes = [...svg.querySelectorAll('polygon')].map(p => {
      const pts = p.getAttribute('points').split(' ').map(s => s.split(',').map(Number));
      const cx = pts.reduce((a, b) => a + b[0], 0) / pts.length;
      const cy = pts.reduce((a, b) => a + b[1], 0) / pts.length;
      return { cx, cy, fill: p.getAttribute('fill') };
    });
    // number tokens: text elements near hex centers (font-size 15)
    const nums = [...svg.querySelectorAll('text')].filter(t => t.getAttribute('font-size') === '15')
      .map(t => ({ x: +t.getAttribute('x'), y: +t.getAttribute('y') - 1, n: +t.textContent }));
    const hexNum = hexes.map(h => {
      const t = nums.find(n => Math.hypot(n.x - h.cx, n.y - h.cy) < 5);
      return t ? t.n : null;
    });
    const W = Math.sqrt(3) * 52;
    let redAdj = 0, sameResAdj = 0, twinAdj = 0;
    for (let i = 0; i < hexes.length; i++) for (let j = i + 1; j < hexes.length; j++) {
      if (Math.hypot(hexes[i].cx - hexes[j].cx, hexes[i].cy - hexes[j].cy) < W * 1.1) {
        const a = hexNum[i], b = hexNum[j];
        if ([6, 8].includes(a) && [6, 8].includes(b)) redAdj++;
        if (a && a === b) twinAdj++;
        // adjacent sea tiles are legal; everything else same-fill adjacent is a clump
        if (hexes[i].fill === hexes[j].fill && hexes[i].fill !== 'var(--seahex)') sameResAdj++;
      }
    }
    // settlements: g elements with the house path (not the pirate glyph)
    const houses = [...svg.querySelectorAll('g')].filter(g => g.querySelector('path[d^="M -8 8"]'))
      .map(g => {
        const m = g.getAttribute('transform').match(/translate\(([-\d.e+]+),([-\d.e+]+)\)/i);
        return { x: +m[1], y: +m[2], player: g.querySelector('text').textContent };
      });
    let minDist = 1e9;
    for (let i = 0; i < houses.length; i++) for (let j = i + 1; j < houses.length; j++)
      minDist = Math.min(minDist, Math.hypot(houses[i].x - houses[j].x, houses[i].y - houses[j].y));
    const perPlayer = {};
    houses.forEach(h => perPlayer[h.player] = (perPlayer[h.player] || 0) + 1);
    const fair = document.getElementById('fairCard').innerText.replace(/\n/g, ' ');
    const pips = [...document.querySelectorAll('.player .pips')].map(e => parseInt(e.textContent));
    return { hexCount: hexes.length, tokenCount: hexNum.filter(Boolean).length,
      redAdj, twinAdj, sameResAdj, houseCount: houses.length, perPlayer,
      minSettleDist: Math.round(minDist), fair, pips };
  });
  console.log(`\n== ${label} ==`);
  console.log(JSON.stringify(r, null, 1));
}

for (const [scheme, suffix] of [['light', 'light'], ['dark', 'dark']]) {
  const page = await browser.newPage({ viewport: { width: 1300, height: 950 }, colorScheme: scheme });
  await page.goto(`file://${dir}/index.html#s=gamenite&p=6`);
  await page.waitForTimeout(1200);
  await audit(page, `6 players ${scheme}`);
  await page.screenshot({ path: `${dir}/render-6p-${suffix}.png`, fullPage: true });
  if (scheme === 'light') {
    await page.click('#players button[data-n="4"]');
    await page.waitForTimeout(1200);
    await audit(page, '4 players light');
    await page.screenshot({ path: `${dir}/render-4p-light.png`, fullPage: true });
  }
  // Seafarers map
  await page.goto('about:blank');
  await page.goto(`file://${dir}/index.html#s=gamenite&p=4&map=sea`);
  await page.waitForTimeout(1200);
  await audit(page, `4 players seafarers ${scheme}`);
  await page.screenshot({ path: `${dir}/render-sea4-${suffix}.png`, fullPage: true });
  if (scheme === 'light') {
    await page.click('#players button[data-n="6"]');
    await page.waitForTimeout(1200);
    await audit(page, '6 players seafarers light');
    await page.screenshot({ path: `${dir}/render-sea6-light.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log('\nside length s=52 → adjacent-vertex distance is 52; distance rule OK if minSettleDist > 52');
process.exit(process.exitCode || 0);
