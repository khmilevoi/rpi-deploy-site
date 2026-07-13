# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Static landing page for [rpi-deploy](https://github.com/khmilevoi/rpi-deploy), served at
https://rpi.iiskelo.com and deployed by rpi-deploy itself onto a Raspberry Pi behind a Cloudflare
Tunnel. No build step, no framework — plain HTML/CSS/JS.

## Commands

```
npm run dev      # live-server on src/, port 8080, auto-refresh on save
npm run preview  # serve on src/, port 8080, no auto-refresh
npm run og       # regenerate src/assets/og.png (screenshots the hero via Playwright)
```

Container build/run (mirrors the Pi's deploy path):
```
docker build -t rpi-deploy-site . && docker run --rm -p 8080:80 rpi-deploy-site
```

Deploy: `rpi deploy` from the repo root (this project is itself deployed with the rpi-deploy tool
it advertises).

There is no test suite, linter, or type check configured.

## Architecture

- Source lives entirely in `src/`: `index.html`, `styles.css`, `copy.js`, `assets/`. This is also
  the Docker build context for static files — `Dockerfile` just `COPY`s these into
  `nginx:alpine`'s webroot, no build step runs in the image.
- `copy.js` is the only JS: it drives the page-load stagger animation (adds `.loaded` to `<html>`
  on next frame), toggles a `past-hero` class via `IntersectionObserver` so the nav logo reveals
  once the hero scrolls out of view, and wires clipboard-copy buttons (`[data-copy]`).
- `styles.css` uses CSS custom properties for the palette/token system described in
  `docs/spec/`. Dark theme only, no theme switch, no webfonts.
- `docker-compose.yml` defines a single `web` service and deliberately has **no `ports:`
  mapping** — only `expose: "80"`. rpi-deploy's agent writes its own host-port override
  (`127.0.0.1:<allocated>:80`); adding a `ports:` entry here would conflict with that allocator.
  For local container testing, use `docker run -p 8080:80 ...` directly instead of
  `docker compose up`.
- `rpi.toml` is this repo's own deploy config, read by the rpi-deploy CLI/agent on the Pi: schema
  1, project name, source repo/branch, compose file path, ingress hostname/service/port, and a
  healthcheck. The compose service name (`web`) must match `[ingress].service`.

## Content accuracy constraints

Every CLI command and config snippet shown on the page must match the real rpi-deploy CLI surface
(check the [rpi-deploy README](https://github.com/khmilevoi/rpi-deploy) or the `rpi-cli`/`rpi-toml`
skills if unsure — two invented-syntax bugs were already caught and fixed once, see
`docs/HANDOFF.md`). In particular:
- There is no `rpi setup <host>` one-liner. Real flow: `npm install -g rpi-deploy` → `rpi setup`
  (wizard) → `rpi init` (wizard, generates `rpi.toml`) on the dev machine; `sudo npm install -g
  rpi-deploy` → `sudo rpi agent setup` on the Pi; `rpi deploy` to ship.
- TOML snippets must be valid (one key per line, no inline `service = "web", port = 3000`-style
  shortcuts).
- The quick-start copy-button payloads (`data-copy` attributes, using `&#10;` for newlines) must
  contain a complete, valid `rpi.toml`, even if the visible snippet is abbreviated.

## Design/process history

`docs/HANDOFF.md` and `docs/spec/` contain the approved design spec, mockup, and implementation
handoff notes from the original build. `docs/superpowers/` holds planning artifacts from that
session. These are historical/reference material, not living docs to keep in sync with the code.
