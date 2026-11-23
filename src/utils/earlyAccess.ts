import { apiBaseUrl } from './apiBase';

export type EarlyAccessStatus = 'pending' | 'granted';

export type EarlyAccessResult = {
  ok: boolean;
  isNew?: boolean;
  status: EarlyAccessStatus;
  signup: {
    id: string;
    email: string;
    status: EarlyAccessStatus;
    createdAt: string;
    grantedAt: string | null;
  };
};

export type EarlyAccessStatusResult = {
  ok: boolean;
  id: string;
  email: string;
  status: EarlyAccessStatus;
  createdAt: string;
  grantedAt: string | null;
  optInUrl: string | null;
};

const STORAGE_KEY = 'gridgo_early_access_email';

export function getStoredEarlyAccessEmail(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredEarlyAccessEmail(email: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
  } catch {
    // Ignore storage issues
  }
}

export function clearStoredEarlyAccessEmail(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage issues
  }
}

export async function submitEarlyAccessRequest(
  email: string,
  consent: boolean,
  source = 'web',
): Promise<EarlyAccessResult> {
  const normEmail = email.trim().toLowerCase();
  const res = await fetch(`${apiBaseUrl}/public/early-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normEmail,
      consent,
      source,
      app: 'client',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error || 'submission_failed');
  }

  const data = (await res.json()) as EarlyAccessResult;
  setStoredEarlyAccessEmail(normEmail);
  return data;
}

export async function checkEarlyAccessStatus(
  email: string,
): Promise<EarlyAccessStatusResult> {
  const normEmail = email.trim().toLowerCase();
  const res = await fetch(
    `${apiBaseUrl}/public/early-access/status?email=${encodeURIComponent(normEmail)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    throw new Error('status_check_failed');
  }

  return (await res.json()) as EarlyAccessStatusResult;
}
