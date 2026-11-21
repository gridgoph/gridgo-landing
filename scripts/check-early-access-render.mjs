/**
 * Renders the whole Early Access section (/download#early-access) for each app
 * and phone, through Vite's SSR loader, and checks the HTML a visitor gets:
 * the steps beside the form as well as the form itself (review of
 * gridgoph/gridgo-landing#54: an iPhone shop was still shown the Android steps).
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';
// Loaded natively: Vite's SSR loader externalizes these, so the section uses the same copies.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
});

/** Visible text only, with the markup's whitespace collapsed. */
const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

try {
  const { EarlyAccessSection } = await vite.ssrLoadModule('/src/DownloadPage.tsx');
  const logic = await vite.ssrLoadModule('/src/earlyAccess/logic.ts');

  const render = (url, platform) =>
    text(
      renderToStaticMarkup(
        createElement(MemoryRouter, { initialEntries: [url] }, createElement(EarlyAccessSection, { initialPlatform: platform })),
      ),
    );

  // ── Shop on iPhone: a notify-me, top to bottom ─────────────────────────
  const shopIphone = render('/download?app=shop', 'iphone');
  assert(shopIphone.includes('Which app do you want to test?'), 'The app choice is rendered.');
  assert(shopIphone.includes('Early Access for print shops'));
  for (const step of logic.SHOP_IPHONE_STEPS) assert(shopIphone.includes(step), `iPhone shop step shown: ${step}`);
  for (const step of logic.SHOP_STEPS) assert(!shopIphone.includes(step), `An iPhone shop is not shown the Android step: ${step}`);
  for (const phrase of ['Google Play', 'tester group', 'email your invite', '14 days', 'Install GRIDGO', 'shop invite after you install']) {
    assert(!shopIphone.includes(phrase), `Nothing in the iPhone shop section promises an Android invite or install ("${phrase}").`);
  }
  assert(shopIphone.includes(logic.SHOP_IPHONE_NOTE), 'The Android-only note is shown.');
  assert(shopIphone.includes(logic.SHOP_FORM_COPY.iphone.consent));
  assert(shopIphone.includes('Notify my shop') && !shopIphone.includes('Join as a test shop'));
  assert(!shopIphone.includes('TestFlight'), 'The shop app is not on TestFlight.');

  // ── Shop on Android: the four steps, the team note, the join button ──────
  const shopAndroid = render('/download?app=shop', 'android');
  for (const step of logic.SHOP_STEPS) assert(shopAndroid.includes(step), `Android shop step shown: ${step}`);
  assert(shopAndroid.includes(logic.SHOP_TEAM_NOTE));
  assert(shopAndroid.includes('Join as a test shop') && shopAndroid.includes('Google Play email'));
  assert(shopAndroid.includes('Shop name'));

  // ── Customer: as before ───────────────────────────────────────────────
  const customerAndroid = render('/download', 'android');
  for (const step of logic.SIGN_UP_STEPS.android) assert(customerAndroid.includes(step));
  assert(customerAndroid.includes('Get Early Access') && !customerAndroid.includes('Shop name'));
  assert(!customerAndroid.includes(logic.SHOP_TEAM_NOTE));
  const customerIphone = render('/download', 'iphone');
  for (const step of logic.SIGN_UP_STEPS.iphone) assert(customerIphone.includes(step));
  assert(customerIphone.includes('Apple ID email') && customerIphone.includes('TestFlight'));
  assert(!customerIphone.includes(logic.SHOP_IPHONE_NOTE));

  console.log('Early Access section rendered for customer and shop, Android and iPhone: passed');
} finally {
  await vite.close();
}
