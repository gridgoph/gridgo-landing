/**
 * The early-access sign-up (Google Play for Android, TestFlight for iPhone),
 * without React or the network, so the check scripts can import it directly
 * (scripts/check-early-access.mjs).
 *
 * Contract: gridgo-api `docs/EARLY_ACCESS_API.md`.
 */

export type EarlyAccessStatus = 'pending' | 'granted';

/** The API's own values. Android is the default, as it is on the API. */
export type Platform = 'android' | 'iphone';
export const DEFAULT_PLATFORM: Platform = 'android';

/**
 * Which app the sign-up is for. `customer` is the GRIDGO app people order
 * prints with; `shop` is GRIDGO for shops (the supplier app). The API's own
 * values; customer is the default there too.
 */
export type EarlyApp = 'customer' | 'shop';
export const DEFAULT_APP: EarlyApp = 'customer';

/** Anything the API (or old storage) sends that is not shop is the customer app. */
export function parseApp(raw: unknown): EarlyApp {
  return raw === 'shop' ? 'shop' : 'customer';
}

/**
 * `?app=shop` on a link preselects the shop app. `supplier` is accepted too,
 * since that is the app's name everywhere else. Anything else picks nothing.
 */
export function appFromSearch(search: string): EarlyApp | null {
  const value = new URLSearchParams(search).get('app')?.trim().toLowerCase();
  if (value === 'shop' || value === 'shops' || value === 'supplier') return 'shop';
  if (value === 'customer') return 'customer';
  return null;
}

/** Where every "for print shops" link on the site goes. */
export const SHOP_EARLY_ACCESS_PATH = '/download?app=shop#early-access';

/** The two apps as the choice at the top of Early Access names them. */
export const APP_CHOICES: { value: EarlyApp; name: string; who: string }[] = [
  { value: 'customer', name: 'GRIDGO', who: 'I order prints' },
  { value: 'shop', name: 'GRIDGO for shops', who: 'I run or work at a print shop' },
];

/** The shop app is Android-only for now; an iPhone shop is told when it comes. */
export const SHOP_IPHONE_NOTE =
  'GRIDGO for shops is Android-only for now. Leave your email and we will tell you first when it comes to iPhone.';

/** Shown beside the shop steps: one sign-up per person, not per shop. */
export const SHOP_TEAM_NOTE =
  'Owners and staff can both join. Staff: ask your owner for the shop invite after you install.';

/** The four shop steps beside the form. The last two are what the test asks of a shop. */
export const SHOP_STEPS: string[] = [
  'Enter the email you use on Google Play.',
  'We add you to the shop tester group and email your invite.',
  'Install GRIDGO for shops, sign in and set up your shop.',
  'Keep it installed for 14 days and take test jobs.',
];

/** The shop version of the form, per phone. iPhone is a notify-me, not an invite. */
export const SHOP_FORM_COPY: Record<
  Platform,
  { label: string; placeholder: string; hint: string; consent: string; invalidEmail: string; button: string; busy: string }
> = {
  android: {
    label: 'Google Play email',
    placeholder: 'name@gmail.com',
    hint: 'The one signed in to the Play Store on your Android phone.',
    consent: 'Add this email to the GRIDGO for shops Google Play test and email me the invite.',
    invalidEmail: 'Enter the full email you use on Google Play, like name@gmail.com.',
    button: 'Join as a test shop',
    busy: 'Joining…',
  },
  iphone: {
    label: 'Email',
    placeholder: 'name@example.com',
    hint: 'We only use it to tell you when the shop app is on iPhone.',
    consent: 'Email me when GRIDGO for shops is on iPhone.',
    invalidEmail: 'Enter your full email, like name@example.com.',
    button: 'Notify my shop',
    busy: 'Saving…',
  },
};

/** The API's limit on the optional shop name, in characters. */
export const SHOP_NAME_MAX = 80;

/** The section beside the form, per app. */
export const SECTION_COPY: Record<EarlyApp, { title: string; intro: string }> = {
  customer: { title: 'Early Access', intro: 'For the GRIDGO customer app.' },
  shop: {
    title: 'Early Access for print shops',
    intro: 'Test the GRIDGO shop app before launch and get print jobs from customers near you. Free.',
  },
};

