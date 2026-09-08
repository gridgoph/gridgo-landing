/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GRIDGO API origin. No trailing `/api` — the live API serves `/support-tickets` at the origin. */
  readonly VITE_API_URL?: string;
  /** Partner + operations dashboard. */
  readonly VITE_DASHBOARD_URL?: string;
  /** Community link. Unset means the CTA is not rendered. */
  readonly VITE_GRID_COMMUNITY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
