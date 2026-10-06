import { StrictMode, createElement } from 'react'
import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'

export { LEGAL_PAGES, PRIVACY_CONTACT } from './legal/legalPages'

/**
 * Build-time only (scripts/prerender-legal.mjs loads this through Vite's SSR
 * loader; nothing in the browser bundle imports it). Renders a route to the
 * HTML that goes inside #root, waiting for the route's lazy chunk so the
 * output carries the whole page rather than the Suspense fallback. The tree
 * matches src/main.tsx's, with StaticRouter in place of BrowserRouter.
 */
export async function renderRoute(url: string): Promise<string> {
  const { prelude } = await prerender(
    createElement(StrictMode, null, createElement(StaticRouter, { location: url }, createElement(AppRoutes))),
  )
  return new Response(prelude).text()
}