/** Anything the API (or old storage) sends that is not iPhone is Android. */
export function parsePlatform(raw: unknown): Platform {
  return raw === 'iphone' ? 'iphone' : 'android';
}

/** Apple's TestFlight app on the Philippine App Store. Opens in a new tab. */
export const TESTFLIGHT_URL = 'https://apps.apple.com/ph/app/testflight/id899247664';

/** What the form says for each phone. Only the Android copy names Google Play. */
export const FORM_COPY: Record<
  Platform,
  { label: string; placeholder: string; hint: string; consent: string; invalidEmail: string }
> = {
  android: {
    label: 'Google Play email',
    placeholder: 'name@gmail.com',
    hint: 'The one signed in to the Play Store on your Android phone.',
    consent: "Add this email to GRIDGO's Google Play test and email me the invite.",
    invalidEmail: 'Enter the full email you use on Google Play, like name@gmail.com.',
  },
  iphone: {
    label: 'Apple ID email',
    placeholder: 'name@icloud.com',
    hint: 'The one signed in to the App Store on your iPhone.',
    consent: "Add this email to GRIDGO's TestFlight test so Apple can email me the invite.",
    invalidEmail: 'Enter the full email of your Apple ID, like name@icloud.com.',
  },
};

/** What happens after the button, shown beside the form where there is room. */
export const SIGN_UP_STEPS: Record<Platform, string[]> = {
  android: [
    'Enter the email you use on Google Play.',
    'We add you to the tester group and email your invite.',
    'Open the invite and install GRIDGO from Google Play.',
  ],
  iphone: [
    'Install TestFlight from the App Store.',
    'Enter the email of your Apple ID.',
    'Wait about 5 minutes for your TestFlight invite.',
    'Open the invite and install GRIDGO in TestFlight.',
  ],
};

/** The waiting page's progress list for each phone. */
export const WAITING_STEPS: Record<Platform, string[]> = {
  android: ['Request received', 'Adding you to the tester group', 'Sending your Google Play invite'],
  iphone: ['Request received', 'Adding you as a TestFlight tester', 'Apple emails your TestFlight invite'],
};

/** A shop waits on Android only; an iPhone shop is a notify-me with nothing to wait for. */
export const SHOP_WAITING_STEPS: string[] = [
  'Request received',
  'Adding you to the shop tester group',
  'Sending your GRIDGO for shops invite',
];

/** The team adds the tester within minutes; the countdown is that promise. */
export const SETUP_SECONDS = 5 * 60;
/** Past this, a pending invite is most likely sitting in Spam. */
export const SPAM_HINT_SECONDS = 15 * 60;
export const POLL_MS = 30_000;

export const STORAGE_KEY = 'gridgo-early-access';
/** One email can join both apps, so each app keeps its own token on this device. */
export const SHOP_STORAGE_KEY = 'gridgo-early-access-shop';
export function storageKey(app: EarlyApp): string {
  return app === 'shop' ? SHOP_STORAGE_KEY : STORAGE_KEY;
}
export const SOURCE_KEY = 'gridgo-src';

/** The page a status link and a returning visitor land on. */
export function statusPath(token: string): string {
  return `/early-access/status?token=${encodeURIComponent(token)}`;
}

/**
 * `?src=booth` on any incoming link. A short slug only: anything else is
 * dropped rather than sent, since it ends up in the team's sign-up list.
 */
