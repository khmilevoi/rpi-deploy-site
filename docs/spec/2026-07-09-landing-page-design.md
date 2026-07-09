# Landing Page for rpi-deploy — Design

Date: 2026-07-09
Status: approved design, pending implementation plan
Approved mockup: [`2026-07-09-landing-page-mockup.html`](2026-07-09-landing-page-mockup.html)
(open in a browser; inline styles are intentional — it is a mockup artifact, not production code)

## Goal

A single-page marketing site for rpi-deploy at `https://rpi.iiskelo.com`. The
target action is `npm install -g rpi-deploy`: a visitor who runs Docker
projects on a Raspberry Pi should understand within one screen what the tool
does and how to try it. The page itself is deployed by rpi-deploy onto the
author's own Raspberry Pi — this dogfooding is presented on the page as a
trust signal.

Language: English. Theme: dark only — no light theme, no theme switch.

## Scope

In scope:

- One static page (one-pager) in a new, separate repository `rpi-deploy-site`.
- Deployment config (`rpi.toml`, `Dockerfile`, `docker-compose.yml`) in that
  repository.
- In **this** repository: a website link in `README.md` and a release-checklist
  addition in `.claude/skills/release/SKILL.md`.

Out of scope (explicitly rejected for now):

- Documentation pages (docs stay in the GitHub README; revisit Astro if the
  site grows).
- JS frameworks or build steps — plain HTML/CSS with a few lines of vanilla JS
  for copy buttons.
- Light theme, analytics, multiple languages.

## Visual design (validated in brainstorming, mockup approved)

