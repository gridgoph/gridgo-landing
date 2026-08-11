/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GRIDGO API base, including the `/api` prefix. */
  readonly VITE_API_URL?: string;
  /** Partner + operations dashboard. */
  readonly VITE_DASHBOARD_URL?: string;
  /** Community link. Unset means the CTA is not rendered. */
  readonly VITE_GRID_COMMUNITY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
