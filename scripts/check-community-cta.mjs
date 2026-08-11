import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const app = readFileSync(resolve(scriptDir, '../src/App.tsx'), 'utf8');
const links = readFileSync(resolve(scriptDir, '../src/utils/landingLinks.ts'), 'utf8');

assert(
  links.includes('VITE_GRID_COMMUNITY_URL'),
  'The community URL should be configured with VITE_GRID_COMMUNITY_URL.',
);
assert(
  links.includes('communityUrl'),
  'landingLinks() should expose the resolved community URL.',
);

// The handle the page shipped with resolves the same way a non-existent one
// does, so there must be no baked-in fallback that would ship a dead CTA.
assert(
  !links.includes('m.me/'),
  'The community URL must not fall back to the legacy Messenger handle, which does not resolve.',
);
assert(
  /communityUrl\s*=\s*[\s\S]{0,120}\|\|\s*null/.test(links),
  'The community URL should come only from configuration, defaulting to null.',
);

assert(
  app.includes('Join GRID Community'),
  'The GRID Community CTA should still exist for when a URL is configured.',
);
assert(
  app.includes('href={communityUrl}'),
  'The community CTA should use the configured URL.',
);
assert(
  app.includes('target="_blank"'),
  'The community CTA should open externally.',
);
assert(
  /\{communityUrl && \(/.test(app),
  'The community CTA must only render when a community URL is configured.',
);
