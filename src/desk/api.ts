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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenProvider ? await tokenProvider() : null;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as { message?: string } & T;
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
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
