/**
 * GRIDGO API origin used by the public ticket form and `/desk`.
 *
 * Production is `https://gridgo-api.talasora.com` with no trailing `/api`.
 * The live API serves `/support-tickets` at that origin (and also under
 * `/api`). A leftover `/api` suffix posted to a path it does not serve.
 *
 * Dev may set `VITE_API_URL=/api` (Vite proxies to :8787 without stripping
 * `/api`) or call the API origin directly.
 */
function configuredApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (import.meta.env.DEV) return '/api';
  return 'https://gridgo-api.talasora.com';
}

export const apiBaseUrl = configuredApiBase();
