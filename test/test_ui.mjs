// UI interaction suite: exercises every toolbar control, hash round-trips, and
// map/mode/player combinations through the real DOM. Complements test_balance
// (generation invariants) and test_page (render audit).
// Usage: node test/test_ui.mjs <repoDir>
import { chromium } from 'playwright';

const dir = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => {
  if (ok) { pass++; } else { fail++; console.log(`FAIL: ${name} ${extra}`); }
};
page.on('pageerror', e => check('no page errors', false, String(e)));

const load = async (hash = '') => {
  await page.goto('about:blank');
  await page.goto(`file://${dir}/index.html${hash}`);
  await page.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
};
const snap = () => page.evaluate(() => ({
  hash: location.hash,
  seed: document.getElementById('seedLabel').textContent,
  board: document.getElementById('board').innerHTML,
  houses: document.querySelectorAll('#board g path[d^="M -8 8"]').length,
  hexes: document.querySelectorAll('#board polygon').length,
  pressed: [...document.querySelectorAll('.seg button[aria-pressed="true"]')].map(b => b.textContent.trim()),
  rerollVisible: document.getElementById('reroll').style.display !== 'none',
  methodVisible: document.getElementById('methodCard').style.display !== 'none',
  bodyMap: document.body.dataset.map,
  seaLegendVisible: getComputedStyle(document.querySelector('.legend .sea-only')).display !== 'none',
  pirate: [...document.querySelectorAll('#board text')].some(t => t.textContent === 'PIRATE'),
  robber: [...document.querySelectorAll('#board text')].some(t => t.textContent === 'ROBBER'),
  sparkles: [...document.querySelectorAll('#board text')].filter(t => t.textContent === '✦').length,
}));

// --- 1. defaults ---
await load();
let s = await snap();
check('default: 4p classic fair', s.pressed.includes('4') && s.pressed.includes('Classic') && s.pressed.includes('Fair settlements'));
check('default: 19 hexes, 8 houses', s.hexes === 19 && s.houses === 8);
check('default: no pirate, robber shown', !s.pirate && s.robber);
check('default: sea legend hidden', !s.seaLegendVisible);

// --- 2. every map × mode × players combination via clicks ---
for (const map of ['classic', 'sea']) {
  for (const mode of ['fair', 'board']) {
    for (const n of [3, 4, 5, 6]) {
      await page.click(`#map button[data-map="${map}"]`);
      await page.click(`#mode button[data-mode="${mode}"]`);
      await page.click(`#players button[data-n="${n}"]`);
      s = await snap();
      const label = `${map}/${mode}/${n}p`;
      const expHex = map === 'classic' ? (n >= 5 ? 30 : 19) : (n >= 5 ? 68 : n === 4 ? 44 : 37);
      check(`${label}: hex count ${expHex}`, s.hexes === expHex, `got ${s.hexes}`);
      check(`${label}: houses`, s.houses === (mode === 'fair' ? n * 2 : 0), `got ${s.houses}`);
      check(`${label}: reroll+method visibility`, s.rerollVisible === (mode === 'fair') && s.methodVisible === (mode === 'fair'));
      check(`${label}: body[data-map]`, s.bodyMap === map);
      check(`${label}: sea legend`, s.seaLegendVisible === (map === 'sea'));
      check(`${label}: hash`, s.hash.includes(`p=${n}`)
        && s.hash.includes('m=board') === (mode === 'board')
        && s.hash.includes('map=sea') === (map === 'sea'), s.hash);
      if (map === 'sea') {
        check(`${label}: pirate marker`, s.pirate === (n <= 4));
        check(`${label}: robber`, s.robber === (n !== 3)); // 3p New Shores has no desert
        check(`${label}: gold sparkles`, s.sparkles === (n >= 5 ? 6 : 4), `got ${s.sparkles}`); // 2 per gold hex
      }
    }
  }
}

// --- 3. reroll keeps board, redeals settlements ---
await load('#s=uitest&p=4');
const before = await snap();
await page.click('#reroll');
s = await snap();
const hexSig = h => h.match(/<polygon[^>]*>/g).join('');
check('reroll: same board tiles', hexSig(s.board) === hexSig(before.board));
check('reroll: same seed', s.seed === before.seed);

