import type { AppKey } from './landingLinks';

/**
 * Where the container serves `~/gridgo/media` from (deploy/nginx.conf). The
 * videos are 40-55 MB each, so they live on the server, not in git or the image.
 *
 * Files there are cached for a year as immutable, so a file is never replaced
 * in place: a re-cut video goes up under the next `-vN` name and its entry
 * below moves to that name.
 */
export const mediaBasePath = '/media';

export type Tutorial = {
  /** Versioned basename on the server; `.mp4` and `.jpg` (poster) sit side by side. */
  file: string;
  title: string;
  app: string;
  /** Shown as m:ss. */
  length: string;
  summary: string;
};

export type TutorialGroup = {
  /** Section id, so `/tutorials#shop` lands on it. */
  id: 'customer' | 'shop' | 'rider';
  name: string;
  /** The app these videos are filmed in, from GRIDGO_APPS. */
  appKey: AppKey;
  intro: string;
  videos: Tutorial[];
};

export const TUTORIAL_GROUPS: TutorialGroup[] = [
  {
    id: 'customer',
    name: 'Customer',
    appKey: 'client',
    intro: 'For anyone ordering prints.',
    videos: [
      {
        file: 'gridgo-customer-app-tutorial-v1',
        title: 'How to order prints',
        app: 'Customer app',
        length: '5:28',
        summary:
          'Create your account, start a print request, pick a printer, upload your artwork, pay by QR, confirm your delivery pin, follow the rider and receive your order with your handover code.',
      },
    ],
  },
  {
    id: 'shop',
    name: 'Shop',
    appKey: 'supplier',
    intro: 'For print shops. Set up first, then run your shop day to day.',
    videos: [
      {
        file: 'gridgo-shop-setup-tutorial-v1',
        title: 'How to set up your shop',
        app: 'Shop app',
        length: '5:08',
        summary:
          'Sign up your shop, wait for approval, add your first listing with its production time, set your services and capacity, and add where you get paid.',
      },
      {
        file: 'gridgo-shop-app-tutorial-v1',
        title: 'How to run your shop',
        app: 'Shop app',
        length: '4:03',
        summary:
          'Accept a job, send your production photos, have the rider check the work and pack it in front of them, hand it over, get paid and chat with the GRIDGO Team.',
      },
    ],
  },
  {
    id: 'rider',
    name: 'Rider',
    appKey: 'rider',
    intro: 'For riders delivering GRIDGO orders.',
    videos: [
      {
        file: 'gridgo-rider-app-tutorial-v1',
        title: 'How to deliver with GRIDGO',
        app: 'Rider app',
        length: '4:00',
        summary:
          "Apply to ride, wait for approval, accept a delivery, ride to the shop, check and watch the package packed, deliver it with the customer's code and check your earnings.",
      },
    ],
  },
];

export const tutorialVideoUrl = (t: Tutorial) => `${mediaBasePath}/${t.file}.mp4`;
export const tutorialPosterUrl = (t: Tutorial) => `${mediaBasePath}/${t.file}.jpg`;

/** `5:28` → `PT5M28S`, for <time dateTime>. */
export function isoDuration(length: string): string {
  const [m, s] = length.split(':').map(Number);
  return `PT${m}M${s}S`;
}
