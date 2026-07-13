# Landing page audit — auditor briefs

Run after every `rpi-deploy` release. Four read-only auditors, each with a narrow lens —
spawn them in parallel as Explore-type subagents; they report discrepancies, they never
edit files. Narrow lenses are the point: one broad "check the landing" pass skims and
misses, four auditors each reading their sources end to end don't.

This file is the source of truth for the audit and lives in the site repo (not the pi
repo) so it stays next to what it audits. The pi repo's `release` skill points here.

## Why this is unconditional

The landing once sat five releases stale — quick-start step 1 still printed `rpi 0.12.0`
when v0.17.1 was current — because the release checklist used to say "check whether this
release changed anything the landing shows", and that got answered from memory ("probably
not") instead of by reading the page. Drift accumulates across releases, so run the full
audit even when this release "obviously" changed nothing user-visible — the drift you find
is usually from earlier releases, not this one.

## Shared context

Site repo (`rpi-deploy-site`, this repo): no build step, no framework.

- `src/index.html` — the whole page: hero (terminal mock, install pill, hero-meta line),
  how-it-works (3 cards), features grid (10 cards), quick start (4 steps), dogfood aside,
  footer.
- `src/copy.js` — copy buttons; the *full* copied payload lives in each button's
  `data-copy` attribute in the HTML and can differ from the visible snippet (that's
  intentional).
- `src/assets/og.png` — generated screenshot of the hero (`npm run og`,
  `scripts/generate-og.mjs`); stale whenever the hero changes.
- `src/llms.txt`, `src/robots.txt`, `src/sitemap.xml` — discovery files for crawlers and
  LLM agents; see Auditor 4.
- `src/styles.css` — cosmetic, out of scope.

Pi repo (`rpi-deploy` itself, sibling directory `C:\Users\Khmil\RustProjects\pi`, or
`git@github.com:khmilevoi/rpi-deploy.git`) — sources of truth for everything above:

- `package.json` / `Cargo.toml` `[workspace.package]` — the current released version.
- `README.md` — the "Highlights" section and the opening paragraph (the README no longer
  has a "Status:" line or a "Supported features" list; features live under "Highlights").
- `.github/workflows/release.yml` — which prebuilt-binary targets actually exist.
- `crates/bin/src/output/` (esp. `pipeline.rs`) — what `rpi deploy` output really looks
  like.
- `rpi.toml` schema: the config structs in `crates/` (search for the deserialization of
  `schema`, `[project]`, `[ingress]`) and real `rpi.toml` files in the ecosystem as living
  examples.

The shields.io npm badge (`img.shields.io/npm/v/rpi-deploy`) updates itself — never flag
it. Every *literal* number and claim in the HTML, and in the discovery files, is
hand-written and can drift.

## Report format (all auditors)

For each discrepancy:

- **Where**: `src/index.html:<line>` (or the relevant file in this repo)
- **Page says**: quote it
- **Reality**: what is true now, with the evidence path in the pi repo
- **Fix**: one-line suggested change

End the report with the list of items you checked that were clean — so an empty findings
list is distinguishable from a skipped check. If you could not verify something (e.g. no
built binary to run), say so explicitly instead of guessing.

## Auditor 1 — facts and numbers

Every literal claim on the page vs current reality. Work through:

1. Version strings: `grep -nE '[0-9]+\.[0-9]+\.[0-9]+' src/index.html`. Known trap:
   quick-start step 1 shows an install transcript ending in `✓ rpi <version>` — it must
   equal the current version in the pi repo's `package.json`. This exact string once sat
   five releases stale. Note the `og:image` URL carries a `?v=<version>` cache-bust param
   (`assets/og.png?v=0.21.1`) so social scrapers fetch the regenerated preview without a
   CDN purge — it must be bumped to the current version every release the hero (and thus
   `og.png`) changes; the grep above surfaces it alongside the other version strings.
2. The install command (`npm install -g rpi-deploy`) — still the recommended install path
   per the pi README.
3. The hero-meta line ("MIT · prebuilt binaries · Linux / macOS / Windows") — check each
   claim separately: license file, and the *actual* build matrix in
   `.github/workflows/release.yml` plus the npm postinstall fallback (`scripts/` in the pi
   repo). If a platform gets a source build rather than a prebuilt binary, the page should
   not imply otherwise.
4. `<title>`, `<meta name="description">`, and all `og:*` / twitter tags — product claims
   ("one command", "no registry, no Kubernetes, no YAML pipelines", "over plain SSH")
   still true; og:url still the live domain.
5. Footer: license, GitHub / npm links resolve to the right places.

## Auditor 2 — CLI output fidelity

