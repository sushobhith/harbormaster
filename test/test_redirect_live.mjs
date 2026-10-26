// LIVE-ONLY (TP-30, D-011): hits the real hosts; not in `npm test` or CI. Run manually after deploy.
import { chromium } from 'playwright';

function check(cond, msg) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`);
  if (!cond) process.exitCode = 1;
}

const NEW = 'https://harbormaster.fyi';

// Hash survives the 308 and the board draws on the new host.
{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let drawn = false;
  try {
    await page.goto('https://harbormaster.vercel.app/#s=abc&p=4');
    await page.waitForSelector('#board polygon', { timeout: 15000 });
    drawn = true;
  } catch (e) {
    console.log(`  (navigation/board error: ${e.message.split('\n')[0]})`);
  }
  check(drawn, 'TP-30 board drawn after following old-host link');
  check(page.url() === `${NEW}/#s=abc&p=4`, `TP-30 old-host link lands on ${NEW}/#s=abc&p=4 (${page.url()})`);
  await browser.close();
}

// Raw redirects: status 308, path and query intact.
for (const [from, to] of [
  ['https://fairhex.vercel.app/', `${NEW}/`],
  ['https://harbormaster.vercel.app/og-image.png?x=1', `${NEW}/og-image.png?x=1`],
]) {
  let status = null, location = null;
  try {
    const r = await fetch(from, { redirect: 'manual' });
    status = r.status;
    location = r.headers.get('location');
  } catch (e) {
    console.log(`  (fetch error for ${from}: ${e.message})`);
  }
  check(status === 308, `TP-30 ${from} → status 308 (${status})`);
  check(location === to, `TP-30 ${from} → Location ${to} (${location})`);
}

process.exit(process.exitCode || 0);