Direction: **Terminal-first**. The hero's centerpiece is a terminal window
showing a colored `rpi deploy` run. Monospace-heavy typography, quiet dark
surfaces, thin borders. Two alternative directions (SaaS-style "modern
product page" and "PCB/engineering") were mocked up and rejected.

Palette — classic Raspberry Pi brand colors on a dark neutral base:

| Token | Value | Use |
| --- | --- | --- |
| raspberry | `#C51A4A` | primary accent: logo mark, headings accent, install-pill border, section labels, card numbers, dogfooding border, spinner glyph |
| leaf green | `#75A928` | success/positive: `$` prompts, `●`/`✓` markers, ssh arrows, step numbers, "live from a Pi" badge |
| bg | `#0b0d10` | page background |
| panel | `#0d1117` | cards, terminal, code blocks |
| panel-alt | `#161b22` | terminal title bar, install pill, version chip |
| border | `#30363d` | card/terminal borders |
| border-faint | `#1c2128` | section separators |
| text | `#e6edf3` | headings, primary text |
| muted | `#8b949e` | body copy, secondary text |
| faint | `#484f58` | de-emphasized log lines, comments |
| amber | `#d4a017` | rare accent: numeric literals in TOML snippet |

Typography: a monospace stack (`Consolas`-first system mono) for headings,
labels, nav, and all code; a system sans stack for body copy. No webfonts —
keeps the page dependency-free and fast.

## Page structure (top to bottom)

1. **Nav** (sticky): `▸ rpi-deploy` wordmark; anchor links `how it works`,
   `features`, `quick start`; bordered `GitHub ★` button.
2. **Hero**: two columns (stack on mobile).
   - Left: h1 `Deploy to your Raspberry Pi with one command.` (raspberry
     accent on "one command"); subline "rpi-deploy builds and runs your
     Docker Compose projects on the Pi — over plain SSH. No registry, no
     Kubernetes, no YAML pipelines."; install pill
     `$ npm install -g rpi-deploy` with copy button (raspberry border); meta
     line `MIT · prebuilt binaries · Linux / macOS / Windows · <npm version badge>`.
   - Right: terminal window (title bar with raspberry/green/grey dots,
     `~/my-app`) showing a colored `rpi deploy` transcript: config → tunnel →
     fetch → build (spinner + faint docker log lines) → healthy → deployed.
3. **How it works**: label `# HOW IT WORKS`, heading "Two binaries, one SSH
   connection"; three cards joined by green `──ssh──▸` / `──▸` arrows:
   `[1] your machine` (rpi CLI), `[2] raspberry pi` (rpi agent, systemd,
   clone/build/stable port), `[3] the internet` (health-checked, Cloudflare
   Tunnel or own ingress).
4. **Features**: label `# FEATURES`, heading "Everything a deploy needs,
   nothing it doesn't"; grid of 8 numbered cards: latest-wins deploy queue,
   encrypted secrets, Cloudflare Tunnel ingress, health checks, stable port
   allocation, logs/stats/lifecycle, one-off commands, installs in seconds
   (prebuilt binaries).
5. **Quick start**: label `# QUICK START`, heading "Zero to deployed in four
   steps"; four equal-height cards, each a caption plus a three-to-four-line
   code block: (1) `npm install -g rpi-deploy`, (2) set up the Pi —
   `sudo rpi agent setup` on the Pi, then `rpi setup` (wizard) on the dev
   machine, (3) minimal `rpi.toml` snippet, (4) `rpi deploy` → `✓ deployed`.
   All commands must match the real CLI surface documented in the README —
   no invented syntax — and config snippets must be valid TOML (one key per
   line; the comma-joined form is invalid). Equal card heights are a hard requirement (uneven
   heights were flagged during review and fixed in the mockup: flex-stretch
   blocks, short steps padded with an output line).
6. **Dogfooding banner**: raspberry-bordered strip with 🍓, "This page
   practices what it preaches." and "You're reading HTML served by nginx in a
   Docker container, deployed by rpi deploy, running on a Raspberry Pi behind
   a Cloudflare Tunnel."; green pill `● live from a Pi`.
7. **Footer**: `▸ rpi-deploy · MIT license`; links to GitHub and npm; npm
   version badge.

The npm version badge in hero meta and footer is a shields.io image
(`https://img.shields.io/npm/v/rpi-deploy`) — it updates itself on every
release with zero maintenance. It is the only external request on the page;
everything else is self-hosted. If shields.io is unreachable the `img` simply
doesn't render — no fallback needed.

All CLI transcripts on the page are hand-written HTML/CSS stylizations of real
rpi-deploy v0.12 output (semantic colors, dot markers, log pane), adapted to
the site palette: raspberry replaces cyan as the accent; green markers stay
green.

## Repository `rpi-deploy-site`

New GitHub repository (`github.com/khmilevoi/rpi-deploy-site`), checked out
locally as a sibling of this repo (`C:\Users\Khmil\RustProjects\rpi-deploy-site`)
— not nested inside it. Layout:

```
index.html          # the whole page; styles.css beside it
styles.css
copy.js             # clipboard for install/quick-start blocks (few lines)
assets/             # favicon, og-image
Dockerfile          # FROM nginx:alpine; COPY index.html styles.css copy.js assets/ → /usr/share/nginx/html/
docker-compose.yml  # single service "web", expose 80, build context .
rpi.toml
```

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

No `[secrets]`, no `[commands]`. `docker compose build` runs on the Pi, so
the image must need no compilation — `nginx:alpine` + `COPY` builds in
seconds on aarch64.

Meta requirements for `index.html`: title/description, Open Graph tags with
og-image, favicon, `lang="en"`, responsive viewport; page must be usable at
360 px width (hero columns stack, feature grid collapses to one column).

Implementation tooling decision (also validated in brainstorming): the page
is coded here in Claude Code with the `/frontend-design` skill, using the
approved mockup as the reference; Claude Design (the external tool) was
considered and rejected because the deliverable is code in the final medium
and iteration happens here anyway.

## Changes in this repository (rpi-deploy)

1. `README.md`: add the line `Website: https://rpi.iiskelo.com` on its own
   paragraph directly after the opening description paragraph (before the
   "Status:" paragraph).
2. `.claude/skills/release/SKILL.md`, step 3 ("Update docs"): add a bullet —
   check whether the release changes anything the landing page shows
   (feature list, quick start, install instructions, CLI output look) and if
   so, update the `rpi-deploy-site` repo and redeploy it (`rpi deploy` from
   that repo) after the release. Note that the site lives in a separate
   repository, so this is a post-release follow-up, not part of the release
   commit. The npm version badge updates itself and needs no action.

## Dependencies and deployment

Publishing requires a working Cloudflare Tunnel on the Pi for
`rpi.iiskelo.com`. The domain exists in Cloudflare; the tunnel is not set up
yet. Either configure it manually (current README instructions) or wait for
the automation being built on `feat/cloudflare-lan-automation`. The site can
be fully built and verified locally before the tunnel exists; the first
`rpi deploy` of the site is the acceptance test for the ingress setup.

## Verification

Local (before any deploy):

- `docker compose up` in `rpi-deploy-site` → page serves on the mapped port.
- Playwright/browser check: page renders, copy buttons put the right text on
  the clipboard, no console errors, layout holds at 360 px / 768 px / 1440 px.

After deploy:

- `rpi status` shows `rpi-deploy-site` healthy (healthcheck `GET /` → 2xx).
- `https://rpi.iiskelo.com` serves the page with valid TLS.
- README link and release-skill addition merged in this repo.
