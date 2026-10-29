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
  allResPressed: document.getElementById('allRes').getAttribute('aria-pressed'),
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

// --- 5b. copy link round-trip: np=1 (fair / no-port mode) ---
await load('#s=nplink&p=4&np=1');
const origNp = await snap();
await page.click('#copy');
const linkNp = await page.evaluate(async () => {
  try { const t = await navigator.clipboard.readText(); if (t.includes('#s=')) return t; } catch (_) {}
  const b = document.getElementById('copy').textContent;
  return b.includes('#s=') ? b : location.href;
});
check('copy link np=1: contains np=1', linkNp.includes('np=1'), linkNp);
check('copy link np=1: does not contain m=board', !linkNp.includes('m=board'), linkNp);
const pageNp = await ctx.newPage();
await pageNp.goto(linkNp);
await pageNp.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
const boardNp = await pageNp.evaluate(() => document.getElementById('board').innerHTML);
const housesNp = await pageNp.evaluate(() => document.querySelectorAll('#board g path[d^="M -8 8"]').length);
check('copy link np=1: identical board on reopen', boardNp === origNp.board);
check('copy link np=1: same house count on reopen', housesNp === origNp.houses);
check('copy link np=1: noPorts button aria-pressed', await pageNp.evaluate(() =>
  document.getElementById('noPorts').getAttribute('aria-pressed') === 'true'));
await pageNp.close();

// --- 5c. copy link round-trip: m=board mode ---
await load('#s=boardlink&p=4&m=board');
const origBoard = await snap();
await page.click('#copy');
const linkBoard = await page.evaluate(async () => {
  try { const t = await navigator.clipboard.readText(); if (t.includes('#s=')) return t; } catch (_) {}
  const b = document.getElementById('copy').textContent;
  return b.includes('#s=') ? b : location.href;
});
check('copy link m=board: contains m=board', linkBoard.includes('m=board'), linkBoard);
check('copy link m=board: does not contain np=1', !linkBoard.includes('np=1'), linkBoard);
const pageBoard = await ctx.newPage();
await pageBoard.goto(linkBoard);
await pageBoard.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
const boardBoard = await pageBoard.evaluate(() => document.getElementById('board').innerHTML);
const housesBoard = await pageBoard.evaluate(() => document.querySelectorAll('#board g path[d^="M -8 8"]').length);
const pressedBoard = await pageBoard.evaluate(() =>
  [...document.querySelectorAll('.seg button[aria-pressed="true"]')].map(b => b.textContent.trim()));
check('copy link m=board: identical board on reopen', boardBoard === origBoard.board);
check('copy link m=board: zero houses on reopen', housesBoard === 0);
check('copy link m=board: Board only pressed on reopen', pressedBoard.includes('Board only'));
await pageBoard.close();

// --- 5d. copy link round-trip: plain link has neither np=1 nor m=board ---
await load('#s=cleanlink&p=4');
await page.click('#copy');
const linkClean = await page.evaluate(async () => {
  try { const t = await navigator.clipboard.readText(); if (t.includes('#s=')) return t; } catch (_) {}
  const b = document.getElementById('copy').textContent;
  return b.includes('#s=') ? b : location.href;
});
check('copy link plain: no np=1', !linkClean.includes('np=1'), linkClean);
check('copy link plain: no m=board', !linkClean.includes('m=board'), linkClean);

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

// --- 8b. all-5-resources toggle ---
await load('#s=a5test&p=4');
const before5 = await snap();
await page.click('#allRes');
s = await snap();
check('allRes: hash gains a5=1', s.hash.includes('a5=1'), s.hash);
check('allRes: board unchanged, placement re-dealt', hexSig(s.board) === hexSig(before5.board));
check('allRes: pill shown on the fair card', await page.evaluate(() =>
  /All 5 resources each|roads fill the gaps/.test(document.getElementById('fairCard').textContent)));
