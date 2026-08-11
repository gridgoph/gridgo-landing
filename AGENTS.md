# Project agent memory

GRIDGO's public landing site, served at **`gridgo.talasora.com`**. Ported from
the captain's own page at `printing_app/apps/Landing-page` — that directory is
the design's origin and is read-only; never write into it.

## Stack

Vite + React 19 + TypeScript + Tailwind v4, with `framer-motion` for entrances
and `@react-three/fiber` + `drei` + `three` for the fixed 3D hero. Routing is
`react-router-dom`. See `package.json` for the commands; `npm test` runs the
copy-and-claims check scripts under `scripts/`.

Three routes, all in `src/routes.tsx`: `/` (landing), `/support`, `/download`.

## The rules this page is held to

**Every claim must be true.** The page was ported from a product that promised
things GRIDGO cannot back. `scripts/check-claims.mjs` encodes what may not come
back: no prices or peso figures, no delivery/response-time promises, no counts
of shops or partners, no store badges, no 24/7 support claim, and **never the
commission** or any supplier-invisible money detail. Read
`/home/kali/firstmate/data/gridgo-operational-model-v2.md` before changing
anything that describes how GRIDGO works.

**Nothing unpublished gets a hardcoded link.** Anything GRIDGO has not shipped
is configuration with no default, and renders as an honest "not yet" state when
unset — see `src/utils/landingLinks.ts`. The support ticket form is gated on
`VITE_SUPPORT_TICKETS_ENABLED` because the API has no `POST /support-tickets`
endpoint; flip it in `.github/workflows/deploy.yml` when that ships.

## Sharp edges found the hard way

- **The 3D needs its own `<Suspense>`.** The GLB and drei's environment map
  suspend while loading. Without the boundary in `src/App.tsx`, that suspension
  reaches the router's boundary and blanks the entire page — navbar and copy
  included — until the 3D is ready.
- **`nginx -t` in the Dockerfile leaves a root-owned `/tmp/nginx.pid`**, which
  uid 101 then cannot write on sticky `/tmp`, so the container dies at start.
  The `rm -f` after it is load-bearing.
- **Decorative glows are wider than a phone.** `/support` has an 800px blur that
  scrolled the page sideways until its container got `overflow-x-hidden`. Check
  `document.documentElement.scrollWidth` against the *nominal* viewport width —
  `window.innerWidth` inflates under mobile emulation and hides the bug.
- **The hero depends on third-party origins** (`raw.githack.com`,
  `cdn.jsdelivr.net` for drei's environment map and troika's font, plus the
  YouTube embed). If they are blocked the scene degrades rather than failing.
- Software WebGL takes ~1s to first paint. Browser checks need a real settle
  wait or they screenshot a black page and call it a pass.

## Deploying

`gridgo.talasora.com` → container **`gridgo-landing`**, port **3000**, docker
network **`gridgo-edge`**. TLS terminates at Cloudflare in **Flexible** mode, so
the container serves plain HTTP and must never redirect to HTTPS — that loops
forever.

- `Dockerfile` — multi-stage; the runtime is `nginx-unprivileged` as uid 101.
- `deploy/nginx.conf` — SPA fallback, cache policy, `/downloads/` serving.
- `deploy/docker-compose.yml` — **this file has to be copied to
  `~/gridgo/landing/docker-compose.yml` on the server by hand.** CI cannot do
  it: the deploy key runs one command that only accepts the word `landing`.
- `.github/workflows/deploy.yml` — PRs build only; `main` publishes and deploys;
  `workflow_dispatch` publishes and deploys only with `deploy=true`.

`~/gridgo/downloads` on the host is mounted read-only at `/srv/gridgo-downloads`
and served at `/downloads/`. Each app's build writes `<slug>.apk` and a
`<slug>.json` sidecar there; this site only ever reads them, and a missing file
renders as "not available yet" rather than a broken link.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
