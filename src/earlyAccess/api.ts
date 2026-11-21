import { apiBaseUrl } from '../utils/apiBase';
import {
  DEFAULT_APP,
  parseApp,
  parsePlatform,
  parseStored,
  storageKey,
  safeOptInUrl,
  signUpErrorMessage,
  SOURCE_KEY,
  sanitizeSource,
  signUpBody,
  type EarlyAccessStatus,
  type EarlyApp,
  type Platform,
  type StoredSignUp,
} from './logic';

export type SignUpResult = {
  token: string;
  /** The stored app: an API that predates shops says nothing, which means customer. */
  app: EarlyApp;
  /** The stored phone: a repeat sign-up keeps the first one. */
  platform: Platform;
  status: EarlyAccessStatus;
  createdAt: string;
  grantedAt: string | null;
  duplicate: boolean;
};

export type StatusResult = {
  /** Absent from an API that predates shop sign-up; the stored app stands in. */
  app?: EarlyApp;
  /** Absent from an API that predates iPhone sign-up; the stored phone stands in. */
  platform?: Platform;
  status: EarlyAccessStatus;
  grantedAt: string | null;
  optInUrl: string | null;
  /** Not in the first contract; used when the API sends it. */
  createdAt?: string;
};

export class EarlyAccessError extends Error {
  readonly status: number;
  /** The API's error code, when it sent one. */
  readonly code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function asStatus(value: unknown): EarlyAccessStatus {
  return value === 'granted' ? 'granted' : 'pending';
}

export async function signUp(input: {
  email: string;
  source: string | null;
  platform: Platform;
  app?: EarlyApp;
  shopName?: string;
}): Promise<SignUpResult> {
  const app = input.app ?? DEFAULT_APP;
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/early-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signUpBody(input)),
    });
  } catch {
    throw new EarlyAccessError(
      'Could not reach GRIDGO. Check your connection and try again.',
      0,
    );
  }
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || typeof body.token !== 'string' || !body.token) {
    const code = typeof body.error === 'string' ? body.error : typeof body.code === 'string' ? body.code : undefined;
    throw new EarlyAccessError(signUpErrorMessage(response.status, code, input.platform, app), response.status, code);
  }
  return {
    token: body.token,
    app: body.app === undefined ? app : parseApp(body.app),
    platform: body.platform === undefined ? input.platform : parsePlatform(body.platform),
    status: asStatus(body.status),
    createdAt: typeof body.createdAt === 'string' ? body.createdAt : new Date().toISOString(),
    grantedAt: typeof body.grantedAt === 'string' ? body.grantedAt : null,
    duplicate: body.duplicate === true,
  };
}

/** 404 means the token is unknown: the caller forgets it. */
export async function fetchStatus(token: string): Promise<StatusResult> {
  const response = await fetch(
    `${apiBaseUrl}/early-access/status?token=${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new EarlyAccessError('status_failed', response.status);
  return {
    ...(body.app === undefined ? {} : { app: parseApp(body.app) }),
    ...(body.platform === undefined ? {} : { platform: parsePlatform(body.platform) }),
    status: asStatus(body.status),
    grantedAt: typeof body.grantedAt === 'string' ? body.grantedAt : null,
    optInUrl: safeOptInUrl(body.optInUrl),
    ...(typeof body.createdAt === 'string' ? { createdAt: body.createdAt } : {}),
  };
}

// ── Browser storage. Every access is guarded: private windows throw. ────────

/** This device's sign-up for one app. Each app keeps its own, so one email can join both. */
export function readSignUp(app: EarlyApp = DEFAULT_APP): StoredSignUp | null {
  try {
    const stored = parseStored(localStorage.getItem(storageKey(app)));
    // The key decides the app: a customer token stored before shops existed has no field.
    return stored ? { ...stored, app } : null;
  } catch {
    return null;
  }
}

/** Whichever of this device's sign-ups carries `token`, for the status page. */
export function readSignUpByToken(token: string | null): StoredSignUp | null {
  if (!token) return null;
  for (const app of ['customer', 'shop'] as const) {
    const stored = readSignUp(app);
    if (stored?.token === token) return stored;
  }
  return null;
}

export function storeSignUp(value: StoredSignUp): void {
  try {
    localStorage.setItem(storageKey(value.app), JSON.stringify(value));
  } catch {
    // The status link still works; a return visit just will not find it.
  }
}

export function forgetSignUp(app: EarlyApp = DEFAULT_APP): void {
  try {
    localStorage.removeItem(storageKey(app));
  } catch {
    // Nothing stored, nothing to forget.
  }
}

/** Remember `?src=` from whichever page the visitor arrived on. */
export function rememberSource(search: string): void {
  const source = sanitizeSource(new URLSearchParams(search).get('src'));
  if (!source) return;
  try {
    sessionStorage.setItem(SOURCE_KEY, source);
  } catch {
    // Without storage the source is only kept while it is in the URL.
  }
}

export function currentSource(search: string): string | null {
  const fromUrl = sanitizeSource(new URLSearchParams(search).get('src'));
  if (fromUrl) return fromUrl;
  try {
    return sanitizeSource(sessionStorage.getItem(SOURCE_KEY));
  } catch {
    return null;
  }
}
