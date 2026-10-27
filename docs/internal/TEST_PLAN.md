# Harbormaster — Test Plan

Existing suites (all run in CI on every PR, `.github/workflows/ci.yml`):

| Suite | File | What it proves |
|---|---|---|
| Balance | `test/test_balance.mjs` | hard invariants 0 across 100 seeds × 3-6 players; value-gap distribution |
| Page | `test/test_page.mjs` | render, theme, constraint smoke |
| Golden | `test/test_golden.mjs` | classic output byte-identical to `test/golden_classic.json` (protects shared links) |
| UI | `test/test_ui.mjs` | toolbar, hash, copy-link, history, toggles (151 assertions) |

Rule: a guard is proven by making it fail first. A test that has never been red is not a test.

## Reserved ids for ROADMAP Step 1

| Id | Task | Assertion |
|---|---|---|
| TP-20 | 1.1 | `manifest.webmanifest` served, linked from `<head>`, valid per Lighthouse PWA audit |
| TP-21 | 1.1 | service worker registers; second load with network blocked renders a board |
| TP-22 | 1.1 | `test_golden` unchanged (no script change in the generation path) |
| TP-23 | 1.2 | each of the eight events fires exactly once per matching click (`test_ui`, PostHog stubbed) |
| TP-24 | 1.2 | no cookie is set and no `localStorage` key written by analytics after a full session |
| TP-25 | 1.2 | analytics load failure (script blocked) does not break generation |
| TP-26 | 1.3 | workflow: deploy job runs only after CI job succeeds; alias step present; smoke `GET /og-image.png` → 200 |
| TP-27 | 1.4 | `#tipLink` present in light and dark; absent in `@media print` |
| TP-28 | 1.5 | "Save image" produces a PNG ≥ 2× the SVG box, non-empty, in the current theme |
| TP-29 | 1.5 | export does not mutate `state` or the DOM board (`__hm.run` hash equal before and after) |

## Step 2 — domain cutover (D-011..D-013)

| Id | Decision | Assertion | Status |
|---|---|---|---|
| TP-30 | D-011 | live: `https://harbormaster.vercel.app/#s=abc&p=4` lands on `https://harbormaster.fyi/#s=abc&p=4` with a board drawn; `fairhex.vercel.app` and `/og-image.png?x=1` 308 to the new host with path and query intact (`test/test_redirect_live.mjs`, not in `npm test`) | green against live 2026-10-26 after D-016 (first deploy failed the root case, which is what it was for); rerun by hand after any deploy |
| TP-31 | D-012 | `test_page`: canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD `url` all start with `https://harbormaster.fyi/`; no `vercel.app` in `<head>` | green 2026-10-26, proven red first (canonical reverted) |
| TP-32 | D-012 | `test_page`: `sitemap.xml` `<loc>` and `robots.txt` `Sitemap:` name the new host; `<lastmod>` is a date in [2026-10-26, today] | green 2026-10-26, proven red first (lastmod 2026-10-16) |
| TP-33 | D-013 | `scripts/verify_live.sh` exits non-zero against a host that does not resolve and against `example.com` | proven 2026-10-26: exit 1 on both, `example.com` fails on the missing canonical despite its 200 |

## Step 3a — Tide revamp (D-020..D-029)

