/**
 * The ticketing desk is a landing SPA route at /desk. It talks to gridgo-api.
 * Tickets are not stored here, and there is no sidecar Express/Supabase app.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(scriptDir, p), 'utf8');

const main = read('../src/main.tsx');
const routes = read('../src/routes.tsx');
const api = read('../src/desk/api.ts');
const desk = read('../src/desk/DeskPage.tsx');
const mark = read('../src/desk/Mark.tsx');
const apiBase = read('../src/utils/apiBase.ts');
const support = read('../src/SupportPage.tsx');
const deploy = read('../.github/workflows/deploy.yml');
const vite = read('../vite.config.ts');
const dockerfile = read('../Dockerfile');

assert(
  !existsSync(resolve(scriptDir, '../admin')),
  'Do not ship Ven’s sidecar admin/ (Express, Supabase, second Vite app).',
);

assert(
  main.includes('<Route path="/desk" element={<DeskRoute />} />'),
  'The /desk route should be registered in the route table.',
);
assert(
  /DeskRoute\s*=\s*lazy\([\s\S]*?DeskPage/.test(routes),
  'The /desk route should resolve to the ticketing desk page.',
);

assert(
  apiBase.includes("return 'https://gridgo-api.talasora.com'"),
  'The production API fallback should be https://gridgo-api.talasora.com.',
);
assert(
  !apiBase.includes('gridgo-api.talasora.com/api'),
  'The API base must not include a trailing /api.',
);
assert(
  api.includes('apiBaseUrl') && support.includes('apiBaseUrl'),
  'The public form and the desk should share the API origin helper.',
);
assert(
  api.includes("Authorization") && api.includes('Bearer'),
  'Desk writes should send the admin session as a Bearer token.',
);
assert(api.includes('setTokenProvider'), 'Desk requests should attach the Clerk session token.');
assert(desk.includes('@clerk/react'), 'The desk should sign in with Clerk.');
assert(desk.includes('gridgo26@gmail.com'), 'The desk should only accept the support Gmail.');
assert(!api.includes('/admin/login'), 'The desk should not post a username and password.');
assert(
  /^ARG VITE_CLERK_PUBLISHABLE_KEY$/m.test(dockerfile) &&
    /VITE_CLERK_PUBLISHABLE_KEY=\$VITE_CLERK_PUBLISHABLE_KEY/.test(dockerfile),
  'The image build must receive VITE_CLERK_PUBLISHABLE_KEY, or production /desk cannot sign in.',
);
assert(
  deploy.includes('VITE_CLERK_PUBLISHABLE_KEY=${{ env.VITE_CLERK_PUBLISHABLE_KEY }}'),
  'deploy.yml should pass the Clerk publishable key to the image build.',
);
assert(api.includes('replyMessage'), 'Desk replies should send replyMessage.');
assert(api.includes('emailSent'), 'Desk should read emailSent from a reply.');
assert(desk.includes('listTickets'), 'Desk should list tickets.');
assert(desk.includes('replyToTicket'), 'Desk should reply to a ticket.');
assert(desk.includes('deleteTicket'), 'Desk should delete a closed ticket.');
assert(mark.includes('#8A8A8A'), 'Launcher middle-right should be #8A8A8A.');

assert(
  /VITE_API_URL:\s*https:\/\/gridgo-api\.talasora\.com\s*$/m.test(deploy),
  'deploy.yml VITE_API_URL should be https://gridgo-api.talasora.com with no /api suffix.',
);
assert(
  deploy.includes('/desk'),
  'The image smoke test should hit /desk so the SPA fallback is proven.',
);

assert(
  vite.includes("target: 'http://127.0.0.1:8787'"),
  'Vite should proxy /api to gridgo-api on :8787 in dev.',
);
assert(
  !/rewrite\s*:/.test(vite),
  'The Vite /api proxy must not strip /api from the path.',
);
const whiteFields = [...support.matchAll(/className="bg-white[^"]+"/g)].map((match) => match[0]);
assert(
  whiteFields.length >= 5,
  'Support form fields should stay white in dark mode so typed text is readable.',
);
for (const cls of whiteFields) {
  assert(cls.includes('text-black'), 'White support fields should keep black typed text.');
  assert(!cls.includes('dark:text-white'), 'White support fields should not switch to white text in dark mode.');
}