export function sanitizeSource(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim().toLowerCase();
  return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(value) ? value : null;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * The POST /early-access body. `platform` is always sent: the live API has
 * accepted "android" since the first release, and "iphone" needs the API
 * that knows it (gridgo-api#406), which answers invalid_platform otherwise.
 */
export function signUpBody(input: {
  email: string;
  source: string | null;
  platform: Platform;
  app?: EarlyApp;
  shopName?: string;
}) {
  // A customer sign-up sends exactly what it always has: the API defaults
  // `app` to customer, so the customer request does not change at all.
  const shop = input.app === 'shop';
  const shopName = shop ? cleanShopName(input.shopName) : null;
  return {
    email: normalizeEmail(input.email),
    consent: true as const,
    platform: input.platform,
    ...(shop ? { app: 'shop' as const } : {}),
    ...(shopName ? { shopName } : {}),
    ...(input.source ? { source: input.source } : {}),
  };
}

/** Trimmed, control characters dropped; blank is no name. The API checks the length. */
export function cleanShopName(raw: string | null | undefined): string | null {
  // eslint-disable-next-line no-control-regex
  const value = (raw ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').trim();
  return value ? value : null;
}

/** Deliberately loose: the API validates for real. This catches typos only. */
export function looksLikeEmail(raw: string): boolean {
  const value = normalizeEmail(raw);
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** The Play opt-in link is shown as a button, so only an https URL is used. */
export function safeOptInUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export type StoredSignUp = {
  token: string;
  /** Which app this token is for. Tokens stored before shops existed are the customer app's. */
  app: EarlyApp;
  /** When the request was made, so the countdown survives a reload. */
  createdAt: string;
  /** Which phone's steps to show before the status check answers. */
  platform: Platform;
};

export function parseStored(raw: string | null): StoredSignUp | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredSignUp>;
    if (typeof value.token !== 'string' || !value.token) return null;
    const createdAt =
      typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt))
        ? value.createdAt
        : new Date().toISOString();
    return { token: value.token, app: parseApp(value.app), createdAt, platform: parsePlatform(value.platform) };
  } catch {
    return null;
  }
}

export type WaitingPhase = {
  /** Seconds left on the 5:00 countdown, never below zero. */
  remaining: number;
  /** The invite has been pending long enough to suggest Spam and the APK. */
  showSpamHint: boolean;
};

export function waitingPhase(createdAt: string, now: number): WaitingPhase {
  const started = Date.parse(createdAt);
  const elapsed = Number.isNaN(started) ? 0 : Math.max(0, (now - started) / 1000);
  return {
    remaining: Math.max(0, Math.ceil(SETUP_SECONDS - elapsed)),
    showSpamHint: elapsed >= SPAM_HINT_SECONDS,
  };
}

export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/** How many of the nine grid dots are lit: the countdown, drawn as the GRIDGO mark. */
export function litDots(remaining: number, status: EarlyAccessStatus): number {
  if (status === 'granted') return 9;
  const done = 1 - remaining / SETUP_SECONDS;
  // The first dot is the request itself, already received.
  return Math.min(8, 1 + Math.floor(done * 8));
}

/** The API's error code, mapped to a sentence a visitor can act on. */
export function signUpErrorMessage(
  status: number,
  code: string | undefined,
  platform: Platform = DEFAULT_PLATFORM,
  app: EarlyApp = DEFAULT_APP,
): string {
  if (code === 'consent_required') return 'Tick the box to agree before you continue.';
  // Shop sign-ups closed on the server (or an API that predates them): the
  // form shows SHOP_OPENS_SOON instead of this sentence; it is the fallback.
  if (code === 'shop_early_access_disabled' || code === 'invalid_app') return SHOP_OPENS_SOON.body;
  if (code === 'invalid_shop_name') return `Keep the shop name to ${SHOP_NAME_MAX} characters, letters and numbers only.`;
  if (app === 'shop' && (code === 'invalid_email' || code === 'email_invalid' || (status === 400 && !code))) {
    return SHOP_FORM_COPY[platform].invalidEmail;
  }
  // An API that predates iPhone sign-up answers this way; Android still works.
  if (code === 'invalid_platform') return 'iPhone sign-up is not open yet. Try again soon.';
  if (code === 'invalid_email' || code === 'email_invalid' || status === 400) {
    return FORM_COPY[platform].invalidEmail;
  }
  if (status === 429) return 'Too many sign-ups from this connection. Try again in an hour.';
  return 'Sign-up is not working right now. Try again in a few minutes.';
}

/**
 * The server refuses shop sign-ups until a Super Admin turns them on
 * (`409 shop_early_access_disabled`). That is not the visitor's mistake, so
 * the form says so kindly instead of showing an error.
 */
export const SHOP_OPENS_SOON = {
  title: 'Shop testing opens soon',
  body: 'We are getting the shop test ready and are not taking shops just yet. Nothing was saved. Come back to this page in a few days and join in a minute.',
};

/** The sign-up error codes that mean "shops are not open yet", not "you made a mistake". */
export function isShopClosed(code: string | undefined): boolean {
  return code === 'shop_early_access_disabled' || code === 'invalid_app';
}

/** The small line under every early-access button. */
export const EARLY_ACCESS_NOTE = 'Open now. Takes about 5 minutes. Free.';
