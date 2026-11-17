/**
 * Google Play early access (gridgoph/gridgo-web#319): home buttons, the
 * /download split with the sign-up form, the waiting page and the desk list.
 * The API half is gridgo-api docs/EARLY_ACCESS_API.md.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(scriptDir, p), 'utf8');

const app = read('../src/App.tsx');
const routeTable = read('../src/AppRoutes.tsx');
const routes = read('../src/routes.tsx');
const download = read('../src/DownloadPage.tsx');
const form = read('../src/earlyAccess/EarlyAccessForm.tsx');
const status = read('../src/earlyAccess/EarlyAccessStatusPage.tsx');
const api = read('../src/earlyAccess/api.ts');
const deskApi = read('../src/desk/api.ts');
const desk = read('../src/desk/DeskPage.tsx');
const earlyDesk = read('../src/desk/EarlyAccessDesk.tsx');
const privacy = read('../src/legal/PrivacyPage.tsx');

// ── The pure logic, imported directly (Node strips the types) ─────────────
const logic = await import('../src/earlyAccess/logic.ts');

assert.equal(logic.sanitizeSource('Booth'), 'booth', '?src= is lowercased.');
assert.equal(logic.sanitizeSource(' nu-2026 '), 'nu-2026');
assert.equal(logic.sanitizeSource('<script>'), null, 'Anything but a short slug is dropped.');
assert.equal(logic.sanitizeSource(''), null);
assert.equal(logic.sanitizeSource('a'.repeat(65)), null, 'The API caps a source at 64 characters.');
assert.equal(logic.normalizeEmail('  Jo@Gmail.COM '), 'jo@gmail.com');
assert.ok(logic.looksLikeEmail('jo@gmail.com'));
assert.ok(!logic.looksLikeEmail('jo@gmail'));
assert.ok(!logic.looksLikeEmail('jo gmail.com'));
assert.equal(logic.safeOptInUrl('javascript:alert(1)'), null, 'Only an https opt-in link becomes a button.');
assert.equal(logic.safeOptInUrl('http://play.google.com/apps/testing/x'), null);
assert.equal(
  logic.safeOptInUrl('https://play.google.com/apps/testing/ph.gridgo.client'),
  'https://play.google.com/apps/testing/ph.gridgo.client',
);
assert.equal(logic.statusPath('ab cd'), '/early-access/status?token=ab%20cd');

const t0 = Date.parse('2026-11-17T10:00:00Z');
const created = new Date(t0).toISOString();
assert.deepEqual(logic.waitingPhase(created, t0), { remaining: 300, showSpamHint: false });
assert.deepEqual(logic.waitingPhase(created, t0 + 90_500), { remaining: 210, showSpamHint: false });
assert.deepEqual(logic.waitingPhase(created, t0 + 6 * 60_000), { remaining: 0, showSpamHint: false });
assert.deepEqual(
  logic.waitingPhase(created, t0 + 15 * 60_000),
  { remaining: 0, showSpamHint: true },
  'At 15 minutes still pending, suggest Spam and the APK.',
);
assert.equal(logic.formatCountdown(300), '5:00');
assert.equal(logic.formatCountdown(61), '1:01');
assert.equal(logic.formatCountdown(-4), '0:00');
assert.equal(logic.litDots(300, 'pending'), 1, 'The request itself is the first lit dot.');
assert.equal(logic.litDots(0, 'pending'), 8, 'A pending wait never fills the whole mark.');
assert.equal(logic.litDots(0, 'granted'), 9);
assert.equal(logic.POLL_MS, 30_000, 'The waiting page checks every 30 seconds.');
assert.equal(logic.parseStored('{"token":"t","createdAt":"2026-11-17T10:00:00.000Z"}')?.token, 't');
assert.equal(logic.parseStored('not json'), null);
assert.equal(logic.parseStored('{"createdAt":"x"}'), null);
assert.match(logic.signUpErrorMessage(400, 'consent_required'), /agree/);
assert.match(logic.signUpErrorMessage(429, 'rate_limited'), /in an hour/);

// ── Home: top bar and hero ────────────────────────────────────────────────
const topBar = app.slice(app.indexOf('{/* Right Nav */}'), app.indexOf('{/* Dark Mode Toggle */}'));
assert(
  topBar.indexOf('Get Early Access') > -1 && topBar.indexOf('Get Early Access') < topBar.indexOf('>\n            Download'),
  'The top bar shows Get Early Access to the left of Download.',
);
assert(app.includes('Get Early Access on Google Play'), 'The hero has the yellow Google Play button.');
assert(app.includes('Direct download (APK)'), 'The hero has the outlined APK button.');
assert(
  app.indexOf('Get Early Access on Google Play') > app.indexOf('Design. Tap.'),
  'The hero buttons sit under "Design. Tap. Print."',
);
assert(app.includes('{EARLY_ACCESS_NOTE}'), 'The hero says access is open, takes about 5 minutes and is free.');
assert(app.includes('to="/download#early-access"') && app.includes('to="/download#apk"'));

