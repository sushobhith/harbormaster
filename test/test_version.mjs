import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import handler from '../api/version.js';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
);
const vercelConfig = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8')
);

let statusCode;
let body;
const headers = new Map();

const res = {
  setHeader(name, value) {
    headers.set(name.toLowerCase(), value);
  },
  status(code) {
    statusCode = code;
    return this;
  },
  json(value) {
    body = value;
    return this;
  }
};

handler({ method: 'GET', url: '/api/version' }, res);

assert.equal(statusCode, 200);
assert.equal(headers.get('content-type'), 'application/json');
assert.deepEqual(body, { version: packageJson.version });

assert.ok(
  vercelConfig.rewrites?.some(
    ({ source, destination }) =>
      source === '/version' && destination === '/api/version'
  ),
  'vercel.json must rewrite /version to /api/version'
);

console.log(`version endpoint: ok (${body.version})`);
