import { apiBaseUrl } from '../utils/apiBase';
import {
  normalizeEmail,
  parseStored,
  safeOptInUrl,
  signUpErrorMessage,
  SOURCE_KEY,
  STORAGE_KEY,
  sanitizeSource,
  type EarlyAccessStatus,
  type StoredSignUp,
} from './logic';

export type SignUpResult = {
  token: string;
  status: EarlyAccessStatus;
  createdAt: string;
  grantedAt: string | null;
  duplicate: boolean;
};

export type StatusResult = {
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
}): Promise<SignUpResult> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/early-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizeEmail(input.email),
        consent: true,
        platform: 'android',
        ...(input.source ? { source: input.source } : {}),
      }),
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
    throw new EarlyAccessError(signUpErrorMessage(response.status, code), response.status);
  }
  return {
    token: body.token,
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
