# rpi-deploy Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Terminal-first one-page landing site for rpi-deploy (static HTML/CSS + tiny clipboard JS), plus its deployment config, in this repo — ready for `rpi deploy` to `https://rpi.iiskelo.com` once the Cloudflare Tunnel exists.

**Architecture:** One semantic `index.html` styled by one `styles.css` (CSS custom properties for the palette), one `copy.js` for clipboard buttons, static assets, and a `nginx:alpine` Docker image described by `Dockerfile` + `docker-compose.yml` + `rpi.toml`. No build step, no framework, no webfonts. The visual reference is `docs/spec/2026-07-09-landing-page-mockup.html` — match it, but write clean production CSS (the mockup's inline styles are a mockup artifact).

**Tech Stack:** HTML5, CSS3 (custom properties, flex, grid), vanilla JS (Clipboard API), nginx:alpine, Docker Compose, rpi-deploy.

**Testing model (adaptation of TDD for a static site):** each task starts by running its verification (expect FAIL), then implements, then re-runs verification (expect PASS), then does a browser check where relevant, then commits. Verifications are exact `grep -F` assertions (run via the Bash tool) plus Playwright browser checks (`mcp__playwright__browser_*` tools) against a local server.

## Global Constraints

Every task implicitly includes these. Copy values verbatim — do not improvise.

- Dark theme **only**. No light theme, no theme switch.
- No webfonts. Mono stack: `Consolas, "SF Mono", Menlo, "DejaVu Sans Mono", monospace`. Sans stack: `"Segoe UI", system-ui, -apple-system, sans-serif`.
- No JS frameworks, no build step. The only JS is `copy.js`.
- The **only external request** on the page is the npm badge: `https://img.shields.io/npm/v/rpi-deploy?style=flat-square&label=npm&labelColor=161b22&color=30363d` (alt="npm version"). If shields.io is down the `img` just doesn't render — no fallback.
- Palette tokens (exact hex): raspberry `#C51A4A`, green `#75A928`, bg `#0b0d10`, panel `#0d1117`, panel-alt `#161b22`, border `#30363d`, border-faint `#1c2128`, text `#e6edf3`, muted `#8b949e`, faint `#484f58`, amber `#d4a017`.
- **Truthfulness:** every command shown must match the real rpi-deploy v0.12 CLI. Real flow: dev machine `npm install -g rpi-deploy` → `rpi setup` (wizard) → `rpi init` (wizard); on the Pi `sudo npm install -g rpi-deploy` → `sudo rpi agent setup`; then `rpi deploy`. **Never** write `rpi setup pi@raspberrypi.local` (invented syntax). TOML snippets: one key per line — `service = "web", port = 3000` on one line is invalid and was already caught once.
- Quick-start cards must be **equal height** (grid stretch + flex-column cards + `flex: 1` code blocks; short steps padded with an output line).
- Layout must hold at 360 px, 768 px, 1440 px viewport widths. No horizontal page scroll at 360 px.
- `index.html` must have: `lang="en"`, viewport meta, title, description, Open Graph tags (og:image = `https://rpi.iiskelo.com/assets/og.png`), SVG favicon.
- Docker: image is `FROM nginx:alpine` + `COPY` only (it builds **on the Pi**, aarch64 — no node/build steps). Compose service must be named `web` with `expose: "80"` and **never** a host `ports:` mapping (conflicts with rpi's stable host-port allocator).
- `rpi.toml` sits at the repo root, content verbatim from this plan (Task 8).
- Prefix shell commands with `rtk` (per CLAUDE.md), e.g. `rtk git add …`. The `rpi` CLI itself is run bare.
- End every git commit message with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Local server for browser checks: `rtk npx -y serve -l 8080 .` from the repo root, run in the background once and left running (clipboard API needs localhost or https — `file://` won't work).

## File Structure

```
index.html          # whole page markup — built up across Tasks 1–5
styles.css          # tokens + all styling — built up across Tasks 1–4
copy.js             # clipboard for data-copy buttons        (Task 5)
assets/favicon.svg  # raspberry ▸ on dark                    (Task 1)
assets/og.png       # 1200×630 hero screenshot               (Task 7)
Dockerfile          # nginx:alpine + COPY                    (Task 8)
docker-compose.yml  # single service "web", expose 80        (Task 8)
rpi.toml            # deploy config for THIS site            (Task 8)
README.md           # status update                          (Task 9)
```

---

### Task 1: Page skeleton, design tokens, nav, footer, favicon

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `assets/favicon.svg`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: CSS custom properties `--raspberry --green --bg --panel --panel-alt --border --border-faint --text --muted --faint --amber --font-mono --font-sans`; classes `.accent` (raspberry text), `.badge` (shields img sizing); the `<main>` element into which Tasks 2–4 insert sections; section anchor ids `#how-it-works`, `#features`, `#quick-start` referenced by the nav.

- [ ] **Step 1: Run verification — expect FAIL (files don't exist yet)**

Run (Bash tool):
```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F '<html lang="en">' index.html && \
grep -F -- '--raspberry: #C51A4A' styles.css && \
grep -F 'fill="#C51A4A"' assets/favicon.svg
```
Expected: `No such file or directory` / non-zero exit.

- [ ] **Step 2: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>rpi-deploy — deploy to your Raspberry Pi with one command</title>
<meta name="description" content="rpi-deploy builds and runs your Docker Compose projects on a Raspberry Pi — over plain SSH. No registry, no Kubernetes, no YAML pipelines.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://rpi.iiskelo.com/">
<meta property="og:title" content="rpi-deploy — deploy to your Raspberry Pi with one command">
<meta property="og:description" content="Builds and runs your Docker Compose projects on the Pi — over plain SSH. No registry, no Kubernetes, no YAML pipelines.">
<meta property="og:image" content="https://rpi.iiskelo.com/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="nav">
  <span class="wordmark"><span class="accent">▸</span> rpi-deploy</span>
  <nav class="nav-links">
    <a href="#how-it-works">how it works</a>
    <a href="#features">features</a>
    <a href="#quick-start">quick start</a>
    <a class="nav-github" href="https://github.com/khmilevoi/rpi-deploy">GitHub ★</a>
  </nav>
</header>
<main>
  <!-- hero: Task 2 -->
  <!-- how it works + features: Task 3 -->
  <!-- quick start + dogfooding: Task 4 -->
</main>
<footer class="footer">
  <span class="footer-brand"><span class="accent">▸</span> rpi-deploy · MIT license</span>
  <span class="footer-links">
    <a href="https://github.com/khmilevoi/rpi-deploy">GitHub</a>
    <a href="https://www.npmjs.com/package/rpi-deploy">npm</a>
    <img class="badge" src="https://img.shields.io/npm/v/rpi-deploy?style=flat-square&amp;label=npm&amp;labelColor=161b22&amp;color=30363d" alt="npm version">
  </span>
</footer>
</body>
</html>
```

Note: no `<script>` tag yet — `copy.js` doesn't exist until Task 5; referencing it now would put a 404 in the console and fail the QA gate.

- [ ] **Step 3: Write `styles.css`**

```css
/* ---------- tokens ---------- */
:root {
  --raspberry: #C51A4A;
  --green: #75A928;
  --bg: #0b0d10;
  --panel: #0d1117;
  --panel-alt: #161b22;
  --border: #30363d;
  --border-faint: #1c2128;
  --text: #e6edf3;
  --muted: #8b949e;
  --faint: #484f58;
  --amber: #d4a017;
  --font-mono: Consolas, "SF Mono", Menlo, "DejaVu Sans Mono", monospace;
  --font-sans: "Segoe UI", system-ui, -apple-system, sans-serif;
}

/* ---------- base ---------- */
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
}

a { color: inherit; text-decoration: none; }

code { font-family: var(--font-mono); }

.accent { color: var(--raspberry); }

.badge { height: 18px; vertical-align: middle; }

/* ---------- nav ---------- */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: var(--bg);
  border-bottom: 1px solid var(--border-faint);
}

.wordmark {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}

.nav-links a:hover { color: var(--text); }

.nav-github {
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px 10px;
}

/* ---------- footer ---------- */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 40px;
  padding: 36px 40px;
  border-top: 1px solid var(--border-faint);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}

.footer-links { display: inline-flex; align-items: center; gap: 24px; }

.footer-links a:hover { color: var(--text); }

/* ---------- responsive: nav + footer ---------- */
@media (max-width: 640px) {
  .nav { padding: 16px 20px; }
  .footer { padding: 28px 20px; }
}

@media (max-width: 480px) {
  .nav-links a:not(.nav-github) { display: none; }
}
```

(The `max-width: 480px` rule hides the three anchor links on narrow phones — at 360 px the full link row plus wordmark overflows; the GitHub button stays.)

- [ ] **Step 4: Write `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0b0d10"/>
  <text x="32" y="46" font-family="monospace" font-size="44" fill="#C51A4A" text-anchor="middle">▸</text>
</svg>
```

- [ ] **Step 5: Re-run Step 1 verification**

Same command. Expected: all three greps print their match, exit 0.

- [ ] **Step 6: Browser check**

Start the local server in the background if not running: `rtk npx -y serve -l 8080 .` (from repo root). With Playwright browser tools: `browser_navigate` to `http://localhost:8080`, `browser_take_screenshot`. Expected: dark `#0b0d10` page; sticky top bar with `▸ rpi-deploy` wordmark (raspberry `▸`), mono nav links, bordered `GitHub ★` button; footer at bottom with GitHub / npm links and the shields npm badge; raspberry `▸` favicon in the tab.

- [ ] **Step 7: Commit**

```bash
rtk git add index.html styles.css assets/favicon.svg
rtk git commit -m "feat: page skeleton, design tokens, nav and footer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Hero — headline, install pill, terminal window

**Files:**
- Modify: `index.html` (inside `<main>`, replacing the `<!-- hero: Task 2 -->` comment)
- Modify: `styles.css` (append)

**Interfaces:**
- Consumes: tokens and `.accent`, `.badge` from Task 1.
- Produces: `.copy-btn` class and `data-copy` attribute convention (a `<button type="button" class="copy-btn" data-copy="…">⧉</button>`; Task 5's `copy.js` binds to `[data-copy]` and toggles class `copied`); color utility classes `.green .raspberry .muted .faint .amber` reused by Task 4's code blocks; `.prompt` (green `$`).

- [ ] **Step 1: Run verification — expect FAIL**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F 'one command' index.html && \
grep -F 'data-copy="npm install -g rpi-deploy"' index.html && \
grep -F 'rpi deploy' index.html && \
grep -F '.install-pill' styles.css
```
Expected: non-zero exit (no matches yet).

- [ ] **Step 2: Add hero markup to `index.html`**

Replace `<!-- hero: Task 2 -->` with:

```html
  <section class="hero">
    <div class="hero-copy">
      <h1>Deploy to your Raspberry&nbsp;Pi with <span class="accent">one command</span>.</h1>
      <p class="hero-sub">rpi-deploy builds and runs your Docker Compose projects on the Pi — over plain SSH. No registry, no Kubernetes, no YAML pipelines.</p>
      <div class="install-pill">
        <code><span class="prompt">$</span> npm install -g rpi-deploy</code>
        <button type="button" class="copy-btn" data-copy="npm install -g rpi-deploy" aria-label="Copy install command">⧉</button>
      </div>
      <p class="hero-meta">MIT · prebuilt binaries · Linux / macOS / Windows · <img class="badge" src="https://img.shields.io/npm/v/rpi-deploy?style=flat-square&amp;label=npm&amp;labelColor=161b22&amp;color=30363d" alt="npm version"></p>
    </div>
    <div class="hero-terminal">
      <div class="terminal">
        <div class="terminal-bar">
          <span class="dot dot-raspberry"></span>
          <span class="dot dot-green"></span>
          <span class="dot dot-grey"></span>
          <span class="terminal-title">~/my-app</span>
        </div>
        <pre class="terminal-body"><span class="green">$</span> rpi deploy
<span class="green">●</span> config    rpi.toml <span class="muted">(my-app → pi)</span>
<span class="green">●</span> tunnel    ssh pi@raspberrypi.local
<span class="green">●</span> fetch     main @ 4f2a91c
<span class="raspberry">⠧</span> build     docker compose build…
<span class="faint">│ #12 exporting layers</span>
<span class="faint">│ #12 naming to my-app-web…</span>
<span class="green">●</span> healthy   GET / → 200 <span class="muted">(1.2s)</span>
<span class="green">✓</span> deployed  https://app.example.com <span class="muted">42s</span></pre>
      </div>
    </div>
  </section>
```

(The transcript is the approved hand-written stylization of real v0.12 output — keep it verbatim, including alignment spaces inside the `<pre>`.)

- [ ] **Step 3: Append hero CSS to `styles.css`**

```css
/* ---------- hero ---------- */
.hero {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 36px;
  padding: 56px 40px;
}

.hero-copy { flex: 1; min-width: 280px; }

.hero h1 {
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: 32px;
  line-height: 1.25;
}

.hero-sub {
  margin: 0 0 22px;
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.6;
}

.install-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  background: var(--panel-alt);
  border: 1px solid var(--raspberry);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 13px;
}

.prompt { color: var(--green); }

.copy-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}

.copy-btn:hover { color: var(--text); }

.copy-btn.copied { color: var(--green); }

.install-pill .copy-btn {
  border-left: 1px solid var(--border);
  padding-left: 12px;
}

.hero-meta {
  margin: 14px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

.hero-terminal { flex: 1.2; min-width: 300px; }

.terminal {
  overflow: hidden;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, .5);
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--panel-alt);
}

.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-raspberry { background: var(--raspberry); }
.dot-green { background: var(--green); }
.dot-grey { background: var(--border); }

.terminal-title {
  margin-left: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

.terminal-body {
  margin: 0;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.85;
  overflow-x: auto;
}

/* ---------- terminal color utilities (reused by quick-start blocks) ---------- */
.green { color: var(--green); }
.raspberry { color: var(--raspberry); }
.muted { color: var(--muted); }
.faint { color: var(--faint); }
.amber { color: var(--amber); }

/* ---------- responsive: hero ---------- */
@media (max-width: 640px) {
  .hero { padding: 40px 20px; }
  .hero h1 { font-size: 26px; }
  .hero-terminal { min-width: 0; width: 100%; }
}
```

- [ ] **Step 4: Re-run Step 1 verification**

Expected: all four greps match, exit 0.

- [ ] **Step 5: Browser check**

`browser_navigate` to `http://localhost:8080`, `browser_take_screenshot`. Compare with the hero of `docs/spec/2026-07-09-landing-page-mockup.html` (open it in another tab): two columns; h1 with raspberry "one command"; raspberry-bordered install pill with green `$` and `⧉`; meta line with badge; terminal with three dots, `~/my-app` title, green `●`/`✓` markers, raspberry spinner `⠧`, faint docker log lines.

- [ ] **Step 6: Commit**

```bash
rtk git add index.html styles.css
rtk git commit -m "feat: hero with install pill and deploy terminal

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: "How it works" and "Features" sections

**Files:**
- Modify: `index.html` (inside `<main>`, replacing `<!-- how it works + features: Task 3 -->`)
- Modify: `styles.css` (append)

**Interfaces:**
- Consumes: tokens, `.accent` from Task 1.
- Produces: `.section` / `.section-label` / `.card` classes reused by Task 4's quick-start section; ids `how-it-works` and `features` that the Task 1 nav already links to.

- [ ] **Step 1: Run verification — expect FAIL**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F 'id="how-it-works"' index.html && \
grep -F 'Two binaries, one SSH connection' index.html && \
grep -F 'id="features"' index.html && \
grep -c 'class="card feature"' index.html
```
Expected: non-zero exit. (Final expected count for the last grep: `8`.)

- [ ] **Step 2: Add markup to `index.html`**

Replace `<!-- how it works + features: Task 3 -->` with:

```html
  <section class="section" id="how-it-works">
    <p class="section-label"># HOW IT WORKS</p>
    <h2>Two binaries, one SSH connection</h2>
    <div class="hiw-row">
      <div class="card hiw-card">
        <p class="card-index">[1] your machine</p>
        <h3>rpi CLI</h3>
        <p>Run <code>rpi deploy</code> from your project. Works from a laptop or CI.</p>
      </div>
      <div class="hiw-arrow" aria-hidden="true"><span class="h">──ssh──▸</span><span class="v">ssh ▾</span></div>
      <div class="card hiw-card">
        <p class="card-index">[2] raspberry pi</p>
        <h3>rpi agent</h3>
        <p>A systemd daemon clones your repo, builds the Compose stack, allocates a stable port.</p>
      </div>
      <div class="hiw-arrow" aria-hidden="true"><span class="h">──▸</span><span class="v">▾</span></div>
      <div class="card hiw-card">
        <p class="card-index">[3] the internet</p>
        <h3>your app, live</h3>
        <p>Health-checked and reachable — via Cloudflare Tunnel or your own ingress.</p>
      </div>
    </div>
  </section>

  <section class="section" id="features">
    <p class="section-label"># FEATURES</p>
    <h2>Everything a deploy needs, nothing it doesn't</h2>
    <div class="features-grid">
      <div class="card feature">
        <p class="feature-num">01</p>
        <h3>Latest-wins deploy queue</h3>
        <p>Push twice — the newest deploy wins, the stale one is cancelled.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">02</p>
        <h3>Encrypted secrets</h3>
        <p>Env files and secret files (certs, keys) delivered as sealed bundles.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">03</p>
        <h3>Cloudflare Tunnel ingress</h3>
        <p>A public hostname for your app without opening a single port.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">04</p>
        <h3>Health checks</h3>
        <p>HTTP or TCP probes gate every deploy — broken builds never go live.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">05</p>
        <h3>Stable port allocation</h3>
        <p>Each project keeps its host port across deploys. No conflicts.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">06</p>
        <h3>Logs, stats, lifecycle</h3>
        <p><code>rpi logs -f</code>, <code>rpi stats</code>, start/stop/restart — without leaving your shell.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">07</p>
        <h3>One-off commands</h3>
        <p>Migrations, backups, invites — declared in <code>rpi.toml</code>, run in the container.</p>
      </div>
      <div class="card feature">
        <p class="feature-num">08</p>
        <h3>Installs in seconds</h3>
        <p>Prebuilt binaries for Linux, macOS, Windows via npm. No Rust toolchain.</p>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Append section CSS to `styles.css`**

```css
/* ---------- sections (shared) ---------- */
.section {
  padding: 48px 40px;
  border-top: 1px solid var(--border-faint);
  scroll-margin-top: 72px;
}

.section-label {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--raspberry);
}

