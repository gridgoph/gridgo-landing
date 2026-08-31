/**
 * Where the container serves `~/gridgo/downloads` from. Each app's own build
 * writes its APK and a JSON sidecar there; this site only reads them.
 */
export const downloadsBasePath = '/downloads';

/** Minimum Android version, from the Expo SDK baseline the apps are built on. */
export const minimumAndroidVersion = '7.0';

export type AppKey = 'client' | 'supplier' | 'rider';

export type GridgoApp = {
  key: AppKey;
  /** The APK/sidecar basename on the server, without extension. */
  slug: string;
  name: string;
  audience: string;
  /** Plain language, for someone who does not know which app is theirs. */
  whoItIsFor: string;
  /**
   * Public path to this app's home-screen icon. Client uses the 3×3
   * mark; Supplier and Rider use the GRIDGO wordmark lockup with the
   * role line, matching the tiles on the phone.
   */
  icon: string;
};

export const GRIDGO_APPS: GridgoApp[] = [
  {
    key: 'client',
    slug: 'gridgo-client',
    name: 'GRIDGO',
    audience: 'For customers',
    icon: '/app-icons/gridgo-client.png',
    whoItIsFor:
      'Install this one if you want something printed — flyers, tarpaulins, shirts, plaques, anything in the catalogue. Upload your design, and it arrives at your door.',
  },
  {
    key: 'supplier',
    slug: 'gridgo-supplier',
    name: 'GRIDGO Supplier',
    audience: 'For print shops',
    icon: '/app-icons/gridgo-supplier-lockup.png',
    whoItIsFor:
      'Install this one if you run a printing shop and want GRIDGO to send you work. List what you print, take the jobs you want, and upload proof as each stage finishes.',
  },
  {
    key: 'rider',
    slug: 'gridgo-rider',
    name: 'GRIDGO Rider',
    audience: 'For riders',
    icon: '/app-icons/gridgo-rider-lockup.png',
    whoItIsFor:
      'Install this one if you deliver on a motorcycle. Accept a run, check the order at the shop before you carry it, and record the handover when you drop it off.',
  },
];

/*
 * The community CTA has no default. The Messenger handle the page shipped with
 * resolves the same way a non-existent handle does, so there is nothing safe to
 * fall back to — the CTA does not render until VITE_GRID_COMMUNITY_URL names a
 * real destination.
 */
/**
 * Where print partners, operations and admin sign in. Overridden at build time
 * by VITE_DASHBOARD_URL — and it must stay referenced by rendered markup, or
 * Vite has nothing to inline the value into and the deploy check fails.
 */
const defaultDashboardUrl = 'https://gridgo-dash.talasora.com';

export function landingLinks() {
  const communityUrl =
    import.meta.env.VITE_GRID_COMMUNITY_URL?.trim() || null;
  const dashboardUrl =
    import.meta.env.VITE_DASHBOARD_URL?.trim() || defaultDashboardUrl;

  return { communityUrl, dashboardUrl };
}
