// Records a looping "click -> new fair board" GIF for the README and social posts.
// Usage: node scripts/make-demo-gif.mjs
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;
import fs from 'fs';

const HOME = process.env.HOME;
const URL = 'file://' + HOME + '/Documents/projects/harbormaster/index.html';
// mix of player counts and maps so the GIF shows the whole product
const BOARDS = [
  { seed: 'island', hash: 'p=4' },
  { seed: 'harbor', hash: 'p=6' },
  { seed: 'delta',  hash: 'p=4&map=sea' },
  { seed: 'reef',   hash: 'p=6&map=sea' },
  { seed: 'tide',   hash: 'p=4' },
];
const W = 1300, H = 940;
const HOLD_MS = 1300, PRESS_MS = 180;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const frames = [];

const setup = async (pressed) => p.evaluate((pressed) => {
  let c = document.getElementById('__cursor');
  const btn = document.getElementById('newBoard');
  const r = btn.getBoundingClientRect();
  if (!c) {
    c = document.createElement('div'); c.id = '__cursor';
    c.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))';
    c.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2 L4 20 L9 15 L12 22 L15 21 L12 14 L19 14 Z" fill="#111" stroke="#fff" stroke-width="1.5"/></svg>';
    document.body.appendChild(c);
  }
  c.style.left = (r.left + r.width * 0.55) + 'px';
  c.style.top = (r.top + r.height * 0.5) + 'px';
  c.style.transform = pressed ? 'scale(.82)' : '';
  btn.style.transform = pressed ? 'translateY(1px) scale(.97)' : '';
  btn.style.filter = pressed ? 'brightness(.88)' : '';
}, pressed);

for (const { seed, hash } of BOARDS) {
  await p.goto('about:blank');
  await p.goto(URL + '#s=' + seed + '&' + hash);
  await p.waitForTimeout(1000);
  await setup(false);
  frames.push({ buf: await p.screenshot({ clip: { x: 0, y: 0, width: W, height: H } }), delay: HOLD_MS });
  await setup(true);
  frames.push({ buf: await p.screenshot({ clip: { x: 0, y: 0, width: W, height: H } }), delay: PRESS_MS });
}
await b.close();

const gif = GIFEncoder();
for (const f of frames) {
  const png = PNG.sync.read(f.buf);
  const data = new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.length);
  const palette = quantize(data, 256);
  const index = applyPalette(data, palette);
  gif.writeFrame(index, png.width, png.height, { palette, delay: f.delay, repeat: 0 });
}
gif.finish();
fs.writeFileSync('docs/assets/demo.gif', Buffer.from(gif.bytes()));
console.log('wrote docs/assets/demo.gif —', frames.length, 'frames,', (fs.statSync('docs/assets/demo.gif').size / 1e6).toFixed(2), 'MB');