**Principle: the page's terminal blocks are transcriptions of real `rpi` output, not
marketing mocks.** Every marker, glyph, colour, stage name, and wording must be
reproducible from the rendering code. When the CLI's output changes, the page changes with
it, and any line the tool never prints is an invention to remove — not creative licence.
You cannot run a real deploy without a Pi, so audit against the rendering code below and
say so in your report.

Sources of truth (pi repo) — read these, don't guess:

- `crates/bin/src/output/theme.rs` — the active theme. Default is `raspberry`: accent
  `#C51A4A`, success green `#75A928`, warn amber `#d4a017`, and **marker `▸`** — *not* `●`,
  which is the retired `classic` theme. The marker is always painted accent.
- `crates/bin/src/output/banner.rs` — the deploy banner printed at the top of every
  interactive `rpi deploy`: a 5-row density-ramp triangle (`░▒▓▓█`, row widths 2·4·6·4·2)
  with a per-row pink `#F06CA0` → raspberry `#C51A4A` sweep, wordmark `r p i` (bold) +
  `deploy · <project>`. Also `deploy_stamp`:
  `deployed ✓ <project>  →  <url> · <n> services (<elapsed>)`.
- `crates/bin/src/output/pipeline.rs` — staged collapse: each finished stage prints
  `✓ <stage> (<elapsed>)` (green `✓`, plain stage name, muted elapsed); `✗ <stage>` on
  failure, `· <stage> skipped` when skipped; lines emitted between stages print plain.
- `crates/application/src/deploy.rs` `run_stages` — the real stage order and plain lines.
  Stages: **fetch** → **build** → **start** → **health** → **route** (only when
  `[ingress].hostname` is set) → **gc** (always, last). Plain lines: `fetched <sha>` after
  fetch; `secrets injected (<k> keys, <f> files)` **only when the project has
  `[secrets]`**; a `project '<name>': host port <n>` line is emitted first but lands in
  the pre-stage pane that is cleared on the first stage event, so it does **not** appear
  in the final output.
- `crates/bin/src/cli/commands.rs` `deploy()` — the two status lines
  `▸ agent <version> (api <api>)` and `▸ deployment <uuid> started; streaming logs:`. The
  agent `version` is `CARGO_PKG_VERSION` (e.g. `0.17.1`, no `v`); `api` is the string `v1`
  (`crates/bin/src/agent/http.rs`); `<uuid>` is a v4 UUID
  (`crates/infrastructure/src/sys.rs`).
- `crates/bin/src/output/mod.rs` — line shapes: `status()`/`info()` = `▸ <text>` (accent
  bold marker, untinted text); `success()` = `▸ <text>` with the text tinted green.

**Use this site's own deploy as the example** — the page is itself deployed by
`rpi deploy` (`rpi-deploy-site`, one `web` service, ingress `rpi.iiskelo.com`), and the
dogfood aside already says so, so the hero terminal should depict *this* project's real
deploy, not a fictional `my-app`. Canonical transcript (raspberry theme) the hero terminal
must mirror:

```
$ rpi deploy
░░
▒▒▒▒    r p i
▓▓▓▓▓▓  deploy · rpi-deploy-site
▓▓▓▓
██
▸ agent 0.17.1 (api v1)
▸ deployment 3f9c21a4-8b7e-4c2a-9f1d-2e6a5b0c7d84 started; streaming logs:
✓ fetch (1.4s)
fetched 4f2a91c
✓ build (38.2s)
✓ start (2.1s)
✓ health (1.2s)
✓ route (0.6s)
✓ gc (0.3s)
▸ deployed ✓ rpi-deploy-site  →  https://rpi.iiskelo.com · 1 service (44.9s)
```

(No `secrets injected` line — `rpi-deploy-site`'s `rpi.toml` has no `[secrets]`. `route`
is present because a hostname is configured; `gc` is always last. `1 service` is
singular — `deploy_stamp` pluralises.) Colour map: `▸` raspberry; `✓` and the whole stamp
line green; elapsed `(…)` muted; banner rows pink→raspberry top-to-bottom; plain lines
default fg.

**Refresh this against the current build every release** — don't trust this transcript or
the page blindly; the numbers, `api` string, stage set, and stamp shape drift as the CLI
evolves. The site deploys via `rpi deploy`, so `rpi` is installed and its commands can be
run locally in the site repo to see real rendering: `rpi --version`, `rpi ls`,
`rpi status` (force colour off-TTY with `CLICOLOR_FORCE=1 COLORTERM=truecolor`). Re-derive
the transcript from the code above each release and reconcile the page with it.

Check each against the code above:

1. Hero terminal (`.terminal-body` in `src/index.html`): markers are `▸` (never `●`);
   stages are fetch→build→start→health→route→gc in order, in the collapsed
   `✓ stage (elapsed)` form; the closing stamp matches `deploy_stamp` (glyph / project /
   `→` url / service count / elapsed). Project, url and service count are this site's real
   values. No line present that the code never emits.