.section h2 {
  margin: 0 0 28px;
  font-family: var(--font-mono);
  font-size: 22px;
}

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
}

/* ---------- how it works ---------- */
.hiw-row { display: flex; align-items: stretch; gap: 16px; }

.hiw-card { flex: 1; padding: 20px; }

.card-index {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--raspberry);
}

.hiw-card h3 { margin: 0 0 6px; font-size: 14px; font-weight: 600; }

.hiw-card p:last-child { margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.55; }

.hiw-card code { color: var(--text); }

.hiw-arrow {
  display: flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--green);
}

.hiw-arrow .v { display: none; }

/* ---------- features ---------- */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
}

.feature { padding: 18px; }

.feature-num {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--raspberry);
}

.feature h3 { margin: 0 0 5px; font-size: 13.5px; font-weight: 600; }

.feature p:last-child { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.5; }

.feature code { color: var(--text); font-size: 11.5px; }

/* ---------- responsive: sections ---------- */
@media (max-width: 860px) {
  .hiw-row { flex-direction: column; }
  .hiw-arrow { justify-content: center; }
  .hiw-arrow .h { display: none; }
  .hiw-arrow .v { display: block; }
}

@media (max-width: 640px) {
  .section { padding: 36px 20px; }
}
```

- [ ] **Step 4: Re-run Step 1 verification**

Expected: first three greps match; the `grep -c` prints `8`.

- [ ] **Step 5: Browser check**

`browser_navigate` to `http://localhost:8080`, screenshot. Expected vs mockup: three cards joined by green `──ssh──▸` / `──▸` arrows; features as a multi-column grid of 8 numbered cards (raspberry numbers). Also `browser_resize` to 700×900: the three cards stack vertically with `ssh ▾` / `▾` between them.

