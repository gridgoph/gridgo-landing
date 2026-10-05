import { apiBaseUrl } from '../utils/apiBase';

export type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  emailSent?: boolean;
};

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

export class DeskApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenProvider ? await tokenProvider() : null;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as { message?: string } & T;
  if (!response.ok) {
    throw new DeskApiError(data.message || `Request failed (${response.status})`, response.status);
  }
  return data;
}

export type DeskAccess =
  | { allowed: true; email: string }
  | { allowed: false; denied: boolean; message: string };

/**
 * gridgo-api decides who may use the desk (SUPPORT_DESK_ALLOWED_EMAILS), so the
 * screen asks it rather than keeping its own copy of the list. `denied` means
 * the API refused this account; otherwise the check itself failed and a retry
 * may help.
 */
export async function checkDeskAccess(): Promise<DeskAccess> {
  try {
    const me = await request<{ email: string }>('/admin/me');
    return { allowed: true, email: me.email };
  } catch (caught) {
    const status = caught instanceof DeskApiError ? caught.status : 0;
    return {
      allowed: false,
      denied: status === 401 || status === 403,
      message: caught instanceof Error && status ? caught.message : 'Could not reach the support desk API.',
    };
  }
}

export function listTickets() {
  return request<Ticket[]>('/support-tickets');
}

export function replyToTicket(id: string, replyMessage: string) {
  return request<Ticket>(`/support-tickets/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ replyMessage }),
  });
}

export function deleteTicket(id: string) {
  return request<void>(`/support-tickets/${id}`, { method: 'DELETE' });
}
