/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GRIDGO API base, including the `/api` prefix. */
  readonly VITE_API_URL?: string;
  /** Partner + operations dashboard. */
  readonly VITE_DASHBOARD_URL?: string;
  /** `"true"` once the API implements `POST /support-tickets`. */
  readonly VITE_SUPPORT_TICKETS_ENABLED?: string;
  /** Community link. Unset means the CTA is not rendered. */
  readonly VITE_GRID_COMMUNITY_URL?: string;
  /** Android download URLs. Unset means "not published yet". */
  readonly VITE_CLIENT_APK_URL?: string;
  readonly VITE_SUPPLIER_APK_URL?: string;
  readonly VITE_RIDER_APK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
