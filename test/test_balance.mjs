import { chromium } from 'playwright';

const dir = process.argv[2];
const SEEDS_N = +(process.argv[3] || 150);
const PIPS = { 2:1, 3:2, 4:3, 5:4, 6:5, 8:5, 9:4, 10:3, 11:2, 12:1 };

function analyze(data) {
  // --- invariants ---
  let red = 0, twin = 0, adj212 = 0, sameres = 0;
  for (const h of data.hexes) for (const j of h.adj) {
    if (j <= h.id) continue;
    const g = data.hexes[j];
    if (h.res === g.res) sameres++;
    if (h.num && g.num) {
      if ([6, 8].includes(h.num) && [6, 8].includes(g.num)) red++;
      if (h.num === g.num) twin++;
      if ((h.num === 2 && g.num === 12) || (h.num === 12 && g.num === 2)) adj212++;
    }
  }
  const set = data.pairs.flat().map(s => s.vid);
  const sset = new Set(set);
  let distViol = 0;
  for (const vid of set) for (const nb of data.verts[vid].adj) if (sset.has(nb)) distViol++;
  let portViol = 0;
  for (const p of data.ports) {
    if (p.type === 'any') continue;
    const hs = new Set([...data.verts[p.a].hexes, ...data.verts[p.b].hexes]);
    for (const hid of hs) if (data.hexes[hid].res === p.type) portViol++;
  }
  // --- per-player metrics ---
  const hexPips = h => (h.res !== 'desert' && h.num) ? PIPS[h.num] : 0;
  const effs = data.pairs.map(pair => {
    let v = 0;
    for (const s of pair) v += s.pips;
    for (const s of pair) {
      if (!s.port) continue;
      if (s.port === 'any') { v += 1; continue; }
      let rp = 0;
      for (const t of pair) for (const hid of data.verts[t.vid].hexes) {
        const hx = data.hexes[hid];
        if (hx.res === s.port) rp += hexPips(hx);
      }
      v += 1.5 + (rp >= 4 ? 0.5 : 0);
    }
    return v;
  });
  const pipTotals = data.pairs.map(p => p[0].pips + p[1].pips);
  const redExp = data.pairs.map(pair => {
    let r = 0;
    for (const s of pair) for (const hid of data.verts[s.vid].hexes) {
      const hx = data.hexes[hid];
      if (hx.num === 6 || hx.num === 8) r += 5;
    }
    return r;
  });
  const cov = data.pairs.map(pair => {
    const st = new Set();
    for (const s of pair) for (const hid of data.verts[s.vid].hexes) {
      const hx = data.hexes[hid];
      if (hx.res !== 'desert' && hx.num) st.add(hx.res);
    }
    return st.size;
  });
  // per-resource pip skew (avg pips per tile, max-min)
  const tot = {}, cnt = {};
  for (const h of data.hexes) {
    if (h.res === 'desert' || !h.num) continue;
    tot[h.res] = (tot[h.res] || 0) + PIPS[h.num];
    cnt[h.res] = (cnt[h.res] || 0) + 1;
  }
  const avgs = Object.keys(tot).map(r => tot[r] / cnt[r]);
  const resDev = Math.max(...avgs) - Math.min(...avgs);
  // road targets: all should exist and be legal expansions
  const roads = data.pairs.flat().map(s => s.road);
  const roadMissing = roads.filter(r => !r || r.target == null).length;
  const targets = roads.filter(r => r && r.target != null).map(r => r.target);
  const dupTargets = targets.length - new Set(targets).size;
  const blocked = new Set(set);
  for (const vid of set) for (const nb of data.verts[vid].adj) blocked.add(nb);
  const illegalTargets = targets.filter(t => blocked.has(t)).length;

  // --- baseline: greedy snake draft on the same board ---
  const vinfo = data.verts.map((v, i) => {
    let p = 0; const rs = new Set();
    for (const hid of v.hexes) {
      const hx = data.hexes[hid];
      if (hx.res !== 'desert' && hx.num) { p += PIPS[hx.num]; rs.add(hx.res); }
    }
    return { vid: i, pips: p, res: rs };
  });
  const N = data.pairs.length;
  const snake = [...Array(N).keys()].concat([...Array(N).keys()].reverse());
  const bl = new Set(); const own = Array.from({ length: N }, () => []);
  for (const pl of snake) {
    let best = null;
    for (const v of vinfo) {
      if (bl.has(v.vid)) continue;
      const nd = new Set([...own[pl].flatMap(s => [...s.res]), ...v.res]).size;
      const sc = v.pips + 0.7 * nd;
      if (!best || sc > best.sc) best = { v, sc };
    }
    own[pl].push(best.v); bl.add(best.v.vid);
    for (const nb of data.verts[best.v.vid].adj) bl.add(nb);
  }
  const basePips = own.map(ss => ss[0].pips + ss[1].pips);

  const span = a => Math.max(...a) - Math.min(...a);
  return {
    inv: { red, twin, adj212, sameres, distViol, portViol, roadMissing, dupTargets, illegalTargets },
    effSpread: span(effs), pipSpread: span(pipTotals), redSpread: span(redExp),
    minCov: Math.min(...cov), resDev, baseSpread: span(basePips),
    avgPips: pipTotals.reduce((a, b) => a + b, 0) / N,
  };
}

