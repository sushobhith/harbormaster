// Golden regression: classic-mode output must stay byte-identical to the 2026-07-09
// pre-Seafarers baseline (protects shared links + photo-verified ports), then smoke-run
// each sea map. Usage: node test/test_golden.mjs <repoDir> [goldenJson]
import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

const dir = process.argv[2];
const golden = JSON.parse(readFileSync(process.argv[3] || `${dir}/test/golden_classic.json`, 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto(`file://${dir}/index.html`);
await page.waitForFunction(() => window.__hm && typeof window.__hm.run === 'function');

let fail = 0;
for (const [key, want] of Object.entries(golden)) {
  const [seed, p] = key.split('|');
  const data = await page.evaluate(([s, n]) => window.__hm.run(s, n), [seed, +p]);
  const got = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  if (got !== want) { console.log(`GOLDEN MISMATCH ${key}: ${got}`); fail++; }
}
console.log(fail ? `golden: ${fail} MISMATCHES` : `golden: all ${Object.keys(golden).length} classic outputs identical`);

for (const p of [3, 4, 5, 6]) {
  const d = await page.evaluate(([s, n]) => window.__hm.run(s, n, 'sea'), ['t0', p]);
  const land = d.hexes.filter(h => h.res !== 'sea');
  const main = d.hexes.filter(h => h.region === 'main');
  const isl = d.hexes.filter(h => h.region === 'island');
  const gold = d.hexes.filter(h => h.res === 'gold');
  const seaTok = d.hexes.filter(h => h.res === 'sea' && h.num != null).length;
  const badStart = d.pairs.flat().filter(s => {
    const regs = d.verts[s.vid].hexes.map(h => d.hexes[h].region);
    return !regs.includes('main') || regs.includes('island');
  }).length;
  console.log(`sea p=${p}: hexes=${d.hexes.length} main=${main.length} island=${isl.length} gold=${gold.length} ports=${d.ports.length} spread=${d.spread.toFixed(1)} seaTokens=${seaTok} badStarts=${badStart}`);
}
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(fail ? 1 : 0);
