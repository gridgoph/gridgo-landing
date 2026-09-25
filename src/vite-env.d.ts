/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GRIDGO API origin. No trailing `/api` — the live API serves `/support-tickets` at the origin. */
  readonly VITE_API_URL?: string;
  /** Partner + operations dashboard. */
  readonly VITE_DASHBOARD_URL?: string;
  /** Community link. Unset means the CTA is not rendered. */
  readonly VITE_GRID_COMMUNITY_URL?: string;
  /** GRIDGO Clerk publishable key. The /desk route is the only consumer. */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
