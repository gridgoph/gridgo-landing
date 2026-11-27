import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(resolve(scriptDir, '../src/legal/deletionRequest.ts'), 'utf8')
  .replace(/:\s*string/g, '')
  .replace(/:\s*boolean/g, '')
  .replace(/:\s*typeof\s+fetch\s*=\s*fetch/g, ' = fetch')
  .replace(/:\s*Promise<void>/g, '');
const mod = await import(`data:text/javascript;base64,${Buffer.from(raw).toString('base64')}`);
const { submitDeletionRequest } = mod;
let called;
const fetchImpl = async (url, init) => { called = { url, init }; return new Response('{"ok":true}', { status: 202 }); };
await submitDeletionRequest('account@example.test', true, '/api', fetchImpl);
assert.equal(called.url, '/api/account-deletion-requests');
assert.deepEqual(JSON.parse(called.init.body), { email: 'account@example.test', confirmed: true });
await assert.rejects(submitDeletionRequest('bad', true, '/api', fetchImpl), /email/i);
await assert.rejects(submitDeletionRequest('account@example.test', false, '/api', fetchImpl), /confirm/i);
await assert.rejects(submitDeletionRequest('account@example.test', true, '/api', async () => new Response('', { status: 429 })), /wait/i);
await assert.rejects(submitDeletionRequest('account@example.test', true, '/api', async () => new Response('', { status: 500 })), /try again/i);
console.log('Deletion request validation, payload, success and failure: passed');
