/**
 * Outbound links and app metadata for the GRIDGO public landing site
 * (gridgo.talasora.com).
 *
 * Anything GRIDGO has not published yet is configuration with NO default. When
 * it is unset the CTA renders as an honest "not published yet" state instead of
 * a dead link — see AGENTS.md.
 */

const defaultDashboardUrl = 'https://gridgo-dash.talasora.com';
const defaultApiUrl = 'https://gridgo-api.talasora.com/api';

/**
 * Where the container serves `~/gridgo/downloads` from. The APK and its JSON
 * sidecar are written there by each app's own build; this site only reads them.
 */
export const downloadsBasePath = '/downloads';

function optionalEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export type AppKey = 'client' | 'supplier' | 'rider';

export type GridgoApp = {
  key: AppKey;
  /** The APK/sidecar basename on the server, without extension. */
  slug: string;
  name: string;
  audience: string;
  /** One line for the landing page. */
  blurb: string;
  /** Plain language, for someone who does not know which app is theirs. */
  whoItIsFor: string;
};

export const GRIDGO_APPS: GridgoApp[] = [
  {
    key: 'client',
    slug: 'gridgo-client',
    name: 'GRIDGO',
    audience: 'For customers',
    blurb: 'Send artwork, follow the job, receive it at your door.',
    whoItIsFor:
      'Install this one if you want something printed — flyers, tarpaulins, shirts, plaques, anything in the catalogue. You upload the design, GRIDGO finds a print shop, and a rider brings it to you.',
  },
  {
    key: 'supplier',
    slug: 'gridgo-supplier',
    name: 'GRIDGO Partner',
    audience: 'For print shops',
    blurb: 'Take jobs that match what you do best, and get paid on proof.',
    whoItIsFor:
      'Install this one if you own or run a printing shop and want GRIDGO to send you work. You list what you print, accept the jobs you want, and upload proof as each stage finishes.',
  },
  {
    key: 'rider',
    slug: 'gridgo-rider',
    name: 'GRIDGO Rider',
    audience: 'For riders',
    blurb: 'Accept a run, pass the pickup checklist, deliver with evidence.',
    whoItIsFor:
      'Install this one if you deliver on a motorcycle. You accept a run, check the order at the shop before you carry it, and record the handover when you drop it off.',
  },
];

/** Minimum Android version, from the Expo SDK 54 baseline the apps are built on. */
export const minimumAndroidVersion = '7.0';

export function landingLinks() {
  return {
    /** Partner + operations dashboard. */
    dashboardUrl:
      optionalEnv(import.meta.env.VITE_DASHBOARD_URL) ?? defaultDashboardUrl,
    /**
     * Community CTA. Deliberately has no default: the legacy page shipped a
     * hardcoded Messenger handle that no longer resolves to a page.
     */
    communityUrl: optionalEnv(import.meta.env.VITE_GRID_COMMUNITY_URL),
  };
}

export function supportApiUrl() {
  return optionalEnv(import.meta.env.VITE_API_URL) ?? defaultApiUrl;
}

/**
 * The support ticket form posts to `${API}/support-tickets`, which the GRIDGO
 * API does not implement yet. Off by default so the public page never shows a
 * form that cannot succeed; set to "true" at build time once the endpoint is live.
 */
export function supportTicketsEnabled() {
  return import.meta.env.VITE_SUPPORT_TICKETS_ENABLED === 'true';
}
