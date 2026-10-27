// Step 3a "Tide" revamp checks: TP-35 (theme), TP-36 (ids + strings), TP-37 (390px layout),
// TP-38 (text contrast). Usage: node test/test_tide.mjs <repoDir>
import { chromium } from 'playwright';

const dir = process.argv[2];
const url = hash => `file://${dir}/index.html${hash}`;
const browser = await chromium.launch();

function check(cond, msg) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`);
  if (!cond) process.exitCode = 1;
}
const ready = page => page.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0, null, { timeout: 5000 }).catch(() => {});

const NIGHT = 'rgb(13, 19, 17)', DAY = 'rgb(242, 238, 229)';
const META = { [NIGHT]: '#0d1311', [DAY]: '#f2eee5' };
const LABEL = { [NIGHT]: 'Switch to day mode', [DAY]: 'Switch to night mode' };
const themeState = page => page.evaluate(() => ({
  bg: getComputedStyle(document.body).backgroundColor,
  meta: document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null,
  label: document.getElementById('theme')?.getAttribute('aria-label') ?? null,
  title: document.getElementById('theme')?.getAttribute('title') ?? null,
  stored: (() => { try { return localStorage.getItem('hm-theme'); } catch (_) { return 'ERR'; } })(),
}));
function themeChecks(s, want, label, screen = true) {
  check(s.bg === want, `TP-35 ${label}: body background ${want} (${s.bg})`);
  check(s.meta === META[want], `TP-35 ${label}: meta theme-color ${META[want]} (${s.meta})`);
  if (screen) check(s.label === LABEL[want] && s.title === LABEL[want],
    `TP-35 ${label}: #theme aria-label/title "${LABEL[want]}" (${s.label} / ${s.title})`);
}

// ---------- TP-35: theme follows the system, toggle overrides and persists, print is Day ----------
{
  for (const [scheme, want] of [['dark', NIGHT], ['light', DAY]]) {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto(url('#s=gamenite&p=4')); await ready(page);
    themeChecks(await themeState(page), want, `system ${scheme}`);
    await ctx.close();
  }
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto(url('#s=gamenite&p=4')); await ready(page);
  const hasToggle = await page.$('#theme');
  if (hasToggle) await page.click('#theme');
  let s = await themeState(page);
  themeChecks(s, DAY, 'dark system after #theme click');
  check(s.stored === 'light', `TP-35 localStorage["hm-theme"] is "light" after click (${s.stored})`);
  await page.reload(); await ready(page);
  themeChecks(await themeState(page), DAY, 'after reload');
  if (hasToggle) await page.click('#theme');
  s = await themeState(page);
  themeChecks(s, NIGHT, 'second click back to night');
  check(s.stored === 'dark', `TP-35 localStorage["hm-theme"] is "dark" after second click (${s.stored})`);
  await ctx.close();

  const pctx = await browser.newContext({ colorScheme: 'dark' });
  const pp = await pctx.newPage();
  await pp.goto(url('#s=gamenite&p=4')); await ready(pp);
  await pp.emulateMedia({ media: 'print' });
  await pp.waitForTimeout(250); // let matchMedia('print') change listeners run
  themeChecks(await themeState(pp), DAY, 'print in a dark context', false);
  check(await pp.evaluate(() => ['theme', 'methodCard'].every(id => {
    const e = document.getElementById(id); return e && getComputedStyle(e).display === 'none';
  })), 'TP-35 print hides #theme and #methodCard');
  await pctx.close();
}

// ---------- TP-36: D-024 ids and strings ----------
{
  const page = await browser.newPage();
  await page.goto(url('#s=gamenite&p=4')); await ready(page);
  const r = await page.evaluate(() => {
    const ids = ['newBoard', 'reroll', 'noPorts', 'allRes', 'copy', 'print', 'map', 'players', 'mode',
      'seedLabel', 'board', 'fairCard', 'playerCards', 'methodCard', 'theme', 'options'];
    const tag = id => document.getElementById(id)?.tagName.toLowerCase() ?? null;
    const texts = id => [...document.querySelectorAll(`#${id} button`)].map(b => b.textContent.trim()).join(',');
    const txt = id => document.getElementById(id)?.textContent.trim() ?? null;
    return {
      tags: Object.fromEntries(ids.map(id => [id, tag(id)])),
      map: texts('map'), players: texts('players'), mode: texts('mode'),
      seg: ['map', 'players', 'mode'].every(id => document.getElementById(id)?.classList.contains('seg')),
      reroll: txt('reroll'), copy: txt('copy'), newBoard: txt('newBoard'),
      fold: document.getElementById('methodCard')?.matches('details.fold') ?? false,
      summary: document.querySelector('#methodCard > summary')?.textContent.trim() ?? null,
      optionsLbl: document.querySelector('#options .lbl')?.textContent.trim() ?? null,
      tagline: document.querySelector('header p')?.textContent.trim() ?? null,
    };
  });
  const wantTags = { newBoard: 'button', reroll: 'button', noPorts: 'button', allRes: 'button', copy: 'button',
    print: 'button', theme: 'button', board: 'svg' };
  for (const [id, t] of Object.entries(r.tags))
    check(t !== null && (!wantTags[id] || wantTags[id] === t), `TP-36 #${id} exists${wantTags[id] ? ` as <${wantTags[id]}>` : ''} (${t})`);
  check(r.seg, 'TP-36 #map, #players, #mode are .seg groups');
  check(r.map === 'Classic,Seafarers', `TP-36 #map buttons "Classic,Seafarers" (${r.map})`);
  check(r.players === '3,4,5,6', `TP-36 #players buttons "3,4,5,6" (${r.players})`);
  check(r.mode === 'Fair settlements,Board only', `TP-36 #mode buttons "Fair settlements,Board only" (${r.mode})`);
  check(r.reroll === 'Re-draw spots', `TP-36 #reroll text "Re-draw spots" (${r.reroll})`);
  check(r.copy === 'Copy link', `TP-36 #copy text "Copy link" (${r.copy})`);
  check(r.newBoard === 'New board', `TP-36 #newBoard text "New board" (${r.newBoard})`);
  check(r.fold && r.summary === 'Cheat sheet', `TP-36 #methodCard is details.fold with summary "Cheat sheet" (${r.summary})`);
  check(r.optionsLbl === 'Options', `TP-36 options row label "Options" (${r.optionsLbl})`);
  check(r.tagline === 'Fair setup for Catan', `TP-36 tagline "Fair setup for Catan" (${r.tagline})`);
  await page.close();
}

