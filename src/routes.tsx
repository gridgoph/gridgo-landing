import { lazy } from 'react'

/**
 * /download is the only way to install GRIDGO, and it is reached on a phone on
 * mobile data. Splitting the routes keeps three.js — which only the landing
 * route uses — out of the critical path for /download, /support and /desk.
 */
export const LandingRoute = lazy(() => import('./App'))

export const SupportRoute = lazy(() =>
  import('./SupportPage').then((m) => ({ default: m.SupportPage })),
)

export const DownloadRoute = lazy(() =>
  import('./DownloadPage').then((m) => ({ default: m.DownloadPage })),
)

export const DeskRoute = lazy(() =>
  import('./desk/DeskPage').then((m) => ({ default: m.DeskPage })),
)