const cov = await page.evaluate(() => {
  const BASE = ['wood', 'brick', 'wheat', 'sheep', 'ore'];
  const out = [];
  for (const [seed, n, map] of [['a5test', 4, 'classic'], ['a5test', 6, 'classic'], ['a5test', 5, 'sea']]) {
    const d = window.__hm.run(seed, n, map, false, true);
    const vids = d.pairs.flat().map(sp => sp.vid);
    const legal = vids.every((v, i) => vids.every((w, j) =>
      i === j || (v !== w && !d.verts[v].adj.includes(w))));
    const resAt = v => d.verts[v].hexes.map(h => d.hexes[h])
      .filter(h => h.num != null).map(h => h.res);
    const per = d.pairs.map(pr => {
      const u = new Set(pr.flatMap(sp => resAt(sp.vid)));
      const viaRoad = new Set(pr.flatMap(sp =>
        sp.road && sp.road.target != null ? resAt(sp.road.target) : []));
      return { cov: BASE.filter(r => u.has(r)).length,
               withRoads: BASE.filter(r => u.has(r) || viaRoad.has(r)).length };
    });
    out.push({ min: Math.min(...per.map(x => x.cov)),
               minWithRoads: Math.min(...per.map(x => x.withRoads)), legal });
  }
  return out;
});
// contract: all five from the two settlements, or the road points at what's missing
check('allRes: every player reaches all 5 resources', cov.every(c => c.minWithRoads === 5),
  JSON.stringify(cov));
check('allRes: settlements alone cover 5 on most boards', cov.filter(c => c.min === 5).length >= 2,
  JSON.stringify(cov));
check('allRes: distance rule still respected', cov.every(c => c.legal));
await load('#s=a5test&p=4&a5=1');
check('allRes: hash restore presses button', await page.evaluate(() =>
  document.getElementById('allRes').getAttribute('aria-pressed') === 'true'));
await page.click('#mode button[data-mode="board"]');
check('allRes: hidden in board mode', await page.evaluate(() =>
  document.getElementById('allRes').style.display === 'none'));

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

// --- 11. browser history: New board pushes; other edits replace; Back/Forward restores exact state ---
await load('#s=historybase&p=4&a5=1');
const historyOriginal = await snap();
const historyStartLen = await page.evaluate(() => history.length);
let historyRedrawn = historyOriginal;
for (let i = 0; i < 12 && historyRedrawn.board === historyOriginal.board; i++) {
  await page.click('#reroll');
  historyRedrawn = await snap();
}
check('history: reroll changes the settlement draw', historyRedrawn.board !== historyOriginal.board);
check('history: reroll replaces current entry', await page.evaluate(() => history.length) === historyStartLen);

await page.click('#newBoard');
check('history: New board pushes one entry', await page.evaluate(() => history.length) === historyStartLen + 1);
await page.click('#players button[data-n="5"]');
await page.click('#map button[data-map="sea"]');
await page.click('#noPorts');
await page.click('#allRes');
await page.click('#mode button[data-mode="board"]');
const historyModified = await snap();
check('history: toggles replace the pushed entry', await page.evaluate(() => history.length) === historyStartLen + 1);

await page.goBack();
await page.waitForFunction(seed => document.getElementById('seedLabel').textContent === seed, historyRedrawn.seed);
check('history: Back restores exact previous board', (await snap()).board === historyRedrawn.board);
check('history: Back restores All 5 resources enabled', (await snap()).allResPressed === 'true');
check('history: Back restores previous hash and controls', JSON.stringify((await snap()).pressed) === JSON.stringify(historyRedrawn.pressed) && (await snap()).hash === historyRedrawn.hash);

await page.goForward();
await page.waitForFunction(seed => document.getElementById('seedLabel').textContent === seed, historyModified.seed);
const historyForward = await snap();
check('history: Forward restores exact modified board', historyForward.board === historyModified.board);
check('history: Forward resets All 5 resources when absent from hash', historyForward.allResPressed === 'false');
check('history: Forward restores defaults/options exactly', JSON.stringify(historyForward.pressed) === JSON.stringify(historyModified.pressed) && historyForward.hash === historyModified.hash);

await page.goBack();
await page.waitForFunction(seed => document.getElementById('seedLabel').textContent === seed, historyRedrawn.seed);
await page.reload();
await page.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
check('history: reload preserves the restored reroll', (await snap()).board === historyRedrawn.board);
check('history: reload preserves All 5 resources enabled', (await snap()).allResPressed === 'true');

await page.click('#newBoard');
const historyBranch = await snap();
await page.goForward();
check('history: creating a new board after Back discards forward history', (await snap()).board === historyBranch.board);