// ---------- TP-37: 390x844, board first and large, no horizontal scroll ----------
for (const p of [4, 6]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url(`#s=gamenite&p=${p}`)); await ready(page);
  const r = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const b = document.getElementById('board').getBoundingClientRect();
    return { w: b.width, bottom: b.bottom, sw: document.documentElement.scrollWidth };
  });
  check(r.w >= 340, `TP-37 ${p}p: #board width >= 340 (${r.w.toFixed(1)})`);
  check(r.bottom <= 844, `TP-37 ${p}p: #board bottom <= 844 at scrollY 0 (${r.bottom.toFixed(1)})`);
  check(r.sw <= 390, `TP-37 ${p}p: scrollWidth <= 390 (${r.sw})`);
  await page.close();
}

// ---------- TP-38: WCAG contrast in both schemes ----------
for (const scheme of ['dark', 'light']) {
  const page = await browser.newPage({ colorScheme: scheme, viewport: { width: 390, height: 844 } });
  await page.goto(url('#s=gamenite&p=4')); await ready(page);
  const rows = await page.evaluate(() => {
    const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
      const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { rgb: v.slice(0, 3), a: v.length > 3 ? v[3] : 1 }; };
    const lum = ([r, g, b]) => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const ground = el => { for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) return c.rgb; } return [255, 255, 255]; };
    const out = [];
    const add = (name, el) => {
      if (!el) { out.push({ name, missing: true }); return; }
      const cs = getComputedStyle(el);
      out.push({ name, ratio: ratio(parse(cs.color).rgb, ground(el)), size: parseFloat(cs.fontSize), weight: +cs.fontWeight || 400 });
    };
    add('.covers text', document.querySelector('.covers'));
    add('.lbl', document.querySelector('.lbl'));
    add('tagline', document.querySelector('header p'));
    add('#newBoard', document.getElementById('newBoard'));
    add('#reroll', document.getElementById('reroll'));
    add('fairness line', document.querySelector('#fairCard .fl') || document.getElementById('fairCard'));
    add('.player .head b', document.querySelector('.player .head b'));
    add('#seedLabel', document.getElementById('seedLabel'));
    add('legend 6/8 pill', document.querySelector('.legend .tokpill'));
    add('pressed segment', document.querySelector('.seg button[aria-pressed="true"]'));
    const nums = [...document.querySelectorAll('#board text')].filter(t => t.getAttribute('font-size') === '15');
    for (const [name, t] of [['token number (plain)', nums.find(t => !['6', '8'].includes(t.textContent))],
                              ['token number (6/8)', nums.find(t => ['6', '8'].includes(t.textContent))]]) {
      if (!t) { out.push({ name, missing: true }); continue; }
      const circle = t.previousElementSibling;
      const cs = getComputedStyle(t);
      out.push({ name, ratio: ratio(parse(cs.fill).rgb, parse(getComputedStyle(circle).fill).rgb),
        size: parseFloat(cs.fontSize), weight: +cs.fontWeight || 400 });
    }
    return out;
  });
  for (const r of rows) {
    if (r.missing) { check(false, `TP-38 ${scheme}: ${r.name} present`); continue; }
    const large = r.size >= 24 || (r.size >= 18.66 && r.weight >= 700);
    const need = large ? 3.0 : 4.5;
    check(r.ratio >= need, `TP-38 ${scheme}: ${r.name} contrast ${r.ratio.toFixed(2)} >= ${need} (${large ? 'large-text rule' : 'normal-text rule'}, ${r.size}px/${r.weight})`);
  }
  await page.close();
}

await browser.close();
process.exit(process.exitCode || 0);
