/**
 * Writes /privacy and /delete-account into the build as real HTML.
 *
 * Google Play's reviewers may fetch these URLs without running JavaScript, and
 * an SPA shell is an empty <div id="root">. This renders each legal route with
 * the same component tree the browser uses (src/AppRoutes.tsx, via
 * src/prerender.ts), puts the result inside dist/index.html's #root, and saves
 * it as dist/<route>.html. nginx serves that file for the bare path
 * (`try_files $uri $uri.html ...` in deploy/nginx.conf), and the browser
 * hydrates it (src/main.tsx).
 *
 * Runs after `vite build`, as part of `npm run build`.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const EMPTY_ROOT = '<div id="root"></div>';
assert(template.includes(EMPTY_ROOT), 'dist/index.html should have an empty #root to fill.');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// useTheme() defaults to dark and applies the class after hydration. Applying
// it before first paint stops a dark-mode reader seeing the page flash white.
// Without JavaScript the page simply stays light.
const THEME_SCRIPT =
  "<script>(function(){var d=document.documentElement;try{if(localStorage.getItem('theme')!=='light')d.classList.add('dark')}catch(e){d.classList.add('dark')}})()</script>";

const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
});

try {
  const { renderRoute, LEGAL_PAGES, PRIVACY_CONTACT } = await vite.ssrLoadModule('/src/prerender.ts');
  for (const page of LEGAL_PAGES) {
    const body = await renderRoute(page.path);
    assert(body.includes('<h1'), `${page.path} rendered without its heading; got the Suspense fallback?`);
    assert(body.includes(PRIVACY_CONTACT), `${page.path} should name the privacy contact in its HTML.`);

    const head = [
      `<title>${escapeHtml(page.title)}</title>`,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
      `<link rel="canonical" href="https://gridgo.talasora.com${page.path}" />`,
      THEME_SCRIPT,
    ].join('\n  ');
    const html = template
      .replace(/<title>[^<]*<\/title>/, () => head)
      .replace(EMPTY_ROOT, () => `<div id="root">${body}</div>`);

    const out = resolve(dist, `.${page.path}.html`);
    writeFileSync(out, html);
    console.log(`prerendered ${page.path} -> dist${page.path}.html (${Math.round(html.length / 1024)} KB)`);
  }
} finally {
  await vite.close();
}