- [ ] **Step 6: Commit**

```bash
rtk git add index.html styles.css
rtk git commit -m "feat: how-it-works and features sections

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Quick start (equal-height cards) + dogfooding banner

This is the truthfulness-critical task — commands and TOML here were the source of both previously-caught bugs. Copy the markup below exactly.

**Files:**
- Modify: `index.html` (inside `<main>`, replacing `<!-- quick start + dogfooding: Task 4 -->`)
- Modify: `styles.css` (append)

**Interfaces:**
- Consumes: `.section`, `.section-label` (Task 3); `.copy-btn` + `data-copy` convention and color utilities `.green .raspberry .muted .faint .amber` (Task 2).
- Produces: `.qs-block` elements whose equal heights Task 6 asserts; four `data-copy` payloads that Task 5 wires up and verifies.

The four `data-copy` payloads (decoded values, for reference — the attribute encodings are in the markup below):

1. `npm install -g rpi-deploy`
2. `sudo rpi agent setup` ⏎ `rpi setup`
3. A **complete valid rpi.toml** (the displayed snippet is an abbreviated fragment; the copy payload must be the full file — spec requirement):
   ```toml
   schema = 1

   [project]
   name = "my-app"

   [source]
   repo = "git@github.com:you/my-app.git"
   branch = "main"

   [ingress]
   service = "web"
   port = 3000
   ```
4. `rpi deploy`

- [ ] **Step 1: Run verification — expect FAIL**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F 'id="quick-start"' index.html && \
grep -F 'sudo rpi agent setup' index.html && \
grep -F 'schema = 1&#10;' index.html && \
grep -F 'live from a Pi' index.html
```
Expected: non-zero exit.

