import { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import {
  LandingRoute,
  SupportRoute,
  DownloadRoute,
  TutorialsRoute,
  DeskRoute,
  ReportRoute,
  PrivacyRoute,
  TermsRoute,
  DeleteAccountRoute,
  LegalLibraryRoute,
  LegalDocumentRoute,
  EarlyAccessStatusRoute,
} from './routes'
import { rememberSource } from './earlyAccess/api'
import { ScrollBehaviour } from './utils/ScrollBehaviour'
import { CookieConsent } from './consent/CookieConsent'

/** /walkthroughs is the other name people use for /tutorials; keep any #group. */
function WalkthroughsRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/tutorials', search, hash }} replace />
}

/** /early-access is the short link for booths and posts: the sign-up on /download. */
function EarlyAccessRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/download', search, hash: '#early-access' }} replace />
}

/** Keep `?src=` from whichever page the visitor arrived on, through to the sign-up. */
function SourceCapture() {
  const { search } = useLocation()
  useEffect(() => {
    rememberSource(search)
  }, [search])
  return null
}

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
      <SourceCapture />
      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/support" element={<SupportRoute />} />
          <Route path="/download" element={<DownloadRoute />} />
          <Route path="/early-access" element={<EarlyAccessRedirect />} />
          <Route path="/early-access/status" element={<EarlyAccessStatusRoute />} />
          <Route path="/tutorials" element={<TutorialsRoute />} />
          <Route path="/walkthroughs" element={<WalkthroughsRedirect />} />
          <Route path="/desk" element={<DeskRoute />} />
          <Route path="/report" element={<ReportRoute />} />
          <Route path="/privacy" element={<PrivacyRoute />} />
          <Route path="/terms" element={<TermsRoute />} />
          <Route path="/delete-account" element={<DeleteAccountRoute />} />
          <Route path="/legal" element={<LegalLibraryRoute />} />
          <Route path="/legal/:documentId" element={<LegalDocumentRoute />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </>
  )
}