2. Quick-start step 4 (`rpi deploy` mini): real glyphs — `✓ build (…)`, `▸ deployed ✓ …`
   — with no invented spinner line.
3. Quick-start step 2 (`rpi setup`): the closing line is a `▸ <green text>` success, not a
   `✓ …` (the `✓` is only a stamp/stage glyph, never a message marker).
4. Quick-start step 1: install shape; the version check uses a real command
   (`rpi --version` → `rpi X.Y.Z`), not an invented `✓ rpi <ver>` stamp. (Auditor 1 owns
   the number itself.)

## Auditor 3 — features and quick start

Capabilities and configuration shown on the page vs what the tool does today.

1. Features grid (10 cards) vs the pi README "Highlights" section and the opening
   paragraph. Two directions:
   - Each card's claim still accurate (queue semantics, secrets, tunnel ingress, health
     checks, port allocation, logs/stats/lifecycle, one-off commands, prebuilt installs).
   - Any flagship capability shipped since the page was written that's missing? The grid
     is curated — don't demand a card per subcommand; flag only features a user would
     choose the tool for (e.g. a new deploy pipeline view, theming, doctor diagnostics).
2. How-it-works cards: CLI on your machine / systemd agent that clones + builds +
   allocates a stable port / reachable via Cloudflare Tunnel or your own ingress — still
   the true architecture.
3. rpi.toml: both the visible snippet in quick-start step 3 *and* the full example inside
   that button's `data-copy` attribute must be valid against the current schema (field
   names, `schema = 1`, `[project]`/`[source]`/`[ingress]` shape). Check against the
   config structs in the pi repo's `crates/` and its own `rpi.toml` files.
4. Quick-start sequence (install → agent setup on the Pi + `rpi setup` on the machine →
   write rpi.toml → `rpi deploy`) — still the real minimal path. If the tool has grown a
   shorter path (e.g. `rpi init` scaffolding the toml), report it as an option; the main
   agent decides whether the page changes.

## Auditor 4 — discovery files (llms.txt, sitemap.xml, robots.txt)

These exist so search engines and LLM agents can find and summarize the project without
parsing the full page — they drift the same way the HTML does, and nobody eyeballs them
during a normal release.