- [ ] **Step 2: Add markup to `index.html`**

Replace `<!-- quick start + dogfooding: Task 4 -->` with:

```html
  <section class="section" id="quick-start">
    <p class="section-label"># QUICK START</p>
    <h2>Zero to deployed in four steps</h2>
    <div class="qs-grid">
      <div class="qs-step">
        <p class="qs-caption"><span class="qs-num">1.</span> Install the CLI on your machine</p>
        <div class="qs-block">
          <pre class="qs-code"><span class="green">$</span> npm install -g rpi-deploy
<span class="faint"># prebuilt binary — no Rust toolchain</span>
<span class="green">✓</span> rpi 0.12.0 <span class="muted">(4s)</span></pre>
          <button type="button" class="copy-btn" data-copy="npm install -g rpi-deploy" aria-label="Copy step 1 command">⧉</button>
        </div>
      </div>
      <div class="qs-step">
        <p class="qs-caption"><span class="qs-num">2.</span> Set up the Pi</p>
        <div class="qs-block">
          <pre class="qs-code"><span class="green">$</span> sudo rpi agent setup <span class="faint"># on the pi</span>
<span class="green">$</span> rpi setup <span class="faint"># on your machine</span>
<span class="green">✓</span> ready to deploy</pre>
          <button type="button" class="copy-btn" data-copy="sudo rpi agent setup&#10;rpi setup" aria-label="Copy step 2 commands">⧉</button>
        </div>
      </div>
      <div class="qs-step">
        <p class="qs-caption"><span class="qs-num">3.</span> Describe your project</p>
        <div class="qs-block">
          <pre class="qs-code"><span class="raspberry">[project]</span>
name = <span class="green">"my-app"</span>
<span class="raspberry">[ingress]</span>
service = <span class="green">"web"</span>
port = <span class="amber">3000</span></pre>
          <button type="button" class="copy-btn" data-copy="schema = 1&#10;&#10;[project]&#10;name = &quot;my-app&quot;&#10;&#10;[source]&#10;repo = &quot;git@github.com:you/my-app.git&quot;&#10;branch = &quot;main&quot;&#10;&#10;[ingress]&#10;service = &quot;web&quot;&#10;port = 3000&#10;" aria-label="Copy a complete rpi.toml">⧉</button>
        </div>
      </div>
      <div class="qs-step">
        <p class="qs-caption"><span class="qs-num">4.</span> Ship it</p>
        <div class="qs-block">
          <pre class="qs-code"><span class="green">$</span> rpi deploy
<span class="raspberry">⠧</span> build <span class="muted">→</span> <span class="green">●</span> healthy
<span class="green">✓</span> deployed <span class="muted">42s</span></pre>
          <button type="button" class="copy-btn" data-copy="rpi deploy" aria-label="Copy step 4 command">⧉</button>
        </div>
      </div>
    </div>
  </section>

  <aside class="dogfood">
    <span class="dogfood-emoji" aria-hidden="true">🍓</span>
    <div class="dogfood-text">
      <p class="dogfood-title">This page practices what it preaches.</p>
      <p>You're reading HTML served by nginx in a Docker container, deployed by <code>rpi deploy</code>, running on a Raspberry Pi behind a Cloudflare Tunnel.</p>
    </div>
    <span class="live-pill">● live from a Pi</span>
  </aside>
```