// --- 4. new board changes seed ---
await page.click('#newBoard');
s = await snap();
check('new board: seed changed', s.seed !== before.seed);

// --- 5. copy link round-trip reproduces the exact board ---
await load('#s=roundtrip&p=5&map=sea');
const orig = await snap();
await page.click('#copy');
// clipboard may be unavailable on file:// — the app then shows the link on the button
const link = await page.evaluate(async () => {
  try { const t = await navigator.clipboard.readText(); if (t.includes('#s=')) return t; } catch (_) {}
  const b = document.getElementById('copy').textContent;
  return b.includes('#s=') ? b : location.href;
});
check('copy link: contains seed+players+map', link.includes('s=roundtrip') && link.includes('p=5') && link.includes('map=sea'), link);
const page2 = await ctx.newPage();
await page2.goto(link);
await page2.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
const board2 = await page2.evaluate(() => document.getElementById('board').innerHTML);
check('copy link: identical board on reopen', board2 === orig.board);
await page2.close();

// --- 6. hash round-trip: board-only sea link restores all toggles ---
await load('#s=abc&p=6&m=board&map=sea');
s = await snap();
check('hash restore: toggles', s.pressed.includes('6') && s.pressed.includes('Seafarers') && s.pressed.includes('Board only'));
check('hash restore: no houses in board mode', s.houses === 0);

// --- 7. invalid hash values fall back to sane defaults ---
await load('#s=xyz&p=9&m=junk&map=junk');
s = await snap();
check('invalid hash: defaults (4p classic fair)', s.pressed.includes('4') && s.pressed.includes('Classic') && s.pressed.includes('Fair settlements'));

// --- 8. no-port-starts toggle ---
await load('#s=nptest&p=4');
const withPorts = await snap();
await page.click('#noPorts');
s = await snap();
check('noPorts: hash gains np=1', s.hash.includes('np=1'), s.hash);
check('noPorts: board unchanged, placement re-dealt', hexSig(s.board) === hexSig(withPorts.board));
const portFree = await page.evaluate(() => {
  // every house must sit on a vertex with no port piers attached: recompute via test hook
  const d = window.__hm.run('nptest', 4, 'classic', true);
  const portVids = new Set(d.ports.flatMap(p => [p.a, p.b]));
  return d.pairs.flat().every(sp => !portVids.has(sp.vid));
});
check('noPorts: no starting settlement touches a port', portFree);
const npSeaFree = await page.evaluate(() => {
  const d = window.__hm.run('nptest', 6, 'sea', true);
  const portVids = new Set(d.ports.flatMap(p => [p.a, p.b]));
  return d.pairs.flat().every(sp => !portVids.has(sp.vid));
});
check('noPorts: holds on 6p Seafarers too', npSeaFree);
await load('#s=nptest&p=4&np=1');
s = await snap();
check('noPorts: hash restore presses button', await page.evaluate(() =>
  document.getElementById('noPorts').getAttribute('aria-pressed') === 'true'));
await page.click('#mode button[data-mode="board"]');
check('noPorts: hidden in board mode', await page.evaluate(() =>
  document.getElementById('noPorts').style.display === 'none'));

// --- 9. board-only shows the snake-draft stat; print button + print CSS ---
await load('#s=abc&p=4&m=board');
check('board mode: snake-draft stat shown', await page.evaluate(() =>
  /snake draft.*±\d/s.test(document.getElementById('fairCard').textContent)));
check('print button exists', await page.evaluate(() => !!document.getElementById('print')));
await page.emulateMedia({ media: 'print' });
check('print: toolbar hidden', await page.evaluate(() =>
  getComputedStyle(document.querySelector('.toolbar')).display === 'none'));
check('print: footer hidden', await page.evaluate(() =>
  getComputedStyle(document.querySelector('footer')).display === 'none'));
await page.emulateMedia({ media: 'screen' });

// --- 10. mobile viewport: no horizontal overflow ---
const mob = await ctx.newPage();
await mob.setViewportSize({ width: 390, height: 844 });
await mob.goto(`file://${dir}/index.html#s=mobile&p=4&map=sea`);
await mob.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
const overflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('mobile 390px: no horizontal overflow', overflow <= 0, `overflow ${overflow}px`);
await mob.close();

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
