import { apiBaseUrl } from '../utils/apiBase';
import {
  parsePlatform,
  parseStored,
  safeOptInUrl,
  signUpErrorMessage,
  SOURCE_KEY,
  STORAGE_KEY,
  sanitizeSource,
  signUpBody,
  type EarlyAccessStatus,
  type Platform,
  type StoredSignUp,
} from './logic';

export type SignUpResult = {
  token: string;
  /** The stored phone: a repeat sign-up keeps the first one. */
  platform: Platform;
  status: EarlyAccessStatus;
  createdAt: string;
  grantedAt: string | null;
  duplicate: boolean;
};

export type StatusResult = {
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
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function asStatus(value: unknown): EarlyAccessStatus {
  return value === 'granted' ? 'granted' : 'pending';
}

export async function signUp(input: {
  email: string;
  source: string | null;
  platform: Platform;
}): Promise<SignUpResult> {
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
    throw new EarlyAccessError(signUpErrorMessage(response.status, code, input.platform), response.status);
  }
  return {
    token: body.token,
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
    ...(body.platform === undefined ? {} : { platform: parsePlatform(body.platform) }),
    status: asStatus(body.status),
    grantedAt: typeof body.grantedAt === 'string' ? body.grantedAt : null,
    optInUrl: safeOptInUrl(body.optInUrl),
    ...(typeof body.createdAt === 'string' ? { createdAt: body.createdAt } : {}),
  };
}

// ── Browser storage. Every access is guarded: private windows throw. ────────

export function readSignUp(): StoredSignUp | null {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function storeSignUp(value: StoredSignUp): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The status link still works; a return visit just will not find it.
  }
}

export function forgetSignUp(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
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