Do NOT alter the step-2 commands or the TOML — `rpi setup pi@raspberrypi.local` is invented syntax and comma-joined TOML keys are invalid; both were already caught once during brainstorming.

- [ ] **Step 3: Append CSS to `styles.css`**

```css
/* ---------- quick start ---------- */
.qs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  align-items: stretch;
}

.qs-step { display: flex; flex-direction: column; }

.qs-caption {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 12.5px;
}

.qs-num { font-family: var(--font-mono); color: var(--green); }

.qs-block {
  position: relative;
  flex: 1;
  display: flex;
}

.qs-code {
  flex: 1;
  margin: 0;
  padding: 12px 36px 12px 14px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
  overflow-x: auto;
}

.qs-block .copy-btn {
  position: absolute;
  top: 10px;
  right: 12px;
}

/* ---------- dogfooding ---------- */
.dogfood {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 40px;
  padding: 26px 28px;
  background: rgba(197, 26, 74, .06);
  border: 1px solid var(--raspberry);
  border-radius: 8px;
}

.dogfood-emoji { font-size: 26px; }

.dogfood-text { flex: 1; min-width: 260px; }

.dogfood-title {
  margin: 0 0 4px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
}

.dogfood-text p:last-child { margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.55; }

.dogfood-text code { color: var(--text); }

.live-pill {
  padding: 4px 12px;
  border: 1px solid var(--green);
  border-radius: 99px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--green);
  white-space: nowrap;
}

/* ---------- responsive: dogfooding ---------- */
@media (max-width: 640px) {
  .dogfood { margin: 0 20px; }
}
```

