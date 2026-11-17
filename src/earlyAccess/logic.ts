/**
 * The Google Play early-access sign-up, without React or the network, so the
 * check scripts can import it directly (scripts/check-early-access.mjs).
 *
 * Contract: gridgo-api `docs/EARLY_ACCESS_API.md`.
 */

export type EarlyAccessStatus = 'pending' | 'granted';

/** Google adds the tester within minutes; the countdown is that promise. */
export const SETUP_SECONDS = 5 * 60;
/** Past this, a pending invite is most likely sitting in Spam. */
export const SPAM_HINT_SECONDS = 15 * 60;
export const POLL_MS = 30_000;

export const STORAGE_KEY = 'gridgo-early-access';
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
  /** When the request was made, so the countdown survives a reload. */
  createdAt: string;
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
    return { token: value.token, createdAt };
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
export function signUpErrorMessage(status: number, code: string | undefined): string {
  if (code === 'consent_required') return 'Tick the box to agree before you continue.';
  if (code === 'invalid_email' || code === 'email_invalid' || status === 400) {
    return 'Enter the full email you use on Google Play, like name@gmail.com.';
  }
  if (status === 429) return 'Too many sign-ups from this connection. Try again in an hour.';
  return 'Sign-up is not working right now. Try again in a few minutes.';
}

/** The small line under every early-access button. */
export const EARLY_ACCESS_NOTE = 'Open now. Takes about 5 minutes. Free.';
