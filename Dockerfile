# syntax=docker/dockerfile:1

# ── Build ────────────────────────────────────────────────────────────────────
# Vite compiles to static files, so the runtime never needs Node. Everything
# below this stage is thrown away.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines `import.meta.env.VITE_*` at build time — these are build args,
# not runtime environment. Setting them on the container does nothing.
ARG VITE_API_URL
ARG VITE_DASHBOARD_URL
ARG VITE_GRID_COMMUNITY_URL
ENV VITE_API_URL=$VITE_API_URL \
    VITE_DASHBOARD_URL=$VITE_DASHBOARD_URL \
    VITE_GRID_COMMUNITY_URL=$VITE_GRID_COMMUNITY_URL

RUN npm run build

# Pre-compress so nginx can serve .gz directly instead of compressing per request.
RUN find dist -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.svg' \) \
      -exec gzip -9 -k -f {} \;

# ── Runtime ──────────────────────────────────────────────────────────────────
# nginx-unprivileged runs as uid 101 and binds a high port without root, which
# is what lets this serve port 3000 with no capabilities and no root user.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
RUN rm -f /etc/nginx/conf.d/default.conf \
 # Present but empty when the host downloads directory is not mounted, so
 # nginx starts and the /download page shows its honest "not available" state.
 && mkdir -p /srv/gridgo-downloads \
 && chown -R 101:101 /srv/gridgo-downloads
COPY deploy/nginx.conf /etc/nginx/conf.d/gridgo-landing.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
# Validate the config at build time so a broken conf fails here rather than on
# the server. `nginx -t` runs as root and leaves a root-owned /tmp/nginx.pid
# behind, which uid 101 then cannot write on sticky /tmp — so remove it.
RUN nginx -t && rm -f /tmp/nginx.pid
USER 101

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/bin/sh", "-c", "wget -q -O /dev/null http://127.0.0.1:3000/healthz || exit 1"]