// --- 12. Today's board (TP-41..44, D-031) ---
// The clock is frozen on every page this section opens, so today's seed is a literal.
const FROZEN = new Date('2026-10-27T12:00:00Z');
const TODAY = 'today-2026-10-27';
const hasBoard = () => document.querySelectorAll('#board polygon').length > 0;
const tapToday = async p => {
  if (!(await p.$('#today'))) return false;
  await p.click('#today');
  await p.waitForFunction(() => document.getElementById('seedLabel').textContent.startsWith('today-'), null, { timeout: 5000 }).catch(() => {});
  return true;
};
const todayState = p => p.evaluate(() => {
  const t = document.getElementById('today');
  return {
    hash: location.hash,
    seed: document.getElementById('seedLabel').textContent,
    board: document.getElementById('board').innerHTML,
    pressed: t ? t.getAttribute('aria-pressed') : null,
  };
});
const openPage = async (hash, date = FROZEN) => {
  const p = await ctx.newPage();
  p.on('pageerror', e => check('no page errors (today)', false, String(e)));
  if (date) await p.clock.setFixedTime(date);
  await p.goto(`file://${dir}/index.html${hash}`);
  await p.waitForFunction(hasBoard);
  return p;
};
const readCopied = p => p.evaluate(async () => {
  try { const t = await navigator.clipboard.readText(); if (t.includes('#s=')) return t; } catch (_) {}
  const b = document.getElementById('copy').textContent;
  return b.includes('#s=') ? b : location.href;
});

// TP-41: the button, its place, the seed it sets, and aria-pressed derived from the seed
await page.clock.setFixedTime(FROZEN);
await load('#s=abc&p=4');
const todayBtn = await page.evaluate(() => {
  const t = document.getElementById('today');
  return {
    exists: !!t,
    isBtn: !!t && t.classList.contains('btn'),
    text: t ? t.textContent.trim() : null,
    order: [...document.querySelector('.row-sec').children].map(c => c.id),
  };
});
check('TP-41 #today exists', todayBtn.exists);
check('TP-41 #today has class btn', todayBtn.isBtn);
check("TP-41 #today label is Today's board", todayBtn.text === "Today's board", `got ${todayBtn.text}`);
check('TP-41 .row-sec order reroll,today,copy,saveImg,print', JSON.stringify(todayBtn.order) === JSON.stringify(['reroll', 'today', 'copy', 'saveImg', 'print']), JSON.stringify(todayBtn.order));
await tapToday(page);
let td = await todayState(page);
check('TP-41 click sets hash', td.hash === `#s=${TODAY}&p=4`, td.hash);
check('TP-41 click sets seed label', td.seed === TODAY, td.seed);
check('TP-41 aria-pressed true after click', td.pressed === 'true', String(td.pressed));
await page.click('#newBoard');
td = await todayState(page);
check('TP-41 aria-pressed false after New board', td.pressed === 'false', String(td.pressed));
check('TP-41 New board leaves today seed', td.seed !== TODAY, td.seed);
await page.goBack();
await page.waitForFunction(seed => document.getElementById('seedLabel').textContent === seed, TODAY, { timeout: 5000 }).catch(() => {});
td = await todayState(page);
check('TP-41 aria-pressed true again after Back', td.pressed === 'true' && td.seed === TODAY, `${td.pressed} ${td.seed}`);
await load('#s=abc&p=4&m=board');
const todayBoardMode = await page.evaluate(() => {
  const t = document.getElementById('today');
  return {
    visible: !!t && getComputedStyle(t).display !== 'none',
    tracks: getComputedStyle(document.querySelector('.row-sec')).gridTemplateColumns.trim().split(/\s+/).length,
  };
});
check('TP-41 #today visible in Board only', todayBoardMode.visible);
check('TP-41 .row-sec has two columns in Board only', todayBoardMode.tracks === 2, `got ${todayBoardMode.tracks}`);

