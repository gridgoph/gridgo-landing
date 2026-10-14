/**
 * The legal library and the cookie notice (gridgo-api issue 202).
 *
 * Footer links open each published legal document, read from gridgo-api's
 * public legal endpoints. YouTube is the only thing on the site that sets
 * cookies it does not need, so its player stays unloaded until the visitor
 * allows it, the choice is remembered, and it can be changed from the footer.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(scriptDir, p), 'utf8');

const routeTable = read('../src/AppRoutes.tsx');
const routes = read('../src/routes.tsx');
const app = read('../src/App.tsx');
const layout = read('../src/legal/LegalLayout.tsx');
const library = read('../src/legal/legalLibrary.ts');
const pages = read('../src/legal/LegalLibraryPages.tsx');
const footerLinks = read('../src/legal/FooterLegalLinks.tsx');
const store = read('../src/consent/cookieChoice.ts');
const consent = read('../src/consent/CookieConsent.tsx');
const videos = read('../src/components/HowItWorksVideos.tsx');

// ── Routes ────────────────────────────────────────────────────────────────
assert(routeTable.includes('<Route path="/legal" element={<LegalLibraryRoute />} />'), '/legal should list the library.');
assert(
  routeTable.includes('<Route path="/legal/:documentId" element={<LegalDocumentRoute />} />'),
  '/legal/:documentId should show one document.',
);
assert(/LegalDocumentRoute\s*=\s*lazy\(/.test(routes), 'The legal library pages should be their own chunk.');
assert(routeTable.includes('<CookieConsent />'), 'The cookie notice should be mounted for every route.');

// ── Reading the library ───────────────────────────────────────────────────
assert(
  library.includes('`${apiBaseUrl}/legal/documents`'),
  'Documents come from the public GET /legal/documents on the API origin.',
);
for (const slot of ['terms-of-service', 'privacy-notice', 'cookie-notice', 'acceptable-use', 'age-policy', 'supplier-agreement', 'rider-agreement', 'hub-staff-terms']) {
  assert(library.includes(`'${slot}'`), `The launch slot ${slot} should be known, for ordering and the offline fallback.`);
}
assert(!/dangerouslySetInnerHTML/.test(pages + library), 'Legal text is plain text from the API and is never rendered as HTML.');
for (const [needle, why] of [
  ['Version', 'show the version'],
  ['Effective', 'show the effective date'],
  ['Try again', 'offer a retry when the API cannot be reached'],
  ['PRIVACY_CONTACT', 'say where else to ask for a copy'],
]) {
  assert(pages.includes(needle), `A legal document page should ${why}.`);
}

// ── Footer links ──────────────────────────────────────────────────────────
assert(app.includes('<FooterLegalLinks />'), 'The landing footer should list the legal documents.');
assert(footerLinks.includes('LAUNCH_SLOTS'), 'The footer should still list the documents when the API is unreachable.');
assert(footerLinks.includes('to={`/legal/${doc.documentId}`}'), 'Each footer link should open its document.');
assert(app.includes('onClick={openCookieSettings}'), 'The landing footer should reopen Cookie settings.');
assert(layout.includes('to="/legal"') && layout.includes('onClick={openCookieSettings}'), 'Legal page footers should link the library and Cookie settings.');

// ── Cookie choice ─────────────────────────────────────────────────────────
assert(consent.includes("COOKIE_NOTICE_PATH = '/legal/cookie-notice'"), 'The notice should link the Cookie Notice document.');
assert(/useVideosAllowed[\s\S]*?videos === true/.test(store), 'Videos are allowed only by an explicit yes.');
assert(store.includes('localStorage.setItem(STORAGE_KEY'), 'The choice should be remembered.');
assert(
  /if \(choice === undefined\b.*\) return null;/.test(consent),
  'Nothing renders until the stored choice is read, so prerendered pages hydrate cleanly.',
);
assert(
  consent.includes('Keep videos off') && consent.includes('Allow YouTube videos'),
  'Saying no should be as easy as saying yes.',
);
assert(
  /const playing = playRequested && videosAllowed;/.test(videos),
  'The YouTube player loads only when the visitor has allowed it.',
);

// Any other embed would set cookies nobody asked about. Route it through the choice.
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}
for (const file of sourceFiles(resolve(scriptDir, '../src'))) {
  const text = readFileSync(file, 'utf8');
  if (/<iframe/.test(text)) {
    assert(text.includes('useVideosAllowed'), `${file} embeds a third-party frame without asking first.`);
  }
}

console.log('legal library and cookie notice ok');