| Id | Decision | Assertion | Status |
|---|---|---|---|
| TP-34 | D-026 | `test_golden` byte-identical: generation untouched by the revamp | green 2026-10-27 after every landing (`golden: all 12 classic outputs identical`); cannot be red by design |
| TP-35 | D-023 | `test_tide`: page follows `prefers-color-scheme`; `#theme` overrides it and the override survives a reload; `@media print` ground is Day | green 2026-10-27, proven red first on the pre-revamp page (dark ground rgb(22,35,43), no stored key, print ground #fff) and once on the new page (theme-color stayed night under print, fixed) |
| TP-36 | D-024 | `test_tide` + existing `test_ui`: every id in D-024 present with its element type; the segment button texts unchanged; `test_ui` passes unedited | green 2026-10-27 (`test_ui` 176/176 unedited), proven red on the old page (`#theme` missing, `#reroll` text) and with `#options` renamed |
| TP-37 | D-021 | `test_tide`: at 390×844, `#board` is ≥ 340px wide and its bottom edge is ≤ 844px at 4p and 6p classic; `document.documentElement.scrollWidth ≤ 390` | green 2026-10-27 (board 358px, 6p bottom 517.8px), proven red on the old page (324px) and with the svg forced to 300px; the 6p bottom-edge half was never red (old page already within 844) |
| TP-38 | D-020 | `test_tide`: contrast ≥ 4.5:1 (computed from `getComputedStyle`, first opaque ancestor as ground) for body, muted, tagline, button, fairness, player-row, seed and token-number text in both modes | green 2026-10-27 (76 PASS), proven red on the old page (6/8 token 4.26) and with night muted set to #4a4d48 (2.19); legend pill and pressed segment added by the orchestrator, red 2.87 then green |
| TP-39 | D-025 | `test_assets`: page load makes no request to `fonts.googleapis.com` or `fonts.gstatic.com`; `@font-face` rules for Manrope and Instrument Serif point at files under `fonts/` that exist and report `loaded` in `document.fonts` | green 2026-10-27 after Piece A landed; red on the old page (0 @font-face) and with a temporary Google `<link>` (request caught); red with the Manrope file deleted |
| TP-40 | D-027 | `test_assets`: `og-image.png` is 1200×630 (pngjs); outside CI its mtime is not older than `docs/og-card.html` | green 2026-10-27 (1200×630, mtime after the card); proven red by `touch docs/og-card.html` and by a 1760×1752 png |

## Step 3b — Today's board, tile colours, front door (D-030..D-033)

| Id | Decision | Assertion | Status |
|---|---|---|---|
| TP-41 | D-031 | `test_ui`: `#today` is a `.btn` in `.row-sec` between `#reroll` and `#copy`; with the clock frozen at 2026-10-27 UTC, click sets the hash to `#s=today-2026-10-27&p=<n>` and `#seedLabel` to that seed; `aria-pressed` true after the click, false after `#newBoard`, true again after Back | green 2026-10-28 (`test_ui` 202/202), proven red on the pre-change page (10 FAIL lines: button missing, hash stayed `abc`, aria-pressed null) |
| TP-42 | D-031 | `test_ui`: two fresh pages clicking `#today` with the same player count and map render byte-identical `#board` innerHTML; changing players or map gives a different board that is itself stable across two pages | green 2026-10-28, proven red on the pre-change page and with the second page frozen to 2026-10-28 (seeds `today-2026-10-27` vs `today-2026-10-28`, boards differ) |
| TP-43 | D-031 | `test_golden` byte-identical; `__hm.run("today-2026-10-27", 4)` equals `__hm.run` of the seed the button produced on that frozen date, and opening `#s=today-2026-10-27&p=4` draws the same `#board` as the click did | green 2026-10-28 (golden identical after every landing), proven red with `todaySeed()` returning `day-…` (9 FAIL lines) |
| TP-44 | D-031 | `test_ui`: Copy link on today's board yields a link containing `s=today-2026-10-27` that reopens to the identical board; an old link `#s=abc&p=4` still draws its board with `#today` not pressed | green 2026-10-28, proven red on the pre-change page (link carried `s=x`, `#today` null on reopen and on the old link) |
| TP-45 | D-033 | `test_assets`: every `test:*` script in `package.json` except `test:quick` appears as a `run: npm run test:<name>` line in `.github/workflows/ci.yml` | green 2026-10-28, proven red on the pre-change `ci.yml` (`test:tide`, `test:assets` steps missing) |
| TP-46 | D-033 | `test_assets`: every image `README.md` or `docs/og-card.html` references under `docs/assets/` exists; no png or gif under `docs/assets/` is unreferenced by those two files or `scripts/`; outside CI each referenced png or gif's mtime is not older than `index.html`'s | green 2026-10-28, proven red on the pre-change tree (four orphan old-look pngs) and by `touch index.html` (both previews older) |
| TP-47 | D-030 | `test_tide`, both schemes: the eight tile tokens read with `getComputedStyle`; water hue within 195°–235°; pairwise CIE76 ΔE ≥ 20 for every tile pair, wheat/gold ≥ 15; TP-38 unchanged and green | green 2026-10-28 (Night min pair wheat/gold 17.7 ≥ 15, Day min 22.6; water 206°/204°), proven red on the live palette (water 172°/164°; 11 FAIL lines incl. desert/sea 18.0, sheep/desert 18.4, wood/sea 18.6) |