- [ ] **Step 4: Re-run Step 1 verification**

Expected: all four greps match, exit 0.

- [ ] **Step 5: Validate the copyable TOML payload**

Write this to `<scratchpad>/extract-toml.mjs` (use the session scratchpad directory, not the repo):

```js
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync(process.argv[2], "utf8");
const matches = [...html.matchAll(/data-copy="([^"]*)"/g)].map((m) =>
  m[1].replaceAll("&#10;", "\n").replaceAll("&quot;", '"').replaceAll("&amp;", "&")
);
console.log(JSON.stringify(matches, null, 2));
const toml = matches.find((t) => t.startsWith("schema = 1"));
writeFileSync(new URL("copy3.toml", import.meta.url), toml);
```

Run:
```bash
node "<scratchpad>/extract-toml.mjs" "C:/Users/Khmil/RustProjects/rpi-deploy-site/index.html" && \
rtk npx -y @taplo/cli lint "<scratchpad>/copy3.toml"
```
Expected: JSON output listing exactly 4 payloads — `npm install -g rpi-deploy`, `sudo rpi agent setup\nrpi setup`, the full TOML, `rpi deploy` — and taplo reports no errors on `copy3.toml`.

- [ ] **Step 6: Browser check**

Screenshot at default width. Expected vs mockup: four cards **visually equal in height**; green step numbers; raspberry TOML section headers, green strings, amber `3000`; raspberry-bordered dogfooding strip with 🍓 and green `● live from a Pi` pill.

- [ ] **Step 7: Commit**

```bash
rtk git add index.html styles.css
rtk git commit -m "feat: quick start and dogfooding banner

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: `copy.js` — clipboard for all `data-copy` buttons

**Files:**
- Create: `copy.js`
- Modify: `index.html` (add script tag before `</body>`)

**Interfaces:**
- Consumes: `[data-copy]` buttons and `.copied` class styling from Tasks 2/4.
- Produces: the final interactive page; nothing later depends on JS internals.

- [ ] **Step 1: Run verification — expect FAIL**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F '<script src="copy.js" defer></script>' index.html && \
grep -F 'navigator.clipboard.writeText' copy.js
```
Expected: non-zero exit.

- [ ] **Step 2: Write `copy.js`**

```js
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
    } catch {
      return; // clipboard unavailable (non-secure context) — leave the button as-is
    }
    button.classList.add("copied");
    button.textContent = "✓";
    setTimeout(() => {
      button.classList.remove("copied");
      button.textContent = "⧉";
    }, 1500);
  });
});
```

- [ ] **Step 3: Add the script tag to `index.html`**

Immediately before `</body>`:

```html
<script src="copy.js" defer></script>
```

- [ ] **Step 4: Re-run Step 1 verification**

Expected: both greps match, exit 0.

- [ ] **Step 5: Browser check — click behavior**

