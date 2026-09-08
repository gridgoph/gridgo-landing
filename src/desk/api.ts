import { apiBaseUrl } from '../utils/apiBase';

const TOKEN_KEY = 'gridgo-ticket-desk-token';

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

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private windows can refuse storage; the session simply will not persist.
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
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

export function login(username: string, password: string) {
  return request<{ token: string; username: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function me() {
  return request<{ username: string }>('/admin/me');
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
