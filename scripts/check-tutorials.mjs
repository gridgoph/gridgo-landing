/**
 * /tutorials: the four app walkthroughs, reachable from the header and footer,
 * with the videos served from the server's media folder rather than from git.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

const app = read('src/App.tsx');
const routeTable = read('src/AppRoutes.tsx');
const routes = read('src/routes.tsx');
const page = read('src/TutorialsPage.tsx');
const data = read('src/utils/tutorials.ts');
const nginx = read('deploy/nginx.conf');
const compose = read('deploy/docker-compose.yml');
const dockerfile = read('Dockerfile');
const workflow = read('.github/workflows/deploy.yml');

// ── Routing ───────────────────────────────────────────────────────────────
assert(
  routeTable.includes('<Route path="/tutorials" element={<TutorialsRoute />} />'),
  'The /tutorials route should be registered in the route table.',
);
assert(
  /TutorialsRoute\s*=\s*lazy\([\s\S]*?TutorialsPage/.test(routes),
  'The /tutorials route should resolve to the tutorials page.',
);
assert(
  /<Route path="\/walkthroughs" element=\{<WalkthroughsRedirect \/>\} \/>/.test(routeTable) &&
    /pathname: '\/tutorials'/.test(routeTable),
  '/walkthroughs should redirect to /tutorials.',
);

// ── Reachable from the site ───────────────────────────────────────────────
const navLinks = app.match(/to="\/tutorials"/g) ?? [];
assert(
  navLinks.length >= 3,
  `Expected the desktop nav, mobile menu and footer to link to /tutorials; found ${navLinks.length}.`,
);

// ── The videos ────────────────────────────────────────────────────────────
for (const id of ['customer', 'shop', 'rider']) {
  assert(data.includes(`id: '${id}'`), `The ${id} group should be on /tutorials.`);
}
const files = [...data.matchAll(/file: '([^']+)'/g)].map((m) => m[1]);
assert.equal(files.length, 5, 'All five tutorial videos should be listed.');
for (const file of files) {
  assert(
    /-v\d+$/.test(file),
    `${file} should carry a version: /media/ is cached as immutable, so a file is never replaced in place.`,
  );
}
assert(data.includes("mediaBasePath = '/media'"), 'Videos should be served from /media/.');
assert(page.includes('preload="metadata"'), 'Players should load only metadata up front.');
assert(page.includes('playsInline'), 'Players should play inline on phones.');
assert(page.includes('controls'), 'Players should show their controls.');
assert(page.includes('poster='), 'Each player should show its poster frame.');
assert(
  page.includes('element.error') && page.includes("addEventListener('error'"),
  'A video not yet uploaded should degrade to a clear state, even if its 404 lands before React listens.',
);

const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
assert(
  !/\.(mp4|mov|webm|m4v)$/m.test(tracked),
  'Video files must not be committed; they live in ~/gridgo/media on the server.',
);

// ── Serving ───────────────────────────────────────────────────────────────
const media = nginx.match(/location \^~ \/media\/ \{[\s\S]*?\n {4}\}/)?.[0] ?? '';
assert(media, 'nginx should serve /media/ with a ^~ prefix location.');
assert(media.includes('alias /srv/gridgo-media/;'), '/media/ should map to the mounted media folder.');
assert(/video\/mp4\s+mp4;/.test(media), '/media/ should serve .mp4 as video/mp4.');
assert(
  media.includes('add_header Cache-Control "public, max-age=31536000, immutable";'),
  '/media/ should be cached as immutable on success only (no `always`, so 404s are not pinned).',
);
assert(!/gzip\s+on/.test(media), 'Video must not be gzipped: it breaks byte ranges.');
assert(
  compose.includes('- ../media:/srv/gridgo-media:ro'),
  'Compose should mount ~/gridgo/media read-only.',
);
assert(dockerfile.includes('/srv/gridgo-media'), 'The image should create an empty /srv/gridgo-media.');
assert(
  workflow.includes('/media/smoke-v1.mp4') && workflow.includes('/tutorials /walkthroughs'),
  'The deploy smoke test should cover the new routes and /media/.',
);

console.log('tutorials page checks passed');
