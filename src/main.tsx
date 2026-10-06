import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRoutes } from './AppRoutes'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
)

// /privacy and /delete-account arrive with their text already in the HTML
// (scripts/prerender-legal.mjs). Hydrating keeps that text on screen while the
// route's chunk loads; every other route starts from an empty root.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