1. `src/llms.txt` — an `llmstxt.org`-style summary an LLM reads instead of the HTML. Check:
   - The one-line description and install command match `src/index.html`'s hero/meta
     description and the pi README.
   - "Quick start" steps match `src/index.html`'s 4 quick-start steps (same order, same
     commands).
   - "Key features" bullets match the features grid (Auditor 3's list) — add a bullet for
     any flagship feature Auditor 3 flags as missing from the HTML grid, remove any that
     no longer apply.
   - Links (GitHub, npm) resolve.
2. `src/sitemap.xml` — single-URL sitemap for `https://rpi.iiskelo.com/`. Bump `<lastmod>`
   to the release/deploy date whenever `src/index.html` content changes as part of this
   audit (not on every deploy — only when the page actually changed).
3. `src/robots.txt` — mostly static (`Allow: /` plus a `Sitemap:` pointer). Just confirm
   the `Sitemap:` URL still resolves and still points at `sitemap.xml`; flag only if the
   domain or file name ever changes.

Fixes here are low-risk (no visual regression possible) — apply directly rather than just
reporting, then note what changed.

## Post-deploy: purge the CDN cache

The site sits behind a Cloudflare Tunnel, and static assets (`styles.css`, `copy.js`,
`src/assets/**`) have no content hash in their filename, so Cloudflare's edge cache has no
way to know they changed on deploy — it keeps serving the pre-deploy bytes until its TTL
expires (observed: `styles.css` served from cache ~72 minutes stale, missing an entire
release's worth of changes, while `index.html` — served as `Cf-Cache-Status: DYNAMIC`, never
cached — was already current). A deploy can look complete (`rpi deploy` succeeds, the HTML
updates instantly) while the page actually renders with stale CSS/JS/fonts for every visitor
until the cache clears on its own.

**The common release case needs no purge — and no Cloudflare token.** A version-sync
release usually touches only `src/index.html`, the discovery files, and `src/assets/og.png`.
`index.html` and the discovery files (`llms.txt`, `sitemap.xml`, `robots.txt`) are served
`Cf-Cache-Status: DYNAMIC` — never edge-cached — so they update the instant the origin
deploys. `og.png` is exempt too, but for a different reason: nothing ever links to the bare
`/assets/og.png`; it is referenced only through the `og:image` URL's `?v=<version>`
cache-bust param (Auditor 1, step 1). Bumping that param every release makes the reference a
brand-new URL that misses the edge cache and fetches the freshly-deployed image, so the
stale bytes cached under the old `?v=` are never served to anyone — the `?v=` bump *is* the
purge, done at author time without touching Cloudflare. (Verified after the v0.22.0 deploy:
`/assets/og.png?v=0.22.0` returned the new 68089-byte hero on a `Cf-Cache-Status: HIT`,
byte-identical to the locally regenerated file.) So when a deploy changes only `index.html`,
the discovery files, and `og.png`, **skip the purge entirely** — there is nothing stale to
clear, and the Cloudflare API token (which lives with the account owner, not in this repo) is
not needed. This is the escape hatch when you don't hold the token: keep asset changes to
`og.png` (already `?v=`-guarded) and `index.html`/discovery files, and no purge is required.

A purge is required **only** when the deploy changes a hashless cached asset that IS
referenced by a stable, un-versioned path: `src/styles.css`, `src/copy.js`,
`assets/favicon.svg`, or an `assets/fonts/*.woff2`. Those have no `?v=` guard, so the edge
keeps serving pre-deploy bytes until the TTL expires. After such a deploy:

1. Purge Cloudflare's cache for this zone — dashboard (`Caching → Configuration → Purge
   Cache`, "Purge Everything" is fine for a site this size) or the API:
   ```
   curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
     -H "Authorization: Bearer {api_token}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything": true}'
   ```
   (Zone ID and an API token with `Cache Purge` permission live with whoever manages the
   Cloudflare account — not in this repo.)
2. Verify: `curl -sI https://rpi.iiskelo.com/styles.css` — `Cf-Cache-Status` should read
   `MISS` or `DYNAMIC` on the first request after purge (a `HIT` means the purge didn't
   take or hasn't propagated yet), and `diff <(curl -s https://rpi.iiskelo.com/styles.css)
   src/styles.css` should be empty. Don't rely on `index.html` alone to confirm a deploy
   landed — it may already be current while CSS/JS lag behind it, exactly as above.

**Custom purge must target the stale assets themselves, not the page.** A custom purge of
just `https://rpi.iiskelo.com/` does nothing for this problem — that URL was never cached
in the first place (`Cf-Cache-Status: DYNAMIC`). List `styles.css`, `copy.js`,
`assets/favicon.svg`, `assets/og.png`, and each `assets/fonts/*.woff2` explicitly, or use
"Purge Everything" if unsure what's cached.

## Pitfalls hit while building this audit (read once, avoid repeating)

Concrete mistakes made while setting up self-hosted fonts, the discovery files, and this
audit brief — kept here so the next pass doesn't re-learn them the hard way.

- **A CSS custom property can look like a reasonable brand color and still fail contrast
  against the specific background it's used on.** `--raspberry` (`#C51A4A`) and `--faint`
  (`#4b525c`) both read fine by eye on `--panel` (`#12141a`) but measured 3.17:1 and 2.33:1
  — both under the 4.5:1 WCAG AA minimum for small text. Don't eyeball contrast; compute it
  (relative luminance formula, or Lighthouse's `color-contrast` audit) against the *actual*
  background each use site renders on, not against a color that "feels dark enough."
- **An explicit `width`/`height` on an image must match the size it actually renders at,
  not the image's intrinsic size.** Setting `width="88" height="20"` (the npm badge SVG's
  native size) fixed the CLS `unsized-images` audit but broke a *different* one
  (`image-aspect-ratio`), because `.badge` forces `height: 18px` in CSS — the attributes
  must encode the post-CSS aspect ratio (`79×18`), not the source file's. Check both audits
  together after touching any image's dimensions.
- **Adding a file to `src/` does not mean it ships.** `robots.txt`, `sitemap.xml`, and
  `llms.txt` were added under `src/` and worked in local dev (`npm run dev` serves `src/`
  directly) but the `Dockerfile`'s `COPY` list was never updated, so they'd have been
  missing from the built image and therefore from production. Any new top-level file in
  `src/` needs a matching `Dockerfile` `COPY` entry — local dev serving a directory doesn't
  prove the container ships the same files.
- **A "successful" deploy can still serve a broken mix of old and new files.** See
  "Post-deploy: purge the CDN cache" above — `rpi deploy` finishing and the live HTML
  reflecting the latest commit does *not* mean the whole page is current, because
  Cloudflare's edge cache holds CSS/JS/assets independently of the origin's deploy state.
  Verifying "the fix is live" requires diffing the actual served bytes
  (`curl … | diff - src/…`) file by file, not just checking that the page loads or that one
  file (usually `index.html`) looks right.
- **No cache headers at all is its own bug, distinct from stale cache.** Before
  `nginx.conf` was added, the container sent no `Cache-Control` whatsoever (plain
  `nginx:alpine` defaults), which is what Lighthouse's `cache-insight` flagged — a separate
  problem from the CDN staleness above, and one that had to be fixed at the origin
  (`nginx.conf`) rather than by purging anything.
