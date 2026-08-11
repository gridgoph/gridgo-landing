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
};

export const GRIDGO_APPS: GridgoApp[] = [
  {
    key: 'client',
    slug: 'gridgo-client',
    name: 'GRIDGO',
    audience: 'For customers',
    whoItIsFor:
      'Install this one if you want something printed — flyers, tarpaulins, shirts, plaques, anything in the catalogue. Upload your design, and it arrives at your door.',
  },
  {
    key: 'supplier',
    slug: 'gridgo-supplier',
    name: 'GRIDGO Partner',
    audience: 'For print shops',
    whoItIsFor:
      'Install this one if you run a printing shop and want GRIDGO to send you work. List what you print, take the jobs you want, and upload proof as each stage finishes.',
  },
  {
    key: 'rider',
    slug: 'gridgo-rider',
    name: 'GRIDGO Rider',
    audience: 'For riders',
    whoItIsFor:
      'Install this one if you deliver on a motorcycle. Accept a run, check the order at the shop before you carry it, and record the handover when you drop it off.',
  },
];

const defaultMobileWebPort = '8088';
const defaultCommunityUrl = 'https://m.me/GRIDGOPrintPH';
/**
 * Where print partners, operations and admin sign in. Overridden at build time
 * by VITE_DASHBOARD_URL — and it must stay referenced by rendered markup, or
 * Vite has nothing to inline the value into and the deploy check fails.
 */
const defaultDashboardUrl = 'https://gridgo-dash.talasora.com';

type LocationLike = Pick<
  Location,
  'protocol' | 'hostname' | 'port' | 'pathname' | 'search' | 'hash' | 'href'
>;

export function getMobileWebUrl(
  location: LocationLike,
  port = defaultMobileWebPort,
) {
  const url = new URL(location.href);
  url.port = port;
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function isMobileUserAgent(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

export function shouldRedirectToMobileWeb(
  location: LocationLike,
  userAgent: string,
  port = defaultMobileWebPort,
) {
  const params = new URLSearchParams(location.search);
  return (
    isMobileUserAgent(userAgent) &&
    location.port !== port &&
    params.get('desktop') !== '1'
  );
}

export function landingLinks(location: LocationLike) {
  const mobileWebPort =
    import.meta.env.VITE_MOBILE_WEB_PORT || defaultMobileWebPort;
  // In production the port-based URL resolves to gridgo.talasora.com:8088,
  // which nothing serves — VITE_MOBILE_WEB_URL points it somewhere real.
  const mobileWebOverride = import.meta.env.VITE_MOBILE_WEB_URL?.trim();
  const communityUrl =
    import.meta.env.VITE_GRID_COMMUNITY_URL?.trim() || defaultCommunityUrl;
  const dashboardUrl =
    import.meta.env.VITE_DASHBOARD_URL?.trim() || defaultDashboardUrl;

  return {
    mobileWebUrl: mobileWebOverride || getMobileWebUrl(location, mobileWebPort),
    communityUrl,
    dashboardUrl,
    mobileWebPort,
  };
}