const stats = a => {
  const s = a.slice().sort((x, y) => x - y);
  const q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return {
    mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2),
    p50: q(.5), p90: q(.9), max: s[s.length - 1],
    le1: Math.round(100 * a.filter(x => x <= 1).length / a.length),
    le2: Math.round(100 * a.filter(x => x <= 2).length / a.length),
  };
};

const browser = await chromium.launch();
const page = await browser.newPage();
let pageErrors = 0;
page.on('pageerror', e => { pageErrors++; console.log('PAGEERROR:', e.message); });
await page.goto(`file://${dir}/index.html#s=warmup&p=4`);
await page.waitForTimeout(500);

for (const p of [3, 4, 5, 6]) {
  const runs = []; let ms = 0;
  for (let i = 0; i < SEEDS_N; i++) {
    const t0 = Date.now();
    const data = await page.evaluate(([s, pl]) => window.__hm.run(s, pl), [`t${i}`, p]);
    ms += Date.now() - t0;
    runs.push(analyze(data));
  }
  // determinism check
  const a = await page.evaluate(([s, pl]) => window.__hm.run(s, pl), ['t0', p]);
  const b = await page.evaluate(([s, pl]) => window.__hm.run(s, pl), ['t0', p]);
  const deterministic = JSON.stringify(a) === JSON.stringify(b);

  const invTotals = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.inv))
    invTotals[k] = (invTotals[k] || 0) + v;
  console.log(`\n===== ${p} PLAYERS (${SEEDS_N} seeds, avg ${(ms / SEEDS_N).toFixed(0)}ms/setup, deterministic=${deterministic}) =====`);
  console.log('invariant violations (sum over all seeds):', JSON.stringify(invTotals));
  console.log('start-value gap  (ours) :', JSON.stringify(stats(runs.map(r => r.effSpread))));
  console.log('raw pip gap      (ours) :', JSON.stringify(stats(runs.map(r => r.pipSpread))));
  console.log('pip gap (snake baseline):', JSON.stringify(stats(runs.map(r => r.baseSpread))));
  console.log('red 6/8 exposure gap    :', JSON.stringify(stats(runs.map(r => r.redSpread))));
  console.log('worst coverage: ' + JSON.stringify(stats(runs.map(r => r.minCov))) +
    '  | %players-min>=3: ' + Math.round(100 * runs.filter(r => r.minCov >= 3).length / runs.length) + '%');
  console.log('per-resource pip skew   :', JSON.stringify(stats(runs.map(r => +r.resDev.toFixed(2)))));
  console.log('avg pips/player:', (runs.reduce((a, r) => a + r.avgPips, 0) / runs.length).toFixed(1));
}
console.log(`\npage errors: ${pageErrors}`);
await browser.close();
