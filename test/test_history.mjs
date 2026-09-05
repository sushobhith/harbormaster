import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const browser=await chromium.launch(process.env.TEST_BROWSER_CHANNEL?{channel:process.env.TEST_BROWSER_CHANNEL}:{});
try {
  const page=await browser.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const url=process.env.TEST_URL||pathToFileURL(path.resolve('index.html')).href;
  const snapshot=()=>page.evaluate(()=>({hash:location.hash,board:document.querySelector('#board').innerHTML,
    controls:[...document.querySelectorAll('[aria-pressed]')].map(e=>e.getAttribute('aria-pressed'))}));
  const length=()=>page.evaluate(()=>history.length);
  await page.goto(url+'#s=proof&p=4');
  const original=await snapshot(),initialLength=await length();
  let redrawn=original;
  for(let i=0;i<12&&redrawn.board===original.board;i++){
    await page.click('#reroll'); redrawn=await snapshot();
  }
  assert.ok(redrawn.board!==original.board,'Re-draw should produce a changed setup for this fixture');
  assert.equal(await length(),initialLength);
  await page.click('#newBoard');
  assert.equal(await length(),initialLength+1);
  await page.click('#players button[data-n="5"]');
  await page.click('#map button[data-map="sea"]');
  await page.click('#noPorts');
  await page.click('#mode button[data-mode="board"]');
  const modified=await snapshot();
  assert.equal(await length(),initialLength+1);
  await page.goBack(); assert.deepEqual(await snapshot(),redrawn);
  await page.goForward(); assert.deepEqual(await snapshot(),modified);
  await page.goBack(); await page.reload(); assert.deepEqual(await snapshot(),redrawn);
  await page.click('#newBoard');
  const branch=await snapshot();
  await page.goForward(); assert.deepEqual(await snapshot(),branch);
  const fresh=await browser.newPage();
  await fresh.goto(url+original.hash);
  assert.equal(await fresh.locator('#board').innerHTML(),original.board);
  await page.evaluate(()=>{navigator.clipboard.writeText=async text=>window.copiedLink=text});
  await page.click('#copy');
  assert.equal(await page.evaluate(()=>window.copiedLink),url+branch.hash);
  assert.deepEqual(errors,[]);
  console.log('PASS: new-board history, exact redrawn settlements, toggles, Back/Forward, reload, branching, deep links and Copy link.');
} finally {await browser.close()}