// TP-42: same date + players + map => same board on two fresh pages; other players/map differ
const openToday = async (hash, date = FROZEN) => {
  const p = await openPage(hash, date);
  await tapToday(p);
  return { p, ...(await todayState(p)) };
};
const t4a = await openToday('#s=x&p=4');
const t4b = await openToday('#s=x&p=4');
check('TP-42 both pages on today seed', t4a.seed === TODAY && t4b.seed === TODAY, `${t4a.seed} ${t4b.seed}`);
check('TP-42 two pages, 4p classic: identical board', t4a.board === t4b.board);
const t6a = await openToday('#s=x&p=6');
const t6b = await openToday('#s=x&p=6');
check('TP-42 6p differs from 4p', t6a.board !== t4a.board);
check('TP-42 two pages, 6p: identical board', t6a.seed === TODAY && t6a.board === t6b.board);
const tsa = await openToday('#s=x&p=4&map=sea');
const tsb = await openToday('#s=x&p=4&map=sea');
check('TP-42 sea 4p differs from classic 4p', tsa.board !== t4a.board);
check('TP-42 two pages, sea 4p: identical board', tsa.seed === TODAY && tsa.board === tsb.board);
for (const x of [t4b, t6a, t6b, tsa, tsb]) await x.p.close();

// TP-44: Copy link on today's board reopens it; an old link still draws, not pressed
await t4a.p.click('#copy');
const todayLink = await readCopied(t4a.p);
check('TP-44 link carries today seed and players', todayLink.includes(`s=${TODAY}`) && todayLink.includes('p=4'), todayLink);
const reopened = await openPage(todayLink.includes('#s=') ? todayLink.slice(todayLink.indexOf('#')) : '#s=none&p=4');
const reopenedState = await todayState(reopened);
check('TP-44 reopened link: identical board', reopenedState.board === t4a.board);
check('TP-44 reopened link: #today pressed', reopenedState.pressed === 'true', String(reopenedState.pressed));
await reopened.close();
const oldLink = await openPage('#s=abc&p=4');
const oldState = await todayState(oldLink);
check('TP-44 old link: board drawn', await oldLink.evaluate(hasBoard));
check('TP-44 old link: #today not pressed', oldState.pressed === 'false', String(oldState.pressed));
check('TP-44 old link: seed label abc', oldState.seed === 'abc', oldState.seed);
await oldLink.close();

// TP-28: saveImg button presence
await load('#s=savetest&p=4');
const saveImgInfo = await page.evaluate(() => {
  const b = document.getElementById('saveImg');
  return {
    exists: !!b,
    hasClass: !!b && b.classList.contains('btn'),
    text: b ? b.textContent.trim() : null,
    order: [...document.querySelector('.row-sec').children].map(c => c.id),
  };
});
check('TP-28 #saveImg exists with class btn and label Save image',
  saveImgInfo.exists && saveImgInfo.hasClass && saveImgInfo.text === 'Save image',
  `exists=${saveImgInfo.exists} hasClass=${saveImgInfo.hasClass} text=${saveImgInfo.text}`);
check('TP-28 .row-sec child order is reroll,today,copy,saveImg,print',
  JSON.stringify(saveImgInfo.order) === JSON.stringify(['reroll', 'today', 'copy', 'saveImg', 'print']),
  JSON.stringify(saveImgInfo.order));

// TP-28: PNG output via Web Share stub
await load('#s=savetest&p=4');
const pngShareResult = await page.evaluate(async () => {
  let capturedFiles = null;
  navigator.canShare = () => true;
  navigator.share = async ({ files }) => { capturedFiles = files; };
  const origFetch = window.fetch;
  window.fetch = async (url) => {
    if (String(url).includes('woff2')) return { ok: false };
    return origFetch(url);
  };
  document.getElementById('saveImg').click();
  await new Promise(res => {
    const iv = setInterval(() => {
      if (document.getElementById('saveImg').textContent === 'Save image') { clearInterval(iv); res(); }
    }, 50);
    setTimeout(() => { clearInterval(iv); res(); }, 12000);
  });
  window.fetch = origFetch;
  if (!capturedFiles || !capturedFiles[0]) return { ok: false, reason: 'no files captured' };
  const f = capturedFiles[0];
  const ab = await f.arrayBuffer();
  const bytes = new Uint8Array(ab);
  const isPng = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  return { ok: true, size: f.size, name: f.name, isPng };
});
check('TP-28 PNG file is non-empty with .png name and PNG magic bytes',
  pngShareResult.ok && pngShareResult.size > 0 &&
  (pngShareResult.name || '').endsWith('.png') && pngShareResult.isPng,
  JSON.stringify(pngShareResult));

