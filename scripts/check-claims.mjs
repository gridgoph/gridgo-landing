/**
 * Guards the promises this public page makes.
 *
 * The landing page was ported from the legacy printing_app codebase, which
 * asserted things GRIDGO cannot currently back and pointed at hosts that no
 * longer exist. This check keeps those from creeping back in, and keeps
 * supplier-invisible money detail off a public page.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(scriptDir, '../src');
const indexHtml = readFileSync(resolve(scriptDir, '../index.html'), 'utf8');

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css)$/.test(entry) ? [full] : [];
  });
}

const sources = sourceFiles(srcDir).map((file) => ({
  file: file.slice(srcDir.length + 1),
  text: readFileSync(file, 'utf8'),
}));
const allSource = sources.map((s) => s.text).join('\n') + '\n' + indexHtml;

function forbid(pattern, message) {
  for (const { file, text } of sources) {
    const match = text.match(pattern);
    assert(!match, `${message} (found ${JSON.stringify(match?.[0])} in src/${file})`);
  }
  const htmlMatch = indexHtml.match(pattern);
  assert(!htmlMatch, `${message} (found ${JSON.stringify(htmlMatch?.[0])} in index.html)`);
}

// ── Money detail that must never reach a public page ──────────────────────
forbid(/commission/i, 'GRIDGO commission must never appear on the public site.');
forbid(
  /\b(50|15|25|10)\s*%\s*(of\s*)?(the\s*)?(supplier|partner|payout|milestone)/i,
  'Supplier payout percentages should not be published on the landing page.',
);
forbid(
  /₱\s?\d/,
  'No peso figures on the landing page — GRIDGO has published no prices or delivery-fee bands.',
);
forbid(
  /cash on delivery|\bCOD\b/,
  'Cash on delivery was removed from the operational model; the page must not offer it.',
);

// ── Claims GRIDGO cannot currently back ───────────────────────────────────
forbid(/free printing/i, 'The page must not promise free printing.');
// Denying a store listing is fine and required; offering one is not. These are
// the affirmative forms — including the legacy page's fake store buttons.
forbid(
  /Download on the|GET IT ON|Get it on Google Play|Available on the App Store/i,
  'Do not ship an App Store or Google Play badge — GRIDGO has no store listing.',
);
forbid(
  /play\.google\.com|apps\.apple\.com|itunes\.apple\.com/i,
  'Do not link to an app store listing that does not exist.',
);
forbid(
  /\b\d{1,3}\s?%\s*(issue|resolution|satisfaction|uptime|on-time)/i,
  'No unbacked performance percentages.',
);
forbid(
  /\b\d+\+?\s*(print\s*shops|partners|suppliers|riders|customers|orders)\b/i,
  'No counts of shops, partners or orders — GRIDGO has published none.',
);
forbid(
  /(within|in)\s+\d+\s*(hours?|hrs?|minutes?|mins?|days?)\b/i,
  'No delivery-time or response-time promises.',
);
forbid(/24\s*\/\s*7\s*(support|availability)/i, 'No 24/7 support-availability claim.');

// ── Legacy product, hosts and endpoints ───────────────────────────────────
forbid(/192\.168\.\d+\.\d+/, 'No LAN addresses from the legacy codebase.');
forbid(/printing_app/, 'No references to the legacy printing_app repository.');
forbid(/localhost:\d+/, 'No localhost URLs in shipped source.');
forbid(/m\.me\//, 'The legacy m.me community handle no longer resolves.');
forbid(
  /\b(our|GRIDGO'?s)\s+(printers|printing hubs)\b/i,
  'GRIDGO does not own printers — jobs go to independent print partners.',
);

// ── Things that must be present ───────────────────────────────────────────
assert(
  allSource.includes('gridgo-dash.talasora.com'),
  'The dashboard link should point at gridgo-dash.talasora.com.',
);
assert(
  allSource.includes('gridgo-api.talasora.com'),
  'The API base should point at gridgo-api.talasora.com.',
);
assert(
  indexHtml.includes('https://gridgo.talasora.com/'),
  'index.html should declare gridgo.talasora.com as the canonical origin.',
);
for (const slug of ['gridgo-client', 'gridgo-supplier', 'gridgo-rider']) {
  assert(allSource.includes(slug), `The page should name the ${slug} app.`);
}