// ── /download ─────────────────────────────────────────────────────────────
assert(download.includes('Two ways to install. Pick the one that fits you.'));
assert(download.includes('Google Play Early Access') && download.includes('Recommended'));
assert(download.includes('Direct Download (APK)'));
assert(download.includes('id="early-access"') && download.includes('id="apk"'));
assert(download.includes('Android only, install now'), 'Each APK card is tagged Android only.');
assert(download.includes('Download APK'), 'APK buttons read "Download APK".');
assert(
  download.indexOf('<EarlyAccessSection />') < download.indexOf('id="apk"'),
  'Option 1 comes before Option 2.',
);

// ── The form ──────────────────────────────────────────────────────────────
assert(form.includes('type="email"') && form.includes('type="checkbox"'));
assert(form.includes('disabled={!consent || busy}'), 'Get Early Access stays disabled until consent.');
assert(form.includes('to="/privacy"'), 'The consent links to the existing Privacy Policy.');
assert(form.includes('currentSource(search)'), '?src= reaches the sign-up.');
assert(api.includes("consent: true") && api.includes("platform: 'android'"));
assert(api.includes('`${apiBaseUrl}/early-access`'), 'Sign-up posts to the API origin.');
assert(routeTable.includes('<SourceCapture />'), '?src= is remembered from whichever page the visitor lands on.');

