/**
 * Early access (gridgoph/gridgo-web#319, iPhone in #325): home buttons, the
 * /download split with the sign-up form and its Android/iPhone choice, the
 * waiting page and the desk list; shops (the supplier app) in #329. The API half is gridgo-api
 * docs/EARLY_ACCESS_API.md.
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
const phoneChoice = read('../src/earlyAccess/PhoneChoice.tsx');
const testFlightBox = read('../src/earlyAccess/TestFlightBox.tsx');

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
const hero = app.slice(app.indexOf('function HeroSection('), app.indexOf('{EARLY_ACCESS_NOTE}'));
assert(/>\s*Get Early Access\s*</.test(hero), 'The hero has the yellow Get Early Access button.');
assert(hero.indexOf('Get Early Access') > hero.indexOf('Design. Tap.'), 'The hero buttons sit under "Design. Tap. Print."');
assert(app.includes('Direct download (APK)'), 'The hero has the outlined APK button.');
// #325: Early access is for Android and iPhone, so no button or heading names one store.
for (const [file, text] of [['App.tsx', app], ['DownloadPage.tsx', download], ['EarlyAccessStatusPage.tsx', status]]) {
  assert(!/on Google Play/.test(text), `${file}: no button or heading says "on Google Play".`);
  assert(!/Google Play Early Access/.test(text), `${file}: the early-access heading names no store.`);
}
assert(app.includes('{EARLY_ACCESS_NOTE}'), 'The hero says access is open, takes about 5 minutes and is free.');
assert(app.includes('to="/download#early-access"') && app.includes('to="/download#apk"'));

// ── /download ─────────────────────────────────────────────────────────────
assert(download.includes('Two ways to install. Pick the one that fits you.'));
assert(download.includes("{shop ? copy.title : 'Early Access'}</h2>") && download.includes('Recommended'));
assert(download.includes('Android or iPhone.'), 'The Option 1 card says it is for both phones.');
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
assert(api.includes('JSON.stringify(signUpBody(input))'), 'The form posts the pinned body.');

// ── #325: the phone choice and the request body ──────────────────────────
assert.equal(logic.DEFAULT_PLATFORM, 'android', 'Android is chosen until the visitor picks iPhone.');
assert.equal(logic.parsePlatform('iphone'), 'iphone');
assert.equal(logic.parsePlatform(undefined), 'android', 'An API that predates iPhone means Android.');
assert.equal(logic.parsePlatform('IPHONE'), 'android', 'Only the exact API value counts.');
assert.deepEqual(
  logic.signUpBody({ email: ' Jo@iCloud.com ', source: 'booth', platform: 'iphone' }),
  { email: 'jo@icloud.com', consent: true, platform: 'iphone', source: 'booth' },
  'iPhone sign-ups post platform "iphone" with the Apple ID email.',
);
assert.deepEqual(
  logic.signUpBody({ email: 'jo@gmail.com', source: null, platform: 'android' }),
  { email: 'jo@gmail.com', consent: true, platform: 'android' },
  'Android posts platform "android" (accepted by every API release) and no empty source.',
);
assert.equal(logic.FORM_COPY.android.label, 'Google Play email');
assert.equal(logic.FORM_COPY.iphone.label, 'Apple ID email');
assert.match(logic.FORM_COPY.iphone.placeholder, /icloud/);
assert.match(logic.FORM_COPY.iphone.consent, /TestFlight/);
assert(!/Google/.test(JSON.stringify(logic.FORM_COPY.iphone)), 'Nothing on the iPhone form mentions Google.');
assert.equal(logic.SIGN_UP_STEPS.android.length, 3, 'Android keeps its three steps.');
assert.equal(logic.SIGN_UP_STEPS.iphone.length, 4, 'iPhone has four steps.');
assert.match(logic.SIGN_UP_STEPS.iphone[0], /Install TestFlight/, 'Installing TestFlight is the first iPhone step.');
assert.match(logic.SIGN_UP_STEPS.iphone[1], /Apple ID/);
assert.match(logic.SIGN_UP_STEPS.iphone[2], /5 minutes/);
assert.match(logic.SIGN_UP_STEPS.iphone[3], /Open the invite/);
assert(!/Google/.test(logic.WAITING_STEPS.iphone.join()), 'The iPhone waiting steps never mention Google.');
assert.match(logic.signUpErrorMessage(400, 'invalid_email', 'iphone'), /Apple ID/);
assert.match(logic.signUpErrorMessage(400, 'invalid_email', 'android'), /Google Play/);
assert.match(logic.signUpErrorMessage(400, 'invalid_platform', 'iphone'), /iPhone sign-up is not open yet/);
assert.equal(logic.parseStored('{"token":"t","createdAt":"2026-11-17T10:00:00.000Z"}')?.platform, 'android', 'A token stored before #325 is Android.');
assert.equal(logic.parseStored('{"token":"t","createdAt":"2026-11-17T10:00:00.000Z","platform":"iphone"}')?.platform, 'iphone');

assert(form.includes('<PhoneChoice') && form.indexOf('<PhoneChoice') < form.indexOf('type="email"'), 'The phone choice sits above the email field.');
assert(/!shop && platform === 'iphone' \? \([\s\S]*?<TestFlightBox \/>/.test(form), 'The TestFlight box shows for the customer app on iPhone only.');
for (const field of ['copy.label', 'copy.placeholder', 'copy.hint', 'copy.consent']) {
  assert(form.includes(`{${field}}`), `The form's ${field} follows the phone.`);
}
assert(/signUp\(\{\s*email,\s*source: currentSource\(search\),\s*platform,\s*app,/.test(form), 'The chosen phone and app reach the sign-up.');
assert(phoneChoice.includes('type="radio"') && phoneChoice.includes('<fieldset'), 'The phone choice is a labelled radio group.');
assert(download.includes('shop ? SHOP_STEPS : SIGN_UP_STEPS[platform]'), 'The steps beside the form follow the app and the phone.');
assert(download.includes('<EarlyAccessForm app={app} platform={platform} onPlatformChange={setPlatform} />'));
assert.equal(logic.TESTFLIGHT_URL, 'https://apps.apple.com/ph/app/testflight/id899247664');
assert(testFlightBox.includes('href={TESTFLIGHT_URL}') && testFlightBox.includes('target="_blank"') && testFlightBox.includes('rel="noopener noreferrer"'), 'Get TestFlight opens the App Store in a new tab.');
assert(testFlightBox.includes('Get TestFlight') && testFlightBox.includes("Apple's review") && testFlightBox.includes("Apple's official app"));
assert(/hidden md:pointer-fine:flex/.test(testFlightBox), 'The QR shows only on a desktop (wide screen with a mouse).');
const qr = await import('../src/earlyAccess/testflightQr.ts');
assert.equal(qr.TESTFLIGHT_QR_SOURCE, logic.TESTFLIGHT_URL, 'The QR was drawn from the TestFlight link.');
assert(api.includes('`${apiBaseUrl}/early-access`'), 'Sign-up posts to the API origin.');
assert(routeTable.includes('<SourceCapture />'), '?src= is remembered from whichever page the visitor lands on.');

// ── Waiting page ──────────────────────────────────────────────────────────
assert(routeTable.includes('<Route path="/early-access/status" element={<EarlyAccessStatusRoute />} />'));
assert(routeTable.includes('<Route path="/early-access" element={<EarlyAccessRedirect />} />'));
assert(/EarlyAccessStatusRoute\s*=\s*lazy\(/.test(routes));
for (const text of [
  'Setting up your access…',
  'WAITING_STEPS[platform]',
  "You're in",
  'Your invite is in your inbox.',
  'Open Google Play',
  'Keep the app for 14 days.',
  'Spam',
  'to="/download#apk"',
  'You can close this page.',
  'Your invite comes by email from TestFlight.',
]) {
  assert(status.includes(text), `The waiting page should say: ${text}`);
}
assert(/iphone \? \([\s\S]*?Your TestFlight invite arrives by email in about 5 minutes\.[\s\S]*?<TestFlightBox/.test(status), 'iPhone waiting says the invite takes about 5 minutes and shows TestFlight first.');
assert(/function GrantedIphone[\s\S]*?about 5 minutes[\s\S]*?<TestFlightBox/.test(status), 'iPhone success points to the TestFlight invite.');
assert(!/function GrantedIphone[\s\S]*?Keep the app for 14 days/.test(status.slice(status.indexOf('function GrantedIphone'), status.indexOf('function Missing'))), 'The 14-day rule is Google Play only.');
assert(/iphone \? \([\s\S]*?Spam folder[\s\S]*?\) : \([\s\S]*?to="\/download#apk"/.test(status), 'At 15 minutes iPhone gets no APK fallback.');
assert(status.includes('result.platform ??'), 'The API-reported phone wins over the stored one.');
assert(status.includes("'no-referrer'"), 'The token in the address is never sent on as a referrer.');
assert(status.includes('rel="noopener noreferrer"'));
assert(/localStorage/.test(api) && /try \{[\s\S]*?localStorage/.test(api), 'Token storage is guarded.');
assert(!/email/i.test(api.slice(api.indexOf('export function storeSignUp'))), 'The email is never kept in the browser.');

// ── Desk ──────────────────────────────────────────────────────────────────
assert(deskApi.includes('/early-access/desk?'), 'The desk lists sign-ups from /early-access/desk.');
assert(deskApi.includes('/early-access/desk/${encodeURIComponent(id)}/grant'));
assert(desk.includes('<EarlyAccessDesk />'), 'Early access lives inside the existing desk gate.');
const phoneMark = read('../src/desk/PhoneMark.tsx');
{
  const D = await import('../src/desk/earlyAccessList.ts');
  assert.equal(D.phoneOf({ platform: 'iphone' }), 'iphone');
  assert.equal(D.phoneOf({ platform: 'android' }), 'android');
  assert.equal(D.phoneOf({}), 'android', 'A row without a platform is Android.');
  assert.equal(D.phoneOf({ platform: null }), 'android');
  assert.equal(D.PHONE_COPY.android.label, 'Android');
  assert.equal(D.PHONE_COPY.iphone.label, 'iPhone');
  assert.equal(D.PHONE_COPY.android.action, 'Grant', 'Android keeps Grant (GRIDGO emails the Play invite).');
  assert.equal(D.PHONE_COPY.iphone.action, 'Mark added', 'iPhone says what staff do: mark the tester added.');
  assert.match(D.PHONE_COPY.iphone.reminder, /Apple ID[\s\S]*App Store Connect/, 'iPhone reminds staff to add the Apple ID first.');
  assert.equal(D.PHONE_COPY.android.reminder, null);
  assert.doesNotMatch(D.PHONE_COPY.iphone.notice('a@b.c'), /Google Play/, 'An iPhone grant never claims a Play invite.');
  assert.equal(D.statusLabel({ platform: 'iphone', status: 'granted' }), 'added', 'A granted iPhone reads added.');
  assert.equal(D.statusLabel({ platform: 'android', status: 'granted' }), 'granted');
  assert.equal(D.statusLabel({ platform: 'iphone', status: 'pending' }), 'pending');
}
assert(/<th[^>]*>Phone<\/th>/.test(earlyDesk), 'The desk table has a Phone column.');
assert(/md:hidden[^>]*>Phone:</.test(earlyDesk), 'On a phone each row has a labelled Phone line.');
assert(earlyDesk.includes('<PhoneMark phone={phone}'), 'Every row shows the phone mark.');
assert(earlyDesk.includes('{statusLabel(row)}'), 'Status comes from statusLabel (added for iPhone).');
assert(earlyDesk.includes('phoneCopy.action') && earlyDesk.includes('phoneCopy.reminder'), 'The action and reminder follow the phone.');
assert(phoneMark.includes("from '../components/BrandMarks'"), 'The desk uses the real Android and Apple marks.');
{
  const marks = read('../src/components/BrandMarks.tsx');
  assert(marks.includes('aria-hidden="true"'), 'The marks are decorative; the label carries the meaning.');
  assert(marks.includes('fill="currentColor"'), 'The marks follow the text colour in light and dark.');
  for (const name of ['AppleMark', 'AndroidMark', 'GooglePlayMark']) assert(marks.includes(`export function ${name}`), `${name} exists.`);
  for (const file of ['../src/App.tsx', '../src/DownloadPage.tsx', '../src/earlyAccess/PhoneChoice.tsx']) {
    assert(!/<svg[^>]*>\s*<path d="M(16\.365|3\.609|17\.6 9\.48)/.test(read(file)), `${file} uses BrandMarks, not a hand-copied glyph.`);
  }
}
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
assert(/\[filter, appFilter, query, reloads\]/.test(earlyDesk), 'The list effect reruns on a reload.');

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

// ── #329: shop early access (GRIDGO for shops, the supplier app) ──────────
{
  assert.equal(logic.DEFAULT_APP, 'customer', 'The customer app is chosen until a link or the visitor picks the shop app.');
  assert.equal(logic.parseApp('shop'), 'shop');
  assert.equal(logic.parseApp(undefined), 'customer', 'An API that predates shops means the customer app.');
  assert.equal(logic.parseApp('SHOP'), 'customer', 'Only the exact API value counts.');
  assert.equal(logic.appFromSearch('?app=shop'), 'shop');
  assert.equal(logic.appFromSearch('?app=supplier&src=booth'), 'shop', '?app=supplier means the shop app too.');
  assert.equal(logic.appFromSearch('?app=customer'), 'customer');
  assert.equal(logic.appFromSearch('?app=rider'), null, 'An unknown app preselects nothing.');
  assert.equal(logic.appFromSearch(''), null);
  assert.equal(logic.SHOP_EARLY_ACCESS_PATH, '/download?app=shop#early-access', 'Shop links open Early Access with the shop app chosen.');
  assert.deepEqual(logic.APP_CHOICES.map((c) => c.value), ['customer', 'shop']);

  // The customer body is byte-for-byte what it was: no app field, no shop name.
  assert.deepEqual(
    logic.signUpBody({ email: 'jo@gmail.com', source: null, platform: 'android', app: 'customer', shopName: 'ignored' }),
    { email: 'jo@gmail.com', consent: true, platform: 'android' },
    'The customer sign-up body does not change.',
  );
  assert.deepEqual(
    logic.signUpBody({ email: ' Shop@Example.com ', source: 'booth', platform: 'android', app: 'shop', shopName: '  Corner Print  ' }),
    { email: 'shop@example.com', consent: true, platform: 'android', app: 'shop', shopName: 'Corner Print', source: 'booth' },
    'A shop posts app "shop" and the trimmed shop name.',
  );
  assert.deepEqual(
    logic.signUpBody({ email: 'shop@example.com', source: null, platform: 'iphone', app: 'shop', shopName: '   ' }),
    { email: 'shop@example.com', consent: true, platform: 'iphone', app: 'shop' },
    'A blank shop name is not sent; an iPhone shop posts platform "iphone" (notify only).',
  );
  assert.equal(logic.cleanShopName('a\u0007b'), 'a b', 'Control characters never reach the API.');
  assert.equal(logic.SHOP_NAME_MAX, 80, 'The API caps a shop name at 80 characters.');

  assert.equal(logic.SHOP_STEPS.length, 4, 'A shop has four steps.');
  assert.match(logic.SHOP_STEPS[0], /email/);
  assert.match(logic.SHOP_STEPS[1], /invite/);
  assert.match(logic.SHOP_STEPS[2], /set up your shop/);
  assert.match(logic.SHOP_STEPS[3], /14 days[\s\S]*test jobs/);
  assert.match(logic.SHOP_TEAM_NOTE, /Owners and staff can both join/);
  assert.equal(logic.SECTION_COPY.shop.title, 'Early Access for print shops');
  assert.equal(logic.SHOP_FORM_COPY.android.button, 'Join as a test shop');
  assert.equal(logic.SHOP_FORM_COPY.iphone.button, 'Notify my shop');
  assert.match(logic.SHOP_FORM_COPY.android.consent, /GRIDGO for shops Google Play test/);
  assert(!/invite/i.test(logic.SHOP_FORM_COPY.iphone.consent + logic.SHOP_FORM_COPY.iphone.hint), 'An iPhone shop is promised no invite.');
  assert(!/Google/.test(JSON.stringify(logic.SHOP_FORM_COPY.iphone)), 'Nothing on the iPhone shop form mentions Google.');
  assert.match(logic.SHOP_IPHONE_NOTE, /Android-only/);

  // Shops closed on the server is said kindly, never as an error.
  assert.ok(logic.isShopClosed('shop_early_access_disabled'));
  assert.ok(logic.isShopClosed('invalid_app'), 'An API that predates shops is the same as closed.');
  assert.ok(!logic.isShopClosed('invalid_email'));
  assert.equal(logic.SHOP_OPENS_SOON.title, 'Shop testing opens soon');
  assert.doesNotMatch(logic.signUpErrorMessage(409, 'shop_early_access_disabled', 'android', 'shop'), /not working|error/i);
  assert.match(logic.signUpErrorMessage(400, 'invalid_shop_name', 'android', 'shop'), /80 characters/);
  assert.match(logic.signUpErrorMessage(400, 'invalid_email', 'iphone', 'shop'), /your full email/);
  assert(/isShopClosed\(caught\.code\)[\s\S]*?setClosed\(true\)/.test(form), 'The form turns the refusal into the opens-soon note.');
  assert(/closed \? \([\s\S]*?role="status"[\s\S]*?SHOP_OPENS_SOON\.title/.test(form), 'The opens-soon note is a status, not an alert.');
  assert(api.includes('response.status, code)'), 'The API error keeps its code for the form.');

  // One email can join both apps: each app keeps its own token on this device.
  assert.notEqual(logic.storageKey('shop'), logic.storageKey('customer'));
  assert.equal(logic.storageKey('customer'), logic.STORAGE_KEY, 'Customer tokens stored before #329 are still found.');
  assert.equal(logic.parseStored('{"token":"t","createdAt":"2026-11-17T10:00:00.000Z"}')?.app, 'customer');
  assert.equal(logic.parseStored('{"token":"t","createdAt":"2026-11-17T10:00:00.000Z","app":"shop"}')?.app, 'shop');
  assert(form.includes('<AppForm key={app}'), 'Switching app gives a fresh form with its own sign-up state.');
  assert(form.includes('readSignUp(app)') && form.includes('forgetSignUp(app)'));
  assert(form.includes('maxLength={SHOP_NAME_MAX}') && form.includes('(optional)'), 'The shop name is optional and capped.');
  assert(/shop && platform === 'iphone' \? \([\s\S]*?SHOP_IPHONE_NOTE/.test(form), 'An iPhone shop sees the Android-only note.');

  // The app choice is at the top of the section on every screen.
  const appChoice = read('../src/earlyAccess/AppChoice.tsx');
  assert(appChoice.includes('type="radio"') && appChoice.includes('<fieldset') && appChoice.includes('Which app do you want to test?'));
  const section = download.slice(download.indexOf('function EarlyAccessSection('), download.indexOf('export function DownloadPage('));
  assert(section.indexOf('<AppChoice') > -1 && section.indexOf('<AppChoice') < section.indexOf('<h2'), 'The app choice comes before the title.');
  assert(!/hidden[^"]*">\s*<AppChoice/.test(section), 'The app choice is never hidden on a phone.');
  assert(section.includes('appFromSearch(search)'), '?app= preselects the app.');
  assert(section.includes('{SHOP_TEAM_NOTE}'));

  // Waiting and granted pages follow the app.
  assert(status.includes('SHOP_WAITING_STEPS') && status.includes('function GrantedShop') && status.includes('function ShopNotifyOnly'));
  assert(/notifyOnly \? \(\s*<ShopNotifyOnly \/>/.test(status), 'An iPhone shop sees the notify-only page, no countdown.');
  assert(/if \(notifyOnly\) return/.test(status), 'An iPhone shop is not polled.');
  assert(status.includes('result.app ??'), 'The API-reported app wins over the stored one.');
  assert(api.includes('export function readSignUpByToken'));

  // Three homepage entry points, all to the shop sign-up.
  const eco = read('../src/components/EcosystemSection.tsx');
  const centreNav = app.slice(app.indexOf('{/* Center Nav */}'), app.indexOf('{/* Right Nav */}'));
  assert(/to=\{SHOP_EARLY_ACCESS_PATH\}[^>]*>For print shops</.test(centreNav), 'The top nav links "For print shops".');
  const mobileMenu = app.slice(app.indexOf('{/* Mobile Menu Overlay */}'), app.indexOf('function HeroSection('));
  assert(/to=\{SHOP_EARLY_ACCESS_PATH\}[\s\S]*?For print shops/.test(mobileMenu), 'The phone menu links "For print shops" too.');
  const heroBlock = app.slice(app.indexOf('function HeroSection('), app.indexOf('{/* Phone Mockup at bottom */}'));
  assert(heroBlock.indexOf('Become a printing supplier') > heroBlock.indexOf('{EARLY_ACCESS_NOTE}'), 'The shop banner sits under the hero buttons.');
  assert(/to=\{SHOP_EARLY_ACCESS_PATH\}[\s\S]*?Become a printing supplier/.test(heroBlock));
  const supplierCard = eco.slice(eco.indexOf('{/* Supplier Card */}'));
  assert(/to=\{SHOP_EARLY_ACCESS_PATH\}[\s\S]*?Become a printing supplier/.test(supplierCard), 'The suppliers card has the shop sign-up button.');

  // Desk: app column and filter, shop name, shop notice, separate Play counts.
  const D = await import('../src/desk/earlyAccessList.ts');
  assert.equal(D.appOf({ app: 'shop' }), 'shop');
  assert.equal(D.appOf({}), 'customer', 'A row without an app is the customer app.');
  assert.ok(D.isNotifyOnly({ app: 'shop', platform: 'iphone' }));
  assert.ok(!D.isNotifyOnly({ app: 'customer', platform: 'iphone' }), 'A customer iPhone is a real TestFlight tester.');
  assert.ok(!D.isNotifyOnly({ app: 'shop', platform: 'android' }));
  assert.equal(D.statusLabel({ app: 'shop', platform: 'iphone', status: 'pending' }), 'notify only');
  assert.equal(D.statusLabel({ app: 'shop', platform: 'android', status: 'granted' }), 'granted');
  assert.match(D.grantNotice({ app: 'shop', platform: 'android', email: 'a@b.c' }), /shop tester/);
  assert.doesNotMatch(D.grantNotice({ app: 'customer', platform: 'android', email: 'a@b.c' }), /shop/);
  assert.notEqual(D.listKey('pending', '', 'shop'), D.listKey('pending', '', 'customer'), 'The app filter is part of the list key.');
  assert.equal(D.GOOGLE_PLAY_TARGET, 12);
  assert(deskApi.includes("params.set('app', query.app)"), 'The desk sends the app filter.');
  assert(/<th[^>]*>App<\/th>/.test(earlyDesk), 'The desk table has an App column.');
  assert(earlyDesk.includes('aria-label="App"'), 'The desk filters by app.');
  assert(earlyDesk.includes('row.shopName'), 'The desk shows the shop name.');
  assert(earlyDesk.includes('grantNotice(updated)'), 'The grant notice says when it is a shop tester.');
  assert(/countsByApp\[app\][\s\S]*?androidGranted[\s\S]*?GOOGLE_PLAY_TARGET/.test(earlyDesk), 'Each app counts its Android invites against the Play target.');
  assert(/notifyOnly \? \([\s\S]*?SHOP_COPY\.notifyOnlyNote[\s\S]*?\) : row\.status === 'pending'/.test(earlyDesk), 'An iPhone shop has no grant button.');

  // Desk reducer keeps countsByApp from the page.
  let l = D.listReducer(D.initialList, { type: 'request', key: 'k', generation: 1 });
  const byApp = { customer: { pending: 1, granted: 2, androidGranted: 2, notifyOnly: 0 }, shop: { pending: 3, granted: 1, androidGranted: 1, notifyOnly: 2 } };
  l = D.listReducer(l, { type: 'page', key: 'k', generation: 1, offset: 0, page: { signups: [], counts: { pending: 0, granted: 0 }, countsByApp: byApp, total: 0, limit: 50, offset: 0 } });
  assert.deepEqual(l.countsByApp, byApp);
}

// ── Privacy ───────────────────────────────────────────────────────────────
assert(privacy.includes('early-access form') && privacy.includes('Apple ID') && privacy.includes('TestFlight'), 'The privacy policy covers the iPhone sign-up.');
assert(privacy.includes('GRIDGO for shops') && privacy.includes('shop name'), 'The privacy policy covers the shop sign-up and its shop name.');

console.log('Early access: home, /download, waiting page, desk and privacy: passed');
