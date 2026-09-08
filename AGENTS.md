# Project agent memory

GRIDGO's public landing site, served at **`gridgo.talasora.com`**. Ported from
the captain's own page on the **`GRIDGOv3`** branch of `printing_app`
(`apps/Landing-page`) — that repo is the design's origin and is read-only to us.
Read it with `git -C <printing_app> show origin/GRIDGOv3:<path>`; never check it
out and never write into it.

## Stack

Vite + React 19 + TypeScript + Tailwind v4, with `framer-motion` for entrances
and `@react-three/fiber` + `drei` + `three` for the fixed 3D layer. Routing is
`react-router-dom`. See `package.json` for the commands; `npm test` runs the
check scripts under `scripts/`.

Four routes, all in `src/routes.tsx`: `/` (landing), `/support`, `/download`,
`/desk` (ticketing desk). Tickets live in GRIDGO Postgres via **gridgo-api**.
Do not add a sidecar Express/Supabase process — production landing is static
nginx, and CI deploy only runs the word `landing`.

**Light and dark are both real.** The theme is a `dark` class on `<html>` plus a
`theme` key in localStorage, owned by `src/utils/useTheme.ts` and shared by every
route — a route that manages it locally will start light on a deep link. Colours
come from `--app-primary`, which is a *darker* yellow in light mode for contrast,
so always use `var(--color-primary)` rather than the literal `#FFDE58`.

## The rules this page is held to

**The marketing copy is the captain's, and it ships as written.** Do not
rewrite, soften or "correct" it on your own initiative — that was tried and
reverted. `scripts/check-claims.mjs` deliberately does not police it.

**What the check does enforce** is the commercially sensitive part: GRIDGO's
commission, the supplier payout split and any peso figure must never appear on a
public page, and no legacy host or `localhost` may ship. Read
`/home/kali/firstmate/data/gridgo-operational-model-v2.md` before writing
anything that describes how GRIDGO works, and keep the money detail out of it.

**Every Download affordance routes to `/download`**, never to the `#download`
section — `scripts/check-download-page.mjs` enforces that, along with the
details a person needs before installing software from the open web.

**`VITE_API_URL` is the API origin, with no trailing `/api`.** Production is
`https://gridgo-api.talasora.com`. The live API serves `/support-tickets` (and
`/api/support-tickets`). Dev may use `VITE_API_URL=/api` with the Vite proxy
to `:8787`, which must not strip `/api`. Support form fields stay white in
dark mode so typed text is readable. `/desk` is the operator desk; it is not
linked from the public nav.

**A `VITE_*` value only reaches the bundle if rendered markup reads it.** The
deploy workflow refuses to publish a bundle missing the deployed API and
dashboard URLs, and a re-port once dropped the dashboard link entirely — the
constant survived, nothing rendered it, Vite inlined nothing, and the publish
job rejected the build. `check-claims.mjs` now asserts a rendered link uses
`dashboardUrl`.

## Sharp edges found the hard way

- **Every section with a horizontal entrance animation must clip.** The cards
  slide in from ±30-50px; a section without `overflow-hidden` lets a card that
  has not animated yet stick past the edge and scroll the whole page sideways.
  Measure `documentElement.scrollWidth` *while scrolling*, not once — a section
  only overflows while its animation is mid-flight.
- **Scroll behaviour is a route-level rule** in `src/utils/ScrollBehaviour.tsx`.
  Fragment links fire `popstate`, so react-router calls them POP; branch on the
  hash *changing*, not on navigation type, or nav anchors silently do nothing.
  Leave `history.scrollRestoration` alone — taking it over by hand measured
  worse than the browser on every case that mattered.
- **The 3D is decorative and must fail silently.** drei's `Environment` pulls
  its HDR from a CDN that is sometimes slow, blocked or down. The boundary in
  `PhoneScene` used to render the raw error in an absolutely-positioned red
  div, which showed visitors a stack trace *and* scrolled the whole site
  sideways on a phone. It returns `null` now.
- **localStorage can throw.** Private windows and webviews deny it outright, and
  reading it during render takes the whole page down. `useTheme` catches both
  directions.
- **`nginx -t` in the Dockerfile leaves a root-owned `/tmp/nginx.pid`**, which
  uid 101 then cannot write on sticky `/tmp`, so the container dies at start.
  The `rm -f` after it is load-bearing.
- **Decorative glows are wider than a phone.** `/support` has an 800px blur that
  scrolled the page sideways until its container got `overflow-x-hidden`. Check
  `document.documentElement.scrollWidth` against the *nominal* viewport width —
  `window.innerWidth` inflates under mobile emulation and hides the bug.
- **The hero depends on third-party origins** (`raw.githack.com`,
  `cdn.jsdelivr.net` for drei's environment map and troika's font, plus the
  How it Works YouTube walkthroughs). If they are blocked the scene degrades
  rather than failing.
- Software WebGL takes ~1s to first paint. Browser checks need a real settle
  wait or they screenshot a black page and call it a pass.
- **The hero assets are heavy** — the two route-animation GIFs are ~40 MB
  together, which is most of the 73 MB image. They are the captain's artwork;
  do not re-encode them without asking, but know that is where the weight is.
- **A `VITE_*` value only reaches the bundle if rendered markup reads it** —
  see the rule above; the deploy check enforces it.
- **`npm run build` did not pass on the source branch.** Unused locals and a
  troika typing error had to be fixed during the port; expect the same next time
  you pull from `GRIDGOv3`.

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
