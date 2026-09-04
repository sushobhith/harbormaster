import assert from 'assert';
import handler from '../api/version.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

let headers = {};
let statusCode = 0;
let jsonBody = null;

const req = { method: 'GET', url: '/version' };
const res = {
  setHeader(key, value) {
    headers[key] = value;
  },
  status(code) {
    statusCode = code;
    return this;
  },
  json(data) {
    jsonBody = data;
    return this;
  }
};

handler(req, res);

assert.strictEqual(statusCode, 200, 'HTTP status must be 200');
assert.strictEqual(headers['Content-Type'], 'application/json', 'Content-Type must be application/json');
assert.deepStrictEqual(jsonBody, { version: pkg.version }, `Version must match package.json version (${pkg.version})`);

console.log('test_version: passed successfully (status: ' + statusCode + ', version: ' + jsonBody.version + ')');
