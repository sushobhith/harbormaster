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
| TP-34 | D-026 | `test_golden` byte-identical: generation untouched by the revamp | pending |
| TP-35 | D-023 | `test_tide`: page follows `prefers-color-scheme`; `#theme` overrides it and the override survives a reload; `@media print` ground is Day | pending |
| TP-36 | D-024 | `test_tide` + existing `test_ui`: every id in D-024 present with its element type; the segment button texts unchanged; `test_ui` passes unedited | pending |
| TP-37 | D-021 | `test_tide`: at 390×844, `#board` is ≥ 340px wide and its bottom edge is ≤ 844px at 4p and 6p classic; `document.documentElement.scrollWidth ≤ 390` | pending |
| TP-38 | D-020 | `test_tide`: contrast ≥ 4.5:1 (computed from `getComputedStyle`, first opaque ancestor as ground) for body, muted, tagline, button, fairness, player-row, seed and token-number text in both modes | pending |
| TP-39 | D-025 | `test_assets`: page load makes no request to `fonts.googleapis.com` or `fonts.gstatic.com`; `@font-face` rules for Manrope and Instrument Serif point at files under `fonts/` that exist and report `loaded` in `document.fonts` | pending |
| TP-40 | D-027 | `test_assets`: `og-image.png` is 1200×630 (pngjs); outside CI its mtime is not older than `docs/og-card.html` | pending |
