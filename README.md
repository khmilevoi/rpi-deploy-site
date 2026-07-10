# rpi-deploy-site

Landing page for [rpi-deploy](https://github.com/khmilevoi/rpi-deploy),
served at https://rpi.iiskelo.com — deployed by rpi-deploy itself onto a
Raspberry Pi behind a Cloudflare Tunnel.

Status: implemented — first deploy pending Cloudflare Tunnel setup on the Pi.

Source lives in `src/` (`index.html`, `styles.css`, `copy.js`, `assets/`) — no
build step, no framework.

Local dev (auto-refresh on save):

    npm run dev

Local preview (no auto-refresh):

    npm run preview

Regenerate the Open Graph image (`src/assets/og.png`):

    npm run og

Container:

    docker build -t rpi-deploy-site . && docker run --rm -p 8080:80 rpi-deploy-site

Deploy (once the tunnel exists): `rpi deploy` from the repo root.

Design docs live in `docs/` — approved spec, mockup, and handoff.

Before every `rpi-deploy` release, read [`docs/landing-audit.md`](docs/landing-audit.md)
and run the audit it describes — the page (and `src/llms.txt`, `src/sitemap.xml`,
`src/robots.txt`) drift from the CLI's real version, output, and feature set otherwise.