// TP-28: PNG dimensions >= 2x SVG viewBox
await load('#s=savetest&p=4');
const pngDimResult = await page.evaluate(async () => {
  let capturedFiles = null;
  navigator.canShare = () => true;
  navigator.share = async ({ files }) => { capturedFiles = files; };
  const origFetch = window.fetch;
  window.fetch = async (url) => {
    if (String(url).includes('woff2')) return { ok: false };
    return origFetch(url);
  };
  const svg = document.getElementById('board');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  const svgW = vb[2], svgH = vb[3];
  document.getElementById('saveImg').click();
  await new Promise(res => {
    const iv = setInterval(() => {
      if (document.getElementById('saveImg').textContent === 'Save image') { clearInterval(iv); res(); }
    }, 50);
    setTimeout(() => { clearInterval(iv); res(); }, 12000);
  });
  window.fetch = origFetch;
  if (!capturedFiles || !capturedFiles[0]) return { ok: false, svgW, svgH, pngW: 0, pngH: 0 };
  const f = capturedFiles[0];
  const ab = await f.arrayBuffer();
  const dv = new DataView(ab);
  const pngW = dv.getUint32(16);
  const pngH = dv.getUint32(20);
  return { ok: true, pngW, pngH, svgW, svgH };
});
check('TP-28 PNG dimensions are at least 2x SVG viewBox width and height',
  pngDimResult.ok && pngDimResult.pngW >= pngDimResult.svgW * 2 && pngDimResult.pngH >= pngDimResult.svgH * 2,
  `pngW=${pngDimResult.pngW} svgW=${pngDimResult.svgW} pngH=${pngDimResult.pngH} svgH=${pngDimResult.svgH}`);

// TP-29: clicking #saveImg does not mutate live #board SVG innerHTML
await load('#s=immtest&p=4');
const immResult = await page.evaluate(async () => {
  navigator.canShare = () => true;
  navigator.share = async () => {};
  const origFetch = window.fetch;
  window.fetch = async (url) => {
    if (String(url).includes('woff2')) return { ok: false };
    return origFetch(url);
  };
  const observable = () => JSON.stringify({ hash: location.hash, seed: document.getElementById('seedLabel').textContent,
    mode: document.body.dataset.mode, map: document.body.dataset.map, cards: document.getElementById('playerCards').innerHTML,
    pressed: [...document.querySelectorAll('[aria-pressed="true"]')].map(b => b.id || b.textContent.trim()) });
  const liveRun = JSON.stringify(window.__hm.run('immtest', 4)); // regenerates the same seed; re-render is identical
  const liveBoard = document.getElementById('board').innerHTML;
  const liveState = observable();
  document.getElementById('saveImg').click();
  await new Promise(res => {
    const iv = setInterval(() => {
      if (document.getElementById('saveImg').textContent === 'Save image') { clearInterval(iv); res(); }
    }, 50);
    setTimeout(() => { clearInterval(iv); res(); }, 12000);
  });
  window.fetch = origFetch;
  const afterBoard = document.getElementById('board').innerHTML;
  const afterState = observable();
  const afterRun = JSON.stringify(window.__hm.run('immtest', 4));
  return { boardUnchanged: liveBoard === afterBoard, stateUnchanged: liveState === afterState, runUnchanged: liveRun === afterRun, hasState: true };
});
check('TP-29 live #board SVG innerHTML unchanged after saveImg', immResult.boardUnchanged);
check('TP-29 observable state unchanged after saveImg (hash, seed, mode, map, cards, pressed)', immResult.stateUnchanged);
check('TP-29 __hm.run(seed, players) identical before and after saveImg', immResult.runUnchanged);

// T4/T5: grid layout in fair and board mode
await load('#s=gridtest&p=4');
const gridFair = await page.evaluate(() => ({
  cols: getComputedStyle(document.querySelector('.row-sec')).gridTemplateColumns.trim().split(/\s+/).length,
  printSpan: getComputedStyle(document.getElementById('print')).gridColumn,
}));
check('T4 .row-sec has 2 columns in fair mode', gridFair.cols === 2, `got ${gridFair.cols}`);
check('T4 #print spans both columns in fair mode',
  /1\s*\/\s*-1|span 2/.test(gridFair.printSpan), `got gridColumn=${gridFair.printSpan}`);
