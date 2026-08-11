import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LandingRoute, SupportRoute, DownloadRoute } from './routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/support" element={<SupportRoute />} />
          <Route path="/download" element={<DownloadRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
