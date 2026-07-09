# rpi-deploy-site

Landing page for [rpi-deploy](https://github.com/khmilevoi/rpi-deploy),
served at https://rpi.iiskelo.com — deployed by rpi-deploy itself onto a
Raspberry Pi behind a Cloudflare Tunnel.

Status: implemented — first deploy pending Cloudflare Tunnel setup on the Pi.

Local preview:

    npx -y serve -l 8080 .

Container:

    docker build -t rpi-deploy-site . && docker run --rm -p 8080:80 rpi-deploy-site

Deploy (once the tunnel exists): `rpi deploy` from the repo root.

Design docs live in `docs/` — approved spec, mockup, and handoff.
