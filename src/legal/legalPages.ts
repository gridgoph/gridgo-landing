/**
 * The pages Google Play links to. Each is prerendered to `dist/<path>.html` at
 * build time so that a reviewer fetching the URL without JavaScript still gets
 * the full text; nginx serves that file for the bare path.
 */
export type LegalPage = {
  path: '/privacy' | '/delete-account' | '/terms'
  /** The document title, also written into the prerendered <title>. */
  title: string
  description: string
}

export const SITE_ORIGIN = 'https://gridgo.talasora.com'

export const PRIVACY_CONTACT = 'gridgo26@gmail.com'

/** Shown on /privacy and /delete-account. Change both dates together when the text changes. */
export const EFFECTIVE_DATE = '7 October 2026'
export const LAST_UPDATED = '10 November 2026'

/** The Terms of Service (/terms) carry their own dates. */
export const TERMS_EFFECTIVE_DATE = '11 November 2026'
export const TERMS_LAST_UPDATED = '11 November 2026'

export const LEGAL_PAGES: LegalPage[] = [
  {
    path: '/privacy',
    title: 'Privacy Policy | GRIDGO',
    description:
      'How GRIDGO and its apps (GRIDGO, GRIDGO Supplier and GRIDGO Rider) collect, use, share, keep and delete personal data.',
  },
  {
    path: '/delete-account',
    title: 'Delete your GRIDGO account',
    description:
      'How to ask GRIDGO to delete your account and data, what is deleted, what is kept for legal reasons, and for how long.',
  },
  {
    path: '/terms',
    title: 'Terms of Service | GRIDGO',
    description:
      'The terms for using GRIDGO, GRIDGO Supplier, GRIDGO Rider, the GRIDGO dashboard and gridgo.talasora.com: ordering, payment, delivery, refunds and accounts.',
  },
]
