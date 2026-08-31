/**
 * The landing site is how people install GRIDGO, so every "Download" affordance
 * has to reach /download rather than scrolling to a section.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(scriptDir, p), 'utf8');

const app = read('../src/App.tsx');
const main = read('../src/main.tsx');
const routes = read('../src/routes.tsx');
const page = read('../src/DownloadPage.tsx');
const links = read('../src/utils/landingLinks.ts');
const releases = read('../src/utils/apkReleases.ts');
const nginx = read('../deploy/nginx.conf');
const compose = read('../deploy/docker-compose.yml');

// ── Routing ───────────────────────────────────────────────────────────────
assert(
  main.includes('<Route path="/download" element={<DownloadRoute />} />'),
  'The /download route should be registered in the route table.',
);
assert(
  /DownloadRoute\s*=\s*lazy\([\s\S]*?DownloadPage/.test(routes),
  'The /download route should resolve to the download page.',
);
assert(
  !/href="#download"/.test(app),
  'Every Download affordance should route to /download, not scroll to a section.',
);
const downloadLinks = app.match(/to="\/download"/g) ?? [];
assert(
  downloadLinks.length >= 4,
  `Expected the desktop nav, mobile menu, footer and beta CTA to link to /download; found ${downloadLinks.length}.`,
);

// ── The three apps ────────────────────────────────────────────────────────
for (const slug of ['gridgo-client', 'gridgo-supplier', 'gridgo-rider']) {
  assert(links.includes(slug), `landingLinks should describe ${slug}.`);
}
const iconFiles = [
  'gridgo-client.png',
  'gridgo-supplier-lockup.png',
  'gridgo-rider-lockup.png',
];
for (const name of iconFiles) {
  assert(
    links.includes(`/app-icons/${name}`),
    `landingLinks should name /app-icons/${name}.`,
  );
  assert(
    existsSync(resolve(scriptDir, `../public/app-icons/${name}`)),
    `public/app-icons/${name} should be the launcher tile served on /download.`,
  );
}
assert(page.includes('GRIDGO_APPS'), 'The download page should render all three apps.');
assert(page.includes('app.icon'), 'Each download card should render that app’s launcher mark.');
assert(
  !/\bSmartphone\b/.test(page),
  'Download cards should show each app’s launcher mark, not a generic phone glyph.',
);

// ── Details a person needs before installing from the open web ────────────
assert(page.includes('sha256'), 'The download page should show the SHA-256 of each build.');
assert(page.includes('formatBytes'), 'The download page should show the file size.');
assert(page.includes('formatUpdated'), 'The download page should show when the build was updated.');
assert(page.includes('minimumAndroidVersion'), 'The download page should state the Android version needed.');
assert(page.includes('clipboard.writeText'), 'The checksum should be copyable.');
assert(/Coming soon/.test(page), 'An app with no published build should degrade to a clear state.');

// Sidecars and APKs are read from the server, never hardcoded or committed.
assert(
  releases.includes('downloadsBasePath'),
  'Build details should be read from the mounted downloads directory.',
);
assert(
  !/[0-9a-f]{64}/.test(page),
  'Checksums must come from the sidecar, never be hardcoded in the page.',
);

// ── Serving ───────────────────────────────────────────────────────────────
assert(
  nginx.includes('application/vnd.android.package-archive'),
  'nginx should serve APKs with the Android package content type.',
);
assert(
  nginx.includes('/srv/gridgo-downloads'),
  'nginx should serve the mounted downloads directory.',
);
assert(
  /\.\.\/downloads:\/srv\/gridgo-downloads:ro/.test(compose),
  'The downloads directory should be mounted read-only.',
);