await page.click('#mode button[data-mode="board"]');
const gridBoard = await page.evaluate(() => ({
  cols: getComputedStyle(document.querySelector('.row-sec')).gridTemplateColumns.trim().split(/\s+/).length,
  rerollHidden: document.getElementById('reroll').style.display === 'none',
  saveImgVisible: getComputedStyle(document.getElementById('saveImg')).display !== 'none',
  todayVisible: getComputedStyle(document.getElementById('today')).display !== 'none',
  copyVisible: getComputedStyle(document.getElementById('copy')).display !== 'none',
  printVisible: getComputedStyle(document.getElementById('print')).display !== 'none',
}));
check('T5 .row-sec has 2 columns in board mode (NOT 3)', gridBoard.cols === 2, `got ${gridBoard.cols}`);
check('T5 #reroll hidden in board mode', gridBoard.rerollHidden);
check('T5 #saveImg visible in board mode', gridBoard.saveImgVisible);
check('T5 #today visible in board mode', gridBoard.todayVisible);
check('T5 #copy visible in board mode', gridBoard.copyVisible);
check('T5 #print visible in board mode', gridBoard.printVisible);
const rowBoard = await page.evaluate(() => {
  const r = id => { const b = document.getElementById(id).getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }; };
  return { today: r('today'), copy: r('copy'), saveImg: r('saveImg'), print: r('print') };
});
check('T5 Board only is a 2x2: Save image and Print share a row',
  rowBoard.saveImg.y === rowBoard.print.y && rowBoard.print.x > rowBoard.saveImg.x,
  JSON.stringify(rowBoard));
check('T5 Board only is a 2x2: Print is one cell wide, not a full row',
  rowBoard.print.w === rowBoard.copy.w, JSON.stringify(rowBoard));

// TP-28: the PNG is in the current theme, and the file name carries seed, players and map
const exportPng = async () => page.evaluate(async () => {
  let files = null;
  navigator.canShare = () => true;
  navigator.share = async ({ files: f }) => { files = f; };
  document.getElementById('saveImg').click();
  await new Promise(res => {
    const iv = setInterval(() => {
      if (document.getElementById('saveImg').textContent === 'Save image') { clearInterval(iv); res(); }
    }, 50);
    setTimeout(() => { clearInterval(iv); res(); }, 12000);
  });
  if (!files || !files[0]) return { ok: false };
  const bmp = await createImageBitmap(files[0]);
  const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext('2d'); ctx.drawImage(bmp, 0, 0);
  const d = ctx.getImageData(2, 2, 1, 1).data;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  return { ok: true, name: files[0].name, corner: [d[0], d[1], d[2]], bg };
});
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 2);
for (const scheme of ['dark', 'light']) {
  await page.emulateMedia({ colorScheme: scheme });
  await load('#s=themetest&p=4');
  const r = await exportPng();
  check(`TP-28 ${scheme}: PNG corner pixel is the page --bg (${r.bg})`,
    r.ok && near(r.corner, hexToRgb(r.bg)), JSON.stringify(r));
  check(`TP-28 ${scheme}: file name is harbormaster-themetest-4p.png`, r.ok && r.name === 'harbormaster-themetest-4p.png', r.name);
}
await page.emulateMedia({ colorScheme: 'light' });
await load('#s=themetest&p=5&map=sea');
const seaName = await exportPng();
check('TP-28 Seafarers file name carries -sea: harbormaster-themetest-5p-sea.png', seaName.ok && seaName.name === 'harbormaster-themetest-5p-sea.png', seaName.name);

// TP-43: the seed, not the clock, drives the board
const unfrozen = await openPage(`#s=${TODAY}&p=4`, null);
const unfrozenBoard = await unfrozen.evaluate(() => document.getElementById('board').innerHTML);
check('TP-43 opening the today link without a frozen clock draws the clicked board', unfrozenBoard === t4a.board);
const runLink = await unfrozen.evaluate(s => JSON.stringify(window.__hm.run(s, 4)), TODAY);
const runClicked = await t4a.p.evaluate(() => JSON.stringify(window.__hm.run(document.getElementById('seedLabel').textContent, 4)));
check('TP-43 __hm.run(today seed) equals __hm.run(clicked seed)', runLink === runClicked);
await unfrozen.close();
await t4a.p.close();

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
