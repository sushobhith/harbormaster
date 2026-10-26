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
