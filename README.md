# gridgo-landing

GRIDGO's public landing site — **https://gridgo.talasora.com**

It does three jobs: explain what GRIDGO is and how it actually works, hand
people the Android apps at `/download`, and point them at support at `/support`.

Related surfaces: the dashboard is **gridgo-dash.talasora.com**, the API is
**gridgo-api.talasora.com**.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · framer-motion · react-three-fiber /
drei / three · react-router-dom.

Ported from the captain's page in `printing_app/apps/Landing-page`, keeping the
design, the 3D hero and the motion work intact.

## Running it

```sh
npm install
npm run dev        # http://localhost:5174
npm run build      # typecheck + production build into dist/
npm run lint
npm test           # copy and claims checks (scripts/)
```

### Configuration

All build-time (Vite inlines `VITE_*` into the bundle — setting them on a
running container does nothing). Everything is optional; anything unset renders
as an honest "not published yet" state rather than a dead link.

| Variable | Default | What it does |
|---|---|---|
| `VITE_API_URL` | `https://gridgo-api.talasora.com/api` | API base for the support form |
| `VITE_DASHBOARD_URL` | `https://gridgo-dash.talasora.com` | Partner dashboard link |
| `VITE_SUPPORT_TICKETS_ENABLED` | `false` | `true` once the API implements `POST /support-tickets` |
| `VITE_GRID_COMMUNITY_URL` | *(none)* | Community CTA; hidden entirely when unset |

The production values live in `.github/workflows/deploy.yml`.

## The `/download` page

This is how people install GRIDGO — there is no Play Store listing. The page
serves three apps: `gridgo-client` (customers), `gridgo-supplier` (print shops),
`gridgo-rider` (riders), with size, last-updated date and a copyable SHA-256 for
each, plus sideloading instructions.

It reads those details from `~/gridgo/downloads/` on the server, mounted
read-only into the container and served at `/downloads/`. Each app's own build
uploads `<slug>.apk` and a `<slug>.json` sidecar:

```json
{"app":"client","file":"gridgo-client.apk","bytes":1100228,"sha256":"ac78…","updated":"2026-08-11T00:48:00Z"}
```

No APKs are built or committed here. An app with no sidecar shows as "not
available yet" — never a broken link or a zero-byte download.

To exercise it locally, put a fixture `.apk` + `.json` in a directory and mount
it (see below).

## Deploying

The reverse proxy on the server routes `gridgo.talasora.com` to a container it
reaches as host **`gridgo-landing`** on port **3000** over the docker network
**`gridgo-edge`**. TLS terminates at Cloudflare in **Flexible** mode, so the
container serves plain HTTP and adds **no HTTPS redirect** — a redirect there
loops forever.

### Automatic

`.github/workflows/deploy.yml`:

| Trigger | Checks | Publish to GHCR | Deploy |
|---|---|---|---|
| pull request | ✓ | — | — |
| push to `main` | ✓ | ✓ | ✓ |
| manual dispatch | ✓ | ✓ | only with `deploy=true` |

A PR never publishes or deploys: a pull request is untrusted code, and either
would let any PR replace the public site.

The deploy step opens one SSH connection with a restricted key that accepts the
single word `landing`, verifying the host key from `DEPLOY_KNOWN_HOSTS`, and
pipes a run-scoped registry token to it on stdin because the image registry is
private. Secrets `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER` and
`DEPLOY_KNOWN_HOSTS` already exist on the repository.

### One-time server setup

CI cannot place files on the server — the key runs one command and nothing else.
So `deploy/docker-compose.yml` has to be copied to
`~/gridgo/landing/docker-compose.yml` once, by hand, before the first deploy.

### Running the production image locally

```sh
docker build -t gridgo-landing:local .
docker run --rm -p 39300:3000 \
  -v /path/to/downloads:/srv/gridgo-downloads:ro \
  gridgo-landing:local
# http://127.0.0.1:39300  ·  health at /healthz
```

The container runs as uid 101 and never as root.

### Confirming a deploy worked

```sh
curl -sI https://gridgo.talasora.com/          # 200, no redirect
curl -s  https://gridgo.talasora.com/healthz   # ok
curl -sI https://gridgo.talasora.com/download  # 200 (SPA fallback)
```

### Rolling back

Every build is pushed as both `:latest` and `:<commit-sha>`. To roll back, point
`GRIDGO_LANDING_IMAGE` in `~/gridgo/landing/docker-compose.yml` at a known-good
`:<sha>` tag and re-run the deploy command, or re-run the workflow from the
last good commit.

## Agent notes

`AGENTS.md` carries the sharp edges — read it before changing the 3D hero, the
Dockerfile, or anything the page claims.
