# Harbormaster — Fair Catan Setup Generator

Single-file static web app that generates balanced Catan boards with **pre-assigned starting
settlements, roads, and fixed ports** for 3–6 players. Built July 2026 for Sushobhith's game
group (they play 4-player base and 6-player extension).

- **Live (canonical):** https://harbormaster.vercel.app — Vercel project `harbormaster`
  (sushobhiths-projects; renamed from `fairhex` 2026-07-06, and `ssoProtection` disabled so the
  site is public). GitHub: https://github.com/sushobhith/harbormaster
- **Deploy (TWO steps — the alias does NOT auto-follow):**
  1. `vercel deploy --prod --yes`
  2. `vercel alias set "$(vercel ls | grep -oE 'https://harbormaster-[a-z0-9]+-sushobhiths-projects.vercel.app' | head -1)" harbormaster.vercel.app`
  Skipping step 2 leaves the public URL on the previous deploy (og-image/robots/sitemap 404,
  stale title). Verify after: `curl -sI https://harbormaster.vercel.app/og-image.png` → 200.
  No build step; `index.html` is the whole app.
- **Also published** as a Claude artifact: https://claude.ai/code/artifact/eb2f82e4-a8ef-45b6-a984-265ff21a98db
  (note: the Artifact tool wants the file WITHOUT `<!doctype>/<html>/<head>/<body>` wrapper —
  strip the wrapper before republishing there; Vercel wants it WITH).

## SEO / deploy assets (root, deployed; rest is .vercelignore'd)

`index.html` head has full SEO: keyword title/description, canonical, Open Graph + Twitter
card (image → `/og-image.png`), and WebApplication JSON-LD. `robots.txt` + `sitemap.xml`
point at the canonical URL. `og-image.png` (1200×630) is rendered from `docs/og-card.html`
(uses `docs/assets/board-dark.png`) — re-render with a headless screenshot if the card
changes. `.vercelignore` keeps the deploy to just the static files (index.html, og-image,
robots, sitemap). To improve ranking further the user must add the site to Google Search
Console and get backlinks (Reddit/BGG) — on-page SEO alone won't outrank established sites.

## Why this exists

Online generators (catan.bunge.io, catanboard.com, alexbeals.com, settlersboard.com, verified
via Playwright July 2026) balance boards but none assign per-player starting settlements.
This tool's whole point: **everything decided before the game — board, numbers, ports,
2 settlements + 2 roads per player, turn order — all balanced.**

## Architecture (all inside index.html)

One `<script>` IIFE, sections in order:

1. **RNG** — seeded (xmur3 + mulberry32). Same `#s=<seed>&p=<players>` URL ⇒ identical setup.
2. **Data (`SETUPS`)** — `base` (19 hex, rows 3-4-5-4-3) and `ext` (30 hex, rows 3-4-5-6-5-4-3),
   official resource counts and token sets, and `portSeq` (see Ports below).
3. **Geometry (`buildGeom`)** — pointy-top hexes, side S=52; dedupes vertices, builds
   hex-adjacency and vertex-adjacency (edges). Vertex distance rule = adjacency in that graph.
4. **Generation pipeline** (order matters):
   `placePorts` (fixed) → `placeResources` (local search: no same-resource neighbours AND no
   resource touching its own 2:1 port) → `placeNumbers` (local search: no adjacent 6/8, no
   adjacent twins, no 2-next-to-12, per-resource pip fairness) →
   `drawSettlements` → `planRoads`.
5. **Fairness model** — pip = dots on token (ways to roll /36). Player start value =
   pips of both settlements + port worth (3:1 = +1.0, 2:1 = +1.5, +0.5 if the pair produces
   ≥4 pips of that resource; see `pairEff`). `drawSettlements`: greedy top-2N vertex pick with
   jitter under distance rule, pair strongest-with-weakest, then swap-optimize with
   lexicographic key (value spread ↓, min diversity ↑, red-6/8-exposure spread ↓); 60 restarts.
6. **Roads (`planRoads`)** — each settlement points at the best *legal future settlement spot*
   (not blocked by distance rule); weakest players claim targets first; contested target
   beats no target; "open coast" is the last resort.
7. **Turn order** — weakest start value plays first (compensates the residual ±1 pip gap,
   since pre-assignment removes the snake draft).
8. **Render/panel** — SVG board + per-player cards. `renderPanel` shows pips, port bonus,
   per-settlement hex chips, road targets, coverage, turn.
9. **Test hook** — `window.__hm.run(seed, players)` drives the real pipeline and returns
   raw board data. This is what the test harness uses; don't remove it.

## Ports — photo-verified, DO NOT re-randomize

The user's physical frames have ports printed at fixed spots. Read from photos in
`docs/frames/` (July 2026). Encoded in `SETUPS.*.portSeq`, clockwise starting at the
**west (left) edge** (perimeter edges sorted by `atan2` angle ascending = clockwise from west):

- 4-player: `any, sheep, any, any, brick, wood, any, wheat, ore`
- 6-player: `any, brick, sheep, wood, any, wheat, any, ore, any, sheep, any`

Positions: perimeter edge index `round(i * perimeterLen / nPorts)` — 30 edges/9 ports (base),
38 edges/11 ports (ext). Known caveats: positions may be ±1 edge vs the physical frame
(measured from angled photos); 2:1 icons were read from low-res crops — brick/wheat/sheep-pair
are high confidence, wood-vs-sheep on adjacent tokens was resolved by inventory. If the user
reports a mismatch, fix the single entry in `portSeq`.

## Testing (run before every deploy)

```bash
node test/test_balance.mjs "$PWD" 100        # from repo root; needs playwright importable
node test/test_page.mjs "$PWD"               # render/theme/constraint smoke test
```

`test_balance.mjs` runs N seeds × {3,4,5,6} players through `__hm.run` and checks:
- **Invariants (must be 0):** adjacent 6/8, adjacent twins, 2-next-12, same-resource
  neighbours, settlement distance violations, 2:1-port-touches-own-resource.
- **Distributions:** start-value gap (expect ≤1 in ≥90%, ≤2 in ~100%), red exposure,
  coverage (min ≥3 always), vs greedy-snake-draft baseline.
- Determinism (same seed twice ⇒ identical) and zero page errors.

Baseline results (2026-07-06, 400 setups): all invariants 0; value gap ≤2 in 99–100%.

## Backlog / ideas the user may ask for

- Toggle: forbid starting settlements on ports (pure production starts).
- Print-friendly layout for the table.
- Port position fine-tuning if a physical mismatch is reported (see Ports caveats).

## User context

- Group plays both 4p and 6p; fairness is the whole product. User feedback so far:
  short names, simple scannable explanations (the in-page "cheat sheet"
  card — keep that style), ports must match their physical frame exactly.