With the local server running, `browser_navigate` to `http://localhost:8080`, then `browser_click` on the install-pill copy button. Expected: the button briefly turns into a green `✓`, then back to `⧉` after ~1.5 s. If the browser context allows clipboard read, additionally `browser_evaluate` `navigator.clipboard.readText()` → exactly `npm install -g rpi-deploy` (if permission is denied, the ✓ feedback plus Task 4 Step 5's payload validation already cover correctness). Repeat the click check on one quick-start button. Then `browser_console_messages`: expected **no errors**.

- [ ] **Step 6: Commit**

```bash
rtk git add index.html copy.js
rtk git commit -m "feat: clipboard copy buttons

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: QA gate — responsive (360/768/1440), equal heights, validation, console

This task is a verification gate; it only changes code if a check fails.

**Files:**
- Modify (only if fixes needed): `index.html`, `styles.css`

**Interfaces:**
- Consumes: the complete page from Tasks 1–5.
- Produces: a page certified at all three breakpoints; Task 7 screenshots it.

- [ ] **Step 1: HTML validation**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && rtk npx -y html-validate index.html
```
Expected: exit 0, no errors. Fix any reported issue (they're usually small: stray attribute, heading order) and re-run until clean.

- [ ] **Step 2: Equal-height assertion (hard spec requirement)**

`browser_navigate` to `http://localhost:8080`, `browser_resize` to 1440×900, then `browser_evaluate`:

```js
() => [...document.querySelectorAll(".qs-block")].map((el) => el.offsetHeight)
```
Expected: four identical numbers. If not, fix the flex/stretch CSS from Task 4 — do not equalize by hardcoding heights.

- [ ] **Step 3: 1440 px visual pass**

At 1440×900 take a screenshot. Expected: hero two-column, features in 4–5 columns, quick start in 4 columns, everything matching the mockup's look.

- [ ] **Step 4: 768 px visual pass**

`browser_resize` to 768×1024, screenshot. Expected: hero columns may wrap; feature grid 2–3 columns; quick start 2 columns; how-it-works cards stacked with vertical `ssh ▾` arrows (breakpoint is 860 px); no overflow.

- [ ] **Step 5: 360 px visual pass + no horizontal scroll**

`browser_resize` to 360×800, screenshot, then `browser_evaluate`:

```js
() => document.documentElement.scrollWidth <= 360
```
Expected: `true`; hero stacked (terminal below copy), single-column grids, nav shows wordmark + GitHub button only, dogfooding banner stacked. Fix CSS if anything overflows (usual suspects: long unbroken strings in `pre` — they may scroll *inside* their own block via `overflow-x: auto`, that's fine; the page body must not scroll horizontally).

- [ ] **Step 6: Console + network sanity**

`browser_console_messages` at any width. Expected: no errors, no 404s (favicon, styles, copy.js all load; the only external request is the shields.io badge).

- [ ] **Step 7: Commit (only if fixes were made)**

```bash
rtk git add index.html styles.css
rtk git commit -m "fix: responsive QA fixes at 360/768/1440

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: og-image (1200×630 hero screenshot)

**Files:**
- Create: `assets/og.png`

**Interfaces:**
- Consumes: the QA-approved page (Task 6); the `og:image` meta from Task 1 already points to `https://rpi.iiskelo.com/assets/og.png`.
- Produces: `assets/og.png` shipped into the Docker image by Task 8.

- [ ] **Step 1: Install the Playwright browser (one-time, ~130 MB)**

```bash
rtk npx -y playwright@latest install chromium
```
Expected: chromium downloaded (or "already installed").

- [ ] **Step 2: Generate the screenshot**

With the local server still running on 8080:

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
rtk npx -y playwright@latest screenshot --viewport-size "1200,630" http://localhost:8080 assets/og.png
```
Expected: `assets/og.png` created; at 1200×630 the capture is the nav + hero (headline, pill, terminal) — exactly the right og-image content.

- [ ] **Step 3: Verify dimensions**

PowerShell tool:
```powershell
Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile("C:\Users\Khmil\RustProjects\rpi-deploy-site\assets\og.png"); "$($img.Width)x$($img.Height)"; $img.Dispose()
```
Expected output: `1200x630`. Also open the PNG with the Read tool and eyeball it: dark bg, headline readable, terminal visible.

- [ ] **Step 4: Commit**

```bash
rtk git add assets/og.png
rtk git commit -m "feat: og image (1200x630 hero screenshot)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Deployment config — `Dockerfile`, `docker-compose.yml`, `rpi.toml`

Prerequisite: Docker Desktop running locally.

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `rpi.toml`

**Interfaces:**
- Consumes: the finished static files (Tasks 1–7).
- Produces: the exact config `rpi deploy` (Task 10) consumes. Compose service name `web` must match `[ingress].service = "web"`.

- [ ] **Step 1: Run verification — expect FAIL**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F 'FROM nginx:alpine' Dockerfile && \
grep -F 'expose:' docker-compose.yml && \
grep -F 'hostname = "rpi.iiskelo.com"' rpi.toml
```
Expected: non-zero exit.

- [ ] **Step 2: Write `Dockerfile`**

```dockerfile
FROM nginx:alpine
COPY index.html styles.css copy.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
```

No build steps — `docker compose build` runs on the Pi (aarch64) and must finish in seconds.

- [ ] **Step 3: Write `docker-compose.yml`**

```yaml
services:
  web:
    build: .
    expose:
      - "80"
```

**Never add a host `ports:` mapping** — the rpi agent writes its own override mapping `127.0.0.1:<allocated>:80`; a `ports:` entry conflicts with the stable host-port allocator.

- [ ] **Step 4: Write `rpi.toml` (verbatim from the approved spec)**

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

- [ ] **Step 5: Re-run Step 1 verification + lint the TOML + validate compose**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F 'FROM nginx:alpine' Dockerfile && \
grep -F 'expose:' docker-compose.yml && \
grep -F 'hostname = "rpi.iiskelo.com"' rpi.toml && \
rtk npx -y @taplo/cli lint rpi.toml && \
rtk docker compose config --quiet
```
Expected: greps match; taplo clean; `docker compose config --quiet` exits 0. Also sanity-check `rpi.toml` against the rpi-toml skill if available (schema 1, `[project].name`, `[source].repo`, `[ingress].service`+`port` all present — they are).

- [ ] **Step 6: Build and run the container, verify every asset serves**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
rtk docker build -t rpi-deploy-site . && \
rtk docker run --rm -d -p 8090:80 --name rpi-site-test rpi-deploy-site
```
(Port 8090 to avoid clashing with the `serve` process on 8080. Do **not** use `docker compose up` for this — the compose file has no `ports:` on purpose.)

Then:
```bash
rtk curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/ && \
rtk curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/styles.css && \
rtk curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/copy.js && \
rtk curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/assets/favicon.svg && \
rtk curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090/assets/og.png && \
rtk curl -s http://localhost:8090/ | grep -F "one command"
```
Expected: five `200` lines and the h1 match. Cleanup:
```bash
rtk docker stop rpi-site-test
```

- [ ] **Step 7: Commit**

```bash
rtk git add Dockerfile docker-compose.yml rpi.toml
rtk git commit -m "feat: deployment config (Dockerfile, compose, rpi.toml)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: README status update, create GitHub repo, push

Creating the public repo + pushing is pre-authorized by the handoff ("Create it public when ready to push"). Everything before this task must be committed.

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: all committed work.
- Produces: public repo `github.com/khmilevoi/rpi-deploy-site` with `main` pushed — the `[source].repo` that the rpi agent clones in Task 10.

- [ ] **Step 1: Rewrite `README.md`**

Replace the whole file with:

```markdown
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
```

- [ ] **Step 2: Verify and commit**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
grep -F 'Status: implemented' README.md && \
rtk git add README.md && \
rtk git commit -m "docs: implemented status, local preview instructions

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
Expected: grep matches, commit created, `rtk git status` clean.

- [ ] **Step 3: Create the GitHub repo and push**

```bash
cd "C:/Users/Khmil/RustProjects/rpi-deploy-site" && \
rtk gh repo create khmilevoi/rpi-deploy-site --public --source . --push
```
Expected: repo created, `origin` remote added, `main` pushed.

- [ ] **Step 4: Verify the push**

```bash
rtk git remote -v && rtk gh repo view khmilevoi/rpi-deploy-site --json url,visibility
```
Expected: `origin  git@github.com:khmilevoi/rpi-deploy-site.git` (or https equivalent) and `"visibility": "PUBLIC"`.

---

### Task 10 (BLOCKED): First deploy to the Pi

**Blocked on:** a working Cloudflare Tunnel for `rpi.iiskelo.com` on the Pi. The domain exists in Cloudflare; the tunnel is **not** set up. Unblock either by manual setup per the rpi-deploy README, or by the automation being built on the pi repo branch `feat/cloudflare-lan-automation`. Do not attempt `rpi deploy` before then — this deploy is the acceptance test for the ingress setup.

**Files:** none (operational task).

**Interfaces:**
- Consumes: pushed repo (Task 9), `rpi.toml` (Task 8), a configured tunnel.
- Produces: the live site.

- [ ] **Step 1: Confirm prerequisites**

The Cloudflare Tunnel for `rpi.iiskelo.com` is configured on the Pi and the rpi agent is reachable (`rpi doctor` / `rpi status` succeed — see the rpi-cli skill for connection troubleshooting).

- [ ] **Step 2: Deploy**

From the repo root:
```bash
rpi deploy
```
Expected: config → fetch (main) → build (fast, COPY-only image) → healthy (`GET / → 2xx`) → deployed.

- [ ] **Step 3: Verify**

```bash
rpi status
rtk curl -sI https://rpi.iiskelo.com
```
Expected: `rpi-deploy-site` healthy; `HTTP/2 200` with valid TLS. Open `https://rpi.iiskelo.com` in a browser: the page renders identically to localhost.

- [ ] **Step 4: Cross-repo follow-ups (live in `C:\Users\Khmil\RustProjects\pi`, NOT here — remind the user)**

1. rpi-deploy `README.md`: add `Website: https://rpi.iiskelo.com` as its own paragraph directly after the opening description paragraph (before the "Status:" paragraph).
2. rpi-deploy `.claude/skills/release/SKILL.md` step 3 ("Update docs"): add a bullet — after a release, check whether anything the landing page shows changed (feature list, quick start, install instructions, CLI output look); if yes, update `rpi-deploy-site` and redeploy (`rpi deploy` from its root). Separate repo → post-release follow-up, not part of the release commit. The npm version badge updates itself.

---

## Execution notes

- Tasks 1–5 are strictly sequential (each edits `index.html`/`styles.css`). Task 6 gates Task 7. Task 8 needs 1–7 complete. Task 9 needs everything committed. Task 10 is blocked (see above) — stop after Task 9 and report; do not wait on the tunnel.
- Keep the `serve` background process running across Tasks 1–8; kill it when done.
- The npm version string `0.12.0` appears once as static text (quick-start step 1 output line). It's allowed to go stale — the release-skill follow-up (Task 10 Step 4) covers keeping the page fresh; the shields badge self-updates.
- If any browser check contradicts the mockup, the mockup wins (`docs/spec/2026-07-09-landing-page-mockup.html`) — it is the approved reference; the spec's palette/typography tables win over the mockup only where the handoff explicitly corrected it (TOML formatting, CLI syntax).
