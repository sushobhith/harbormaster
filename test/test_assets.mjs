// Step 3a asset checks (D-025, D-027, D-028): TP-39 self-hosted fonts, TP-40 link preview image.
// Usage: node test/test_assets.mjs "$PWD"
import { chromium } from 'playwright';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { PNG } from 'pngjs';
const dir = process.argv[2];
const browser = await chromium.launch();

function check(cond, msg) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`);
  if (!cond) process.exitCode = 1;
}

const GOOGLE = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const FAMILIES = ['Manrope', 'Instrument Serif'];

// TP-39 (D-025): no request to Google Fonts; @font-face for both families points at files under fonts/
// that exist on disk and load in document.fonts.
{
  const src = readFileSync(`${dir}/index.html`, 'utf8');
  for (const g of GOOGLE) check(!src.includes(g), `TP-39 index.html source does not mention ${g}`);

  const page = await browser.newPage();
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  // index.html says url(/fonts/x) (root-relative, right for the deployed site). Opened from file://
  // that resolves to file:///fonts/x, which is not the repo, so serve /fonts/* from <repo>/fonts/
  // here; the route is registered before navigation so the very first font request is caught.
  await page.route(u => u.protocol === 'file:' && u.pathname.startsWith('/fonts/'), route => {
    const p = `${dir}${new URL(route.request().url()).pathname}`;
    return existsSync(p) ? route.fulfill({ path: p, contentType: 'font/woff2' }) : route.fulfill({ status: 404, body: '' });
  });
  await page.goto(`file://${dir}/index.html`);
  await page.waitForFunction(() => document.querySelectorAll('#board polygon').length > 0);
  await page.evaluate(() => document.fonts.ready);

  const bad = requests.filter(u => { try { return GOOGLE.includes(new URL(u).hostname); } catch { return false; } });
  check(bad.length === 0, `TP-39 no request to ${GOOGLE.join(' or ')} during load (${requests.length} requests${bad.length ? `; offending: ${bad.join(', ')}` : ''})`);

  const rules = await page.evaluate(() => [...document.styleSheets]
    .flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
    .filter(r => r instanceof CSSFontFaceRule)
    .map(r => ({
      family: r.style.getPropertyValue('font-family').replace(/["']/g, '').trim(),
      urls: [...r.style.getPropertyValue('src').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)]
        .map(m => new URL(m[1], document.baseURI).href),
    })));
  check(rules.length >= 2, `TP-39 at least two @font-face rules (${rules.length})`);

  for (const fam of FAMILIES) {
    const mine = rules.filter(r => r.family === fam);
    check(mine.length > 0, `TP-39 @font-face rule for ${fam} (${mine.length})`);
    for (const r of mine) for (const href of r.urls) {
      // Accept /fonts/x (root-relative) or <repo>/fonts/x (document-relative); map either to <repo>/fonts/x.
      const path = new URL(href).pathname;
      const rel = path.startsWith(`${dir}/fonts/`) ? path.slice(dir.length) : path;
      const disk = `${dir}${rel}`;
      check(rel.startsWith('/fonts/') && existsSync(disk), `TP-39 ${fam} src ${href} maps to an existing file under fonts/ (${disk})`);
    }
    // document.fonts.check() is also true when NO face matches the family, so the loaded status of a
    // real FontFace for the family is asserted too; that half is what fails without @font-face.
    const st = await page.evaluate(async f => {
      let error = null;
      try { await document.fonts.load(`16px "${f}"`); } catch (e) { error = String(e); } // rejects if the file 404s
      return {
        error,
        check: document.fonts.check(`16px "${f}"`),
        statuses: [...document.fonts].filter(x => x.family.replace(/["']/g, '') === f).map(x => x.status),
      };
    }, fam);
    check(st.statuses.includes('loaded'), `TP-39 ${fam} FontFace reports loaded in document.fonts (${JSON.stringify(st.statuses)}${st.error ? `; load: ${st.error}` : ''})`);
    check(st.check === true, `TP-39 document.fonts.check('16px "${fam}"') is true after load`);
  }
  await page.close();
}

// TP-40 (D-027): og-image.png is exactly 1200x630; outside CI it is not older than docs/og-card.html.
{
  const og = `${dir}/og-image.png`;
  let w = null, h = null;
  try { ({ width: w, height: h } = PNG.sync.read(readFileSync(og))); } catch (e) { console.log(`     pngjs: ${e.message}`); }
  check(w === 1200 && h === 630, `TP-40 og-image.png parses and is 1200x630 (${w}x${h})`);
  if (process.env.CI) {
    console.log('SKIP TP-40 mtime half: CI is set and git checkout does not preserve mtimes (D-028)');
  } else {
    const pm = statSync(og).mtimeMs, cm = statSync(`${dir}/docs/og-card.html`).mtimeMs;
    check(pm >= cm, `TP-40 og-image.png mtime ${new Date(pm).toISOString()} >= docs/og-card.html mtime ${new Date(cm).toISOString()} (re-run scripts/render-og.mjs if not)`);
  }
}

await browser.close();
