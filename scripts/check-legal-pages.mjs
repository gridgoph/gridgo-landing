/**
 * /privacy and /delete-account are the URLs entered in Google Play Console;
 * /terms is the Terms of Service linked from the App Store listing.
 * Play needs them public, titled, specific to GRIDGO's apps, and readable
 * without JavaScript. The first three are checked here against the source;
 * the last is checked by `npm run build` (scripts/prerender-legal.mjs) and by
 * the image smoke test in .github/workflows/deploy.yml.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(scriptDir, p), 'utf8');

const routeTable = read('../src/AppRoutes.tsx');
const routes = read('../src/routes.tsx');
const main = read('../src/main.tsx');
const app = read('../src/App.tsx');
const meta = read('../src/legal/legalPages.ts');
const layout = read('../src/legal/LegalLayout.tsx');
const privacy = read('../src/legal/PrivacyPage.tsx');
const deletion = read('../src/legal/DeleteAccountPage.tsx');
const terms = read('../src/legal/TermsPage.tsx');
const nginx = read('../deploy/nginx.conf');
const pkg = JSON.parse(read('../package.json'));

// ── Routing and serving ───────────────────────────────────────────────────
assert(routeTable.includes('<Route path="/privacy" element={<PrivacyRoute />} />'), '/privacy should be in the route table.');
assert(
  routeTable.includes('<Route path="/delete-account" element={<DeleteAccountRoute />} />'),
  '/delete-account should be in the route table.',
);
assert(/PrivacyRoute\s*=\s*lazy\([\s\S]*?PrivacyPage/.test(routes), '/privacy should lazy-load the privacy page.');
assert(/DeleteAccountRoute\s*=\s*lazy\([\s\S]*?DeleteAccountPage/.test(routes), '/delete-account should lazy-load its page.');
assert(main.includes('<AppRoutes />'), 'main.tsx should render the shared route table the prerender uses.');
assert(main.includes('hydrateRoot'), 'main.tsx should hydrate prerendered pages rather than replace them.');
assert(
  /vite build\s*&&\s*node scripts\/prerender-legal\.mjs/.test(pkg.scripts.build),
  'npm run build should prerender the legal pages after vite build.',
);
assert(
  /try_files \$uri \$uri\.html [^;]*\/index\.html;/.test(nginx),
  'nginx should serve dist/<route>.html for a bare /privacy before falling back to the SPA shell.',
);
assert(routeTable.includes('<Route path="/terms" element={<TermsRoute />} />'), '/terms should be in the route table.');
assert(/TermsRoute\s*=\s*lazy\([\s\S]*?TermsPage/.test(routes), '/terms should lazy-load the terms page.');
for (const path of ['/privacy', '/delete-account', '/terms']) {
  assert(meta.includes(`path: '${path}'`), `legalPages.ts should list ${path} for prerendering.`);
}

// ── Reachable from the site ───────────────────────────────────────────────
assert(app.includes('to="/privacy"'), 'The site footer should link to /privacy.');
assert(app.includes('to="/delete-account"'), 'The site footer should link to /delete-account.');
assert(app.includes('to="/terms"'), 'The site footer should link to /terms.');
assert(
  layout.includes('to="/privacy"') && layout.includes('to="/delete-account"') && layout.includes('to="/terms"'),
  'Each legal page should link to /privacy, /delete-account and /terms.',
);

// ── What Google Play requires the policy to say ───────────────────────────
assert(meta.includes("PRIVACY_CONTACT = 'gridgo26@gmail.com'"), 'The privacy contact should be gridgo26@gmail.com.');
assert(meta.includes("EFFECTIVE_DATE = '7 October 2026'"), 'The effective date should be shown.');
assert(privacy.includes('title="Privacy Policy"'), 'The page must be titled "Privacy Policy".');
for (const name of ['GRIDGO Supplier', 'GRIDGO Rider', 'ph.gridgo.client', 'gridgo-dash.talasora.com']) {
  assert(privacy.includes(name), `The policy should name ${name}.`);
}
for (const [needle, why] of [
  ['Republic Act No. 10173', 'cite the Data Privacy Act'],
  ['National Privacy Commission', 'say where to complain'],
  ['We do not sell your data', 'say data is not sold'],
  ['id: \'retention\'', 'have a retention section'],
  ['id: \'sharing\'', 'name the parties data is shared with'],
  ['id: \'security\'', 'describe secure handling'],
  ['not directed at children', 'say GRIDGO is not for children'],
  ['to="/delete-account"', 'link to the deletion page'],
  ['Davao City', 'say where GRIDGO is based'],
  ['background', 'say whether location is collected in the background'],
]) {
  assert(privacy.includes(needle), `The privacy policy should ${why}.`);
}
assert(!/18 years|18 and over/.test(privacy), 'The policy must not state an 18-and-over audience (the client is rated 9+).');
for (const right of ['to be informed', 'to access', 'to object', 'to erasure or blocking', 'to rectification', 'to data portability', 'to damages', 'to file a complaint']) {
  assert(privacy.includes(right), `The policy should list the right ${right}.`);
}
for (const [needle, why] of [
  ['Delete my GRIDGO account', 'give a subject line for the email request'],
  ['within 30 days', 'commit to a deadline'],
  ['id: \'what-we-delete\'', 'say what is deleted'],
  ['id: \'what-we-keep\'', 'say what is kept and why'],
  ['Inside the app', 'explain how to ask from inside the apps'],
  ['Account → Delete account', 'explain the in-app deletion request entry'],
]) {
  assert(deletion.includes(needle), `The deletion page should ${why}.`);
}

// The two pages describe one retention schedule; keep their periods in step.
for (const period of ['5 years after the order closes', '1 year after the order closes', '30 days']) {
  assert(privacy.includes(period) && deletion.includes(period), `Both pages should state "${period}".`);
}

// ── The Terms of Service, as approved on 11 November 2026 ─────────────────
assert(terms.includes('title="Terms of Service"'), 'The terms page must be titled "Terms of Service".');
assert(meta.includes("TERMS_EFFECTIVE_DATE = '11 November 2026'"), 'The terms should take effect on 11 November 2026.');
assert(meta.includes("TERMS_LAST_UPDATED = '11 November 2026'"), 'The terms should be last updated 11 November 2026.');
assert(/effectiveDate=\{TERMS_EFFECTIVE_DATE\}/.test(terms), '/terms should show its own effective date.');
for (const marker of ['MARK TO CONFIRM', 'DRAFT', 'Questions for Mark', 'Recommended']) {
  assert(!terms.includes(marker), `The published terms must not carry the draft marker "${marker}".`);
}
assert(!/<(p|li|h3)>[^\n]*\[/.test(terms), 'The published terms must not carry a [placeholder] in their text.');
for (const [needle, why] of [
  ['the GRIDGO team, Davao City, Philippines', 'name the operator'],
  ["you may use GRIDGO only with your parent's or guardian's consent", 'let minors use GRIDGO with guardian consent'],
  ['Riders must be 18 or older', 'require riders to be 18 or older'],
  ['If an order stays unpaid, GRIDGO may cancel it', 'say unpaid orders may be cancelled'],
  ['There is no separate cancellation fee.', 'say there is no cancellation fee'],
  ['limited to what you paid for that order', 'cap liability at the order amount'],
  ['within 30 days', 'give support 30 days to settle a dispute'],
  ['proper courts of Davao City', 'name Davao City courts'],
  ['commit fraud, put people or orders at risk', 'list the grounds for suspension'],
  ['to="/privacy"', 'link to the privacy policy'],
]) {
  assert(terms.includes(needle), `The terms should ${why}.`);
}
assert(!/guarantee/i.test(terms), 'The terms must not name a reprint guarantee.');

// ── Prerender safety ──────────────────────────────────────────────────────
// The server renders dark and the browser may be light; markup that branches
// on the theme would make hydration disagree with the prerendered HTML.
assert(!/isDarkMode/.test(layout + privacy + deletion + terms), 'Legal pages must not branch markup on isDarkMode.');

console.log('legal pages ok');
