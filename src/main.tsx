import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LandingRoute, SupportRoute, DownloadRoute, DeskRoute, ReportRoute } from './routes'
import { ScrollBehaviour } from './utils/ScrollBehaviour'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollBehaviour />
      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/support" element={<SupportRoute />} />
          <Route path="/download" element={<DownloadRoute />} />
          <Route path="/desk" element={<DeskRoute />} />
          <Route path="/report" element={<ReportRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