// ── Waiting page ──────────────────────────────────────────────────────────
assert(routeTable.includes('<Route path="/early-access/status" element={<EarlyAccessStatusRoute />} />'));
assert(routeTable.includes('<Route path="/early-access" element={<EarlyAccessRedirect />} />'));
assert(/EarlyAccessStatusRoute\s*=\s*lazy\(/.test(routes));
for (const text of [
  'Setting up your access…',
  'Request received',
  'Adding you to the tester group',
  'Sending your Google Play invite',
  "You're in",
  'Your invite is in your inbox.',
  'Open Google Play',
  'Keep the app for 14 days.',
  'Spam',
  'to="/download#apk"',
  'You can close this page.',
]) {
  assert(status.includes(text), `The waiting page should say: ${text}`);
}
assert(status.includes("'no-referrer'"), 'The token in the address is never sent on as a referrer.');
assert(status.includes('rel="noopener noreferrer"'));
assert(/localStorage/.test(api) && /try \{[\s\S]*?localStorage/.test(api), 'Token storage is guarded.');
assert(!/email/i.test(api.slice(api.indexOf('export function storeSignUp'))), 'The email is never kept in the browser.');

// ── Desk ──────────────────────────────────────────────────────────────────
assert(deskApi.includes('/early-access/desk?'), 'The desk lists sign-ups from /early-access/desk.');
assert(deskApi.includes('/early-access/desk/${encodeURIComponent(id)}/grant'));
assert(desk.includes('<EarlyAccessDesk />'), 'Early access lives inside the existing desk gate.');
assert(earlyDesk.includes("'Granted'") || earlyDesk.includes('Granted'), 'Each pending row has a Granted button.');
assert(earlyDesk.includes('row.source') && earlyDesk.includes('row.createdAt'));

// ── Desk list races (review of PR #45, F1 and F2) ───────────────────────────
const L = await import('../src/desk/earlyAccessList.ts');
const person = (i, status = 'pending') => ({
  id: `id-${i}`, email: `tester${i}@example.com`, source: null, platform: 'android', status,
  createdAt: '2026-11-17T10:00:00.000Z', grantedAt: null, grantedBy: null,
});
const pageOf = (rows, total, counts) => ({ signups: rows, counts, total, limit: 50, offset: 0 });
const pendingKey = L.listKey('pending', '');

// F1: 51 waiting, 50 shown. Granting one must not strand the 51st behind a stale offset.
let list = L.listReducer(L.initialList, { type: 'request', key: pendingKey, generation: 1 });
list = L.listReducer(list, { type: 'page', key: pendingKey, generation: 1, offset: 0,
  page: pageOf(Array.from({ length: 50 }, (_, i) => person(i)), 51, { pending: 51, granted: 0 }) });
assert.ok(L.hasMore(list), '51 pending with 50 shown offers Show more.');
list = L.listReducer(list, { type: 'granted', row: { ...person(0), status: 'granted' } });
list = L.listReducer(list, { type: 'request', key: pendingKey, generation: 2 });
assert.equal(list.rows.length, 50, 'A reload after a grant keeps the rows up until the fresh page lands.');
assert.ok(!L.hasMore(list), 'No paging from a stale offset while the reload is in flight.');
list = L.listReducer(list, { type: 'page', key: pendingKey, generation: 2, offset: 0,
  page: pageOf(Array.from({ length: 50 }, (_, i) => person(i + 1)), 50, { pending: 50, granted: 1 }) });
assert.ok(list.rows.some((r) => r.email === 'tester50@example.com'), 'The last waiting person is reachable after a grant.');
assert.ok(list.rows.every((r) => r.status === 'pending'), 'Pending shows only pending people after a grant.');
assert.deepEqual(list.counts, { pending: 50, granted: 1 });
assert(/dispatch\(\{ type: 'granted'[\s\S]*?setReloads\(/.test(earlyDesk), 'A grant reloads the current list from the top.');
assert(/\[filter, query, reloads\]/.test(earlyDesk), 'The list effect reruns on a reload.');

// F2: a slow Show more from Pending must not land in Granted (or in a new search).
list = L.listReducer(L.initialList, { type: 'request', key: pendingKey, generation: 1 });
list = L.listReducer(list, { type: 'page', key: pendingKey, generation: 1, offset: 0,
  page: pageOf(Array.from({ length: 50 }, (_, i) => person(i)), 51, { pending: 51, granted: 0 }) });
list = L.listReducer(list, { type: 'request-more' });
const slowMore = { type: 'page', key: pendingKey, generation: 1, offset: 50,
  page: pageOf([person(50)], 51, { pending: 51, granted: 0 }) };
const grantedKey = L.listKey('granted', '');
list = L.listReducer(list, { type: 'request', key: grantedKey, generation: 2 });
list = L.listReducer(list, { type: 'page', key: grantedKey, generation: 2, offset: 0,
  page: pageOf([], 0, { pending: 51, granted: 0 }) });
list = L.listReducer(list, slowMore);
assert.deepEqual(list.rows, [], 'A stale Pending page is dropped from the Granted view.');
assert.equal(list.loadingMore, false);
const searchKey = L.listKey('pending', 'ana');
list = L.listReducer(list, { type: 'request', key: searchKey, generation: 3 });
list = L.listReducer(list, { ...slowMore, generation: 2, key: grantedKey });
list = L.listReducer(list, { type: 'failed', key: pendingKey, generation: 1, offset: 50, message: 'late' });
assert.deepEqual([list.rows.length, list.error, list.loading], [0, '', true], 'Old responses and errors never reach a new search.');
assert(/const ticket = \{ key: list\.key, generation: list\.generation \}/.test(earlyDesk), 'Show more is tied to the list it was asked for.');

// F4: the queue is a landmark.
assert(/<main aria-labelledby="early-access-desk-title"/.test(earlyDesk), 'The early-access desk is a main landmark.');

// ── Contrast (review F3) ──────────────────────────────────────────────────
const css = read('../src/index.css');
const hex = (name, scope) => css.slice(css.indexOf(scope)).match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const lightText = hex('--app-primary-text', '\n:root {');
const darkText = hex('--app-primary-text', '\n.dark {');
// The early-access card's palest point: 5% + glow of #D4A000 over white is about #F9F1D9.
for (const bg of ['#FFFFFF', '#F9F1D9']) {
  assert.ok(ratio(lightText, bg) >= 4.5, `Light brand text ${lightText} on ${bg} is ${ratio(lightText, bg).toFixed(2)}:1, under 4.5:1.`);
}
assert.ok(ratio(darkText, '#000000') >= 4.5);
assert.ok(ratio('#a3a3a3', '#070707') >= 4.5, 'Desk secondary text reaches 4.5:1.');
for (const [file, text] of [['EarlyAccessStatusPage', status], ['EarlyAccessForm', form]]) {
  assert(!/(?<![:-])text-\[var\(--color-primary\)\]/.test(text), `${file}: brand-coloured text uses --color-primary-text.`);
}
assert(!/#5a5a5a/.test(earlyDesk), 'No 2.9:1 grey left on the desk.');
for (const label of ['Option 1', 'Option 2']) {
  const at = download.lastIndexOf(label);
  assert(download.slice(at - 200, at).includes('text-[var(--color-primary-text)]'), `The ${label} section label uses the readable brand colour.`);
}
assert(!/text-gray-500 dark:text-gray-500/.test(status), 'Waiting steps reach 4.5:1 in dark mode.');

// ── Privacy ───────────────────────────────────────────────────────────────
assert(privacy.includes('Google Play early-access form'), 'The privacy policy names the new form.');

console.log('Early access: home, /download, waiting page, desk and privacy: passed');
