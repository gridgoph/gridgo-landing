import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  LandingRoute,
  SupportRoute,
  DownloadRoute,
  DeskRoute,
  ReportRoute,
  PrivacyRoute,
  DeleteAccountRoute,
  LegalLibraryRoute,
  LegalDocumentRoute,
} from './routes'
import { ScrollBehaviour } from './utils/ScrollBehaviour'
import { CookieConsent } from './consent/CookieConsent'

/**
 * The route table, without a router. The browser wraps it in BrowserRouter
 * (src/main.tsx); the build wraps it in StaticRouter to prerender the legal
 * pages (src/prerender.ts). Both must render this same tree, or hydrating the
 * prerendered HTML no longer lines up with what the browser renders.
 */
export function AppRoutes() {
  return (
    <>
      <ScrollBehaviour />
      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/support" element={<SupportRoute />} />
          <Route path="/download" element={<DownloadRoute />} />
          <Route path="/desk" element={<DeskRoute />} />
          <Route path="/report" element={<ReportRoute />} />
          <Route path="/privacy" element={<PrivacyRoute />} />
          <Route path="/delete-account" element={<DeleteAccountRoute />} />
          <Route path="/legal" element={<LegalLibraryRoute />} />
          <Route path="/legal/:documentId" element={<LegalDocumentRoute />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </>
  )
}
