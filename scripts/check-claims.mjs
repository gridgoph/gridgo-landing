/**
 * Guards the things that must never reach a public page.
 *
 * Scope is deliberately narrow. The marketing copy on this site is the
 * captain's, and it is ported as written — this check does not police it.
 * What it does police is commercially sensitive detail and stale endpoints
 * from the legacy codebase, neither of which belongs on gridgo.talasora.com.
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

// ── Commercially sensitive detail ─────────────────────────────────────────
// GRIDGO's commission is never shown to a client, and the supplier payout
// split is an in-app contract detail. Neither belongs on a public page.
forbid(/commission/i, 'GRIDGO commission must never appear on the public site.');
forbid(
  /\b(50|15|25|10)\s*%\s*(of\s*)?(the\s*)?(supplier|partner|payout|milestone)/i,
  'Supplier payout percentages should not be published on the landing page.',
);
forbid(
  /₱\s?\d/,
  'No peso figures — GRIDGO has published no prices or delivery-fee bands.',
);

// ── Legacy hosts and endpoints ────────────────────────────────────────────
forbid(/192\.168\.\d+\.\d+/, 'No LAN addresses from the legacy codebase.');
forbid(/localhost:\d+/, 'No localhost URLs in shipped source.');
forbid(/printing_app/, 'No references to the legacy printing_app repository.');

// ── Things that must be present ───────────────────────────────────────────
assert(
  allSource.includes('gridgo-api.talasora.com'),
  'The API base should point at gridgo-api.talasora.com.',
);

// The deploy workflow refuses to publish a bundle that does not contain the
// deployed dashboard URL. Vite only inlines a VITE_* value where the source
// actually reads it, so the constant existing is not enough — it has to reach
// rendered markup. This is exactly how the link was lost once already.
const links = sources.find((s) => s.file === 'utils/landingLinks.ts');
assert(links, 'src/utils/landingLinks.ts should exist.');
assert(
  links.text.includes('VITE_DASHBOARD_URL') &&
    /dashboardUrl,/.test(links.text),
  'landingLinks() should resolve VITE_DASHBOARD_URL and expose it as dashboardUrl.',
);
assert(
  allSource.includes('gridgo-dash.talasora.com'),
  'The dashboard URL should default to gridgo-dash.talasora.com.',
);
const rendersDashboard = sources.some(
  (s) => s.file !== 'utils/landingLinks.ts' && /href=\{dashboardUrl\}/.test(s.text),
);
assert(
  rendersDashboard,
  'Some rendered link must use dashboardUrl, or Vite has nothing to inline the deployed URL into and the deploy check fails.',
);
for (const slug of ['gridgo-client', 'gridgo-supplier', 'gridgo-rider']) {
  assert(allSource.includes(slug), `The download page should name the ${slug} app.`);
}
