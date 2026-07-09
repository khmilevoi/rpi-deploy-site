# Handoff: implementing the rpi-deploy landing page

Written 2026-07-09 by the brainstorming session that produced the spec. The
design is approved by the user; nothing below is open for re-litigation
unless the user says so. Your job in this repo: write the implementation
plan, then implement.

## Next step (process)

1. Read `docs/spec/2026-07-09-landing-page-design.md` (the spec) and open
   `docs/spec/2026-07-09-landing-page-mockup.html` in a browser (the
   approved visual reference — Terminal-first direction; two alternatives
   were mocked and rejected during brainstorming, do not revisit).
2. Use the **superpowers:writing-plans** skill to write the implementation
   plan. Save it to `docs/superpowers/plans/2026-07-09-landing-page.md` in
   this repo. Brainstorming is DONE — do not re-run it.
3. Execute the plan (subagent-driven-development or executing-plans).

## Hard facts a fresh session cannot derive

- Tool repo: https://github.com/khmilevoi/rpi-deploy
  (SSH: `git@github.com:khmilevoi/rpi-deploy.git`). Use this for the
  `GitHub ★` nav button and footer link.
- npm package: `rpi-deploy`, https://www.npmjs.com/package/rpi-deploy.
  Current version at spec time: **0.12.0**. Node >= 18 required for npm
  install (worth NOT putting on the page — keep copy lean; it's in the
  tool's README).
- Version badge (only allowed external request):
  `https://img.shields.io/npm/v/rpi-deploy` (style/label/color params free).
- This repo's intended remote: `git@github.com:khmilevoi/rpi-deploy-site.git`.
  **Not created on GitHub yet.** Create it public when ready to push:
  `gh repo create khmilevoi/rpi-deploy-site --public --source . --push`.
- Domain `rpi.iiskelo.com` exists in Cloudflare. The Cloudflare Tunnel on
  the Pi is **not set up yet** — the final `rpi deploy` is blocked until it
  is (manual setup per the rpi-deploy README, or the automation being built
  on the pi repo branch `feat/cloudflare-lan-automation`). Plan the deploy
  as a final, explicitly-blocked task; everything else must be verifiable
  locally.
- License: MIT, `Copyright (c) 2026 khmilevoi` — `LICENSE` already committed
  here (copied from the tool repo).

## Truthfulness constraints (spec requirement, bugs already caught once)

Every command and config snippet on the page must match the real CLI surface
in the rpi-deploy README. Two errors were caught and fixed during
brainstorming — do not reintroduce them:

1. `rpi setup pi@raspberrypi.local` is **invented syntax**. Real flow:
   - dev machine: `npm install -g rpi-deploy`, then `rpi setup` (wizard:
     server profile + SSH key + config.toml), then `rpi init` (wizard,
     generates `rpi.toml`);
   - on the Pi: `sudo npm install -g rpi-deploy`, then `sudo rpi agent setup`;
   - deploy: `rpi deploy` from the project root.
2. `service = "web", port = 3000` on one line is **invalid TOML** (the
   mockup once showed it; fixed to one key per line).

Minimal real `rpi.toml` requires: `schema = 1`, `[project].name`,
`[source].repo`, `[ingress].service` + `[ingress].port`. In the quick-start
step 3, the displayed snippet may be an abbreviated fragment, but the copy
button (`data-copy`) should carry a complete valid file (use `&#10;` for
newlines in the attribute).

## Deployment config for THIS site (from the spec, verbatim)

`rpi.toml`:

```toml
schema = 1

[project]
name = "rpi-deploy-site"

[source]
repo = "git@github.com:khmilevoi/rpi-deploy-site.git"
branch = "main"

[ingress]
hostname = "rpi.iiskelo.com"
service = "web"
port = 80

[healthcheck]
path = "/"
expect = "2xx"
```

Compose gotchas (from the rpi-toml skill in the tool repo,
`plugins/rpi/skills/rpi-toml/SKILL.md`):

- `docker compose build` runs **on the Pi** — the image must be
  `FROM nginx:alpine` + `COPY` only, no node/build steps.
- Use `expose: "80"` in the compose service, **never** a host `ports:`
  mapping — it conflicts with rpi's stable host-port allocator (the agent
  writes its own override mapping `127.0.0.1:<allocated>:80`).
- Compose service name must be `web` (matches `[ingress].service`).
- `rpi.toml` must sit at the repo root; the agent clones this repo.

## Implementation notes

- Target file layout (spec): `index.html`, `styles.css`, `copy.js`,
  `assets/` (favicon, og-image), `Dockerfile`, `docker-compose.yml`,
  `rpi.toml`.
- Production code = semantic HTML + `styles.css` with CSS custom properties
  for the palette tokens (full token table is in the spec). The mockup's
  inline styles are a mockup artifact — do not copy them as-is.
- Dark theme only, no theme switch. No webfonts. No JS frameworks; JS is
  only `copy.js` (clipboard for the install pill and quick-start blocks).
- Equal-height quick-start cards are a hard requirement (user flagged uneven
  heights during review; fix = flex-stretch code blocks, short steps padded
  with an output line).
- Layout must hold at 360 px (hero stacks, grids collapse); also verify
  768 px and 1440 px.
- Favicon: an SVG (raspberry `▸` on dark) is fine. og-image: 1200×630 PNG —
  generate by screenshotting the hero, e.g.
  `npx playwright screenshot --viewport-size "1200,630" http://localhost:8080 assets/og.png`.
- Local verification: `npx -y serve -l 8080 .` for markup/clipboard checks
  (clipboard API needs localhost or https — `file://` won't work), and
  `docker build` + `docker run --rm -p 8080:80 <image>` for the container
  path. Do not rely on `docker compose up` for local port access — the
  compose file has no `ports:` on purpose (see gotchas above).

## Follow-ups that live in the OTHER repo (do not lose these)

Two spec'd changes belong to the rpi-deploy repo
(`C:\Users\Khmil\RustProjects\pi`), not here. The spec is committed there on
worktree branch `worktree-landing-page-spec`
(`.worktrees/landing-page-spec`); the changes themselves are not made yet:

1. `README.md`: add the line `Website: https://rpi.iiskelo.com` as its own
   paragraph directly after the opening description paragraph (before the
   "Status:" paragraph).
2. `.claude/skills/release/SKILL.md`, step 3 ("Update docs"): add a bullet —
   after a release, check whether anything the landing page shows changed
   (feature list, quick start, install instructions, CLI output look); if
   yes, update this repo and redeploy (`rpi deploy` from its root). It is a
   separate repository, so this is a post-release follow-up, not part of
   the release commit. The npm version badge updates itself.

Either do them from a session in the pi repo, or remind the user.
