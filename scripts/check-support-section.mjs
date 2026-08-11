import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const app = readFileSync(resolve(scriptDir, '../src/App.tsx'), 'utf8');
const main = readFileSync(resolve(scriptDir, '../src/main.tsx'), 'utf8');
const routes = readFileSync(resolve(scriptDir, '../src/routes.tsx'), 'utf8');
const support = readFileSync(resolve(scriptDir, '../src/SupportPage.tsx'), 'utf8');

assert(!app.includes('Number Hub'), 'Support section should not use the placeholder "Number Hub" label.');
assert(!app.includes('Call Support Hub'), 'Support CTA should not imply a missing call hub.');
assert(!app.includes('GRIDGO AI assistant'), 'Support section should not promise an unavailable AI assistant.');
assert(!app.includes('AI handles common questions'), 'Support section should not promise unavailable live-chat automation.');

assert(app.includes('GRIDGO Ticketing Support'), 'Support section should use the production ticketing support label.');
assert(app.includes('Submit a Ticket Now'), 'Support section should route users into the ticket flow.');
assert(app.includes('Human-led responses'), 'Support section should set expectations for human-led support.');
assert(app.includes('Fast resolution'), 'Support section should include the current support promise.');

const supportLinks = app.match(/to="\/support"/g) ?? [];
assert(supportLinks.length >= 1, 'The support CTA should route to /support.');
// The routes are lazy-loaded (see src/routes.tsx), so /support is wired in two
// places: the route table and the chunk it resolves to.
assert(
  main.includes('<Route path="/support" element={<SupportRoute />} />'),
  'The /support route should be registered in the route table.',
);
assert(
  /SupportRoute\s*=\s*lazy\([\s\S]*?SupportPage/.test(routes),
  'The /support route should resolve to the support ticket page.',
);
assert(
  main.includes('<Route path="/download" element={<DownloadRoute />} />'),
  'The /download route should be registered in the route table.',
);

// The GRIDGO API has no POST /support-tickets endpoint yet, so the ticket form
// must stay behind a build-time flag rather than shipping a form that 404s.
assert(
  support.includes('supportTicketsEnabled'),
  'The support page should gate its form on supportTicketsEnabled().',
);
assert(
  support.includes('TicketingNotOpenYet'),
  'The support page should show an honest "not open yet" state when ticketing is off.',
);
assert(
  app.includes('supportTicketsEnabled() ? \'Submit a Ticket Now\''),
  'The landing CTA label should reflect whether ticketing is actually open.',
);
assert(
  !support.includes('192.168.'),
  'The support page must not point at a LAN address from the legacy codebase.',
);
