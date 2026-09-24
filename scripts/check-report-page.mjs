/**
 * /report files public issue reports into gridgo-api (`POST /issue-reports`).
 * Only the issue text is required; category and screenshots stay optional.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(scriptDir, p), 'utf8');

const main = read('../src/main.tsx');
const routes = read('../src/routes.tsx');
const page = read('../src/ReportPage.tsx');
const app = read('../src/App.tsx');

assert(main.includes('<Route path="/report" element={<ReportRoute />} />'), 'The /report route should be registered.');
assert(/ReportRoute\s*=\s*lazy\([\s\S]*?ReportPage/.test(routes), '/report should lazy-load the report page.');
assert(page.includes('`${apiBaseUrl}/issue-reports`'), 'The report form should post to gridgo-api /issue-reports.');
assert(!/localhost|127\.0\.0\.1/.test(page), 'The report page must not ship a local host.');
assert.equal((page.match(/^\s+required$/gm) ?? []).length, 1, 'Only the issue text should be required.');
assert(app.includes('to="/report"'), 'The landing page should link to /report.');

console.log('report page ok');
