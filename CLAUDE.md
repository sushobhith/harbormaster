# Harbormaster — Fair Catan Setup Generator

Single-file static web app that generates balanced Catan boards with **pre-assigned starting
settlements, roads, and fixed ports** for 3–6 players. Built July 2026 for Sushobhith's game
group (they play 4-player base and 6-player extension). Seafarers "Heading for New Shores"
mode added 2026-07-09 (requested on Reddit by a 5-player Seafarers group).

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
   Seed namespace is `seed|players` for classic and `seed|players|sea` for Seafarers — the
   `|sea` suffix is appended ONLY for sea maps so pre-Seafarers shared links keep their boards.
2. **Data (`SETUPS`)** — `base` (19 hex, rows 3-4-5-4-3) and `ext` (30 hex, rows 3-4-5-6-5-4-3),
   official resource counts and token sets, and `portSeq` (see Ports below). Plus Seafarers
   `sea3`/`sea4`/`sea56` (see Seafarers section).
3. **Geometry (`buildGeom`)** — takes the whole `setup`. Classic: pointy-top hexes from `rows`.
   Seafarers: flat-top hexes from `grid` strings (matches rulebook diagram orientation), even
   columns half a hex lower; each hex gets `region` (main/island/sea) and geom gains
   `mainVertIds` (vertices touching main land, none island) + `cellIndex` (r,c → hex id).
   Side S=52 both ways; dedupes vertices, builds hex-adjacency and vertex-adjacency (edges).
   Vertex distance rule = adjacency in that graph.
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
   **Two modes** (`state.mode`, toggle in toolbar, `&m=board` in hash): `fair` (default,
   pre-assigns settlements/roads/turn order) and `board` (balanced board + ports only, players
   draft their own — `render(...,null)` skips settlements/roads, `renderBoardPanel()` replaces
   the aside, reroll + method cards hidden). Added 2026-07-07 in response to r/Catan feedback
   that placement is core skill; board-only mode keeps the board balance without removing the draft.
   **Two maps** (`state.map`, toggle in toolbar, `&map=sea` in hash): `classic` and `sea`
   (Seafarers New Shores). Map is orthogonal to mode. `body[data-map]` drives `.sea-only` /
   `.classic-only` legend, cheat-sheet, and footer swaps.
9. **Test hook** — `window.__hm.run(seed, players, map="classic", noPorts=false)` drives the real pipeline and
   returns raw board data (+ `region` per hex and `map` echo on sea maps only — the classic
   return shape is frozen by the golden test). This is what the test harness uses; don't remove it.

## Ports — photo-verified, DO NOT re-randomize

The user's physical frames have ports printed at fixed spots. Read from the photos in
`docs/frames/`. Encoded in `SETUPS.*.portSeq` (types) + `SETUPS.*.portAt` (exact perimeter
edge indices), clockwise starting past the **west (left) edge** (perimeter edges sorted by
`atan2` angle ascending = clockwise from west; index 0 is the first edge past due west):

- 4-player (30 perimeter edges): `ore, any, sheep, any, any, brick, wood, any, wheat`
  at edges `1, 4, 7, 11, 14, 17, 21, 24, 27`
- 6-player (38 edges): `brick, sheep, wood, any, wheat, any, ore, any, sheep, any, any`
  at edges `2, 5, 8, 11, 14, 16, 20, 25, 28, 32, 37`

**Re-measured 2026-09-01** after the user reported the 4-player layout didn't match their
frame (a 3:1 sat on the row-2 left hex instead of the row-1 left hex). The old code placed
ports at `round(i * perimeterLen / nPorts)`, which is off by an edge in most slots and puts
the lone port of a 1-port frame panel off-centre. Both frames were re-derived photogrammetrically:
segment the frame photo (blue sea → hole → minus coast sand) to get the land polygon, fit a
homography from the model 30-/38-gon to it, then read each port off its two dock planks, which
point at the two vertices of its edge. Every port on both frames was confirmed that way.

The base result is the real Catan frame rule and has exact 3-fold symmetry: seams every 5
edges (at perimeter vertices 4, 9, 14, 19, 24, 29), panels alternate **2 ports at panel
positions 0 and 3** / **1 port dead centre**. The type sequence is the same cyclic order as
before — the fix re-anchors it by one slot, so the pairings the user recognises (sheep next
to a 3:1 on one panel) are preserved.

Caveats: the 2:1 icons come from low-res crops of the 4-player photo. Brick is confirmed
directly on both frames, and the 3:1-vs-2:1 pattern pins the whole sequence's alignment
(it only matches at one rotation), so the types are on solid ground; a single icon could
still be mislabelled. If the user reports a mismatch, fix the one entry in `portSeq` — do
not touch `portAt`, and never re-derive positions from an even-spacing formula.

## Seafarers — "Heading for New Shores" (added 2026-07-09)

`SETUPS.sea3/sea4/sea56` encode the official scenario, transcribed from the rulebook PDFs
(Seafarers 2021 3-4p pp.8-10; Seafarers 5-6 Extension 2020 pp.6-7) by overlaying a labeled
hex lattice on 150-200dpi page renders. Verified against the component tables: terrain pools,
both number-token sets (main/island), harbor counts all match exactly.

- `grid` strings: flat-top cells, `.`=none `~`=sea `m`=main `i`=island; even columns half a
  hex LOWER. 3p: 14 main + 8 island + 15 sea; 4p: 19 (incl. 1 desert) + 9 + 16; 5-6p: the
  classic ext island (30) + 10 island (3 gold) + sea ring. A couple of outer sea hexes are
  printed on the physical frame rather than loose tiles — same in play; if a user reports an
  outer-ring mismatch vs their frame, tweak the grid string, it's cosmetic only.
- **Harbors**: positions fixed from the diagram (`portEdges` {r,c,k}, k: 0=lower-right,
  1=bottom, 2=lower-left, 3=upper-left, 4=top, 5=upper-right); TYPES random from `portPool`
  (rulebook shuffles tokens face-down). 2:1-off-own-resource constraint still applies.
- **Rules honored**: starting settlements + road targets on the main island only
  (`geom.mainVertIds` filters in drawSettlements/planRoads); regions get their own resource
  pools and token sets (swaps never cross regions); gold carries a token, counts full pips;
  sea is fixed, exempt from same-resource adjacency; robber renders on first desert (3p has
  none); pirate marker on the diagram hex (`pirate:[r,c]`, none for 5-6p).
- **v1 simplifications** (documented in the cheat sheet): starting roads only (official rules
  allow a ship instead); the 2-VP-per-island race isn't priced into start values.

## Testing (run before every deploy)

```bash
node test/test_golden.mjs "$PWD"             # classic outputs byte-identical to the frozen baseline
node test/test_balance.mjs "$PWD" 100        # from repo root; needs playwright importable
node test/test_page.mjs "$PWD"               # render/theme/constraint smoke test
```

`test_golden.mjs` compares classic `__hm.run` output hashes against
`test/golden_classic.json` (**re-captured 2026-09-01** with the corrected `portAt` port
positions; the 2026-07-09 baseline is void — moving a port re-rolls resources, numbers and
settlements, so every classic seed changed and old shared links draw a different board). ANY
further classic diff = regression. Re-capture the baseline only if a classic-visible change is
intentional and announced.

`__hm.run(seed, players, map, noPorts, allRes)` — the last two args drive the toolbar
toggles. `test_ui.mjs` §8b covers the All-5 toggle (hash, pill, 5/5 coverage, distance rule);
`test_balance.mjs` still runs with both toggles off, so after touching `drawSettlements`
also re-check All-5 by hand (verified 2026-09-01 over 30 seeds × 3/4/5/6p × classic/sea:
distance rule, no duplicate vertices, legal roads, determinism, sea main-island rule and
No-port-starts combined — all clean).

`test_balance.mjs` runs N seeds × {3,4,5,6} players through `__hm.run` and checks:
- **Invariants (must be 0):** adjacent 6/8, adjacent twins, 2-next-12, same-resource
  neighbours, settlement distance violations, 2:1-port-touches-own-resource.
- **Distributions:** start-value gap (expect ≤1 in ≥90%, ≤2 in ~100%), red exposure,
  coverage (min ≥3 always), vs greedy-snake-draft baseline.
- Determinism (same seed twice ⇒ identical) and zero page errors.

Baseline results (2026-09-01, 300 seeds × 3/4/5/6p classic, post port fix): all hard
invariants 0; value gap ≤1 in 93–98%, ≤2 in 99–100%; coverage min ≥3 in 100%. Road-target
contention (`roadMissing`/`dupTargets`, not invariants) rose ~15-25% vs the old port layout —
different port corners, same generator. Sea maps are byte-identical (they use `portEdges`).
Seafarers baseline (2026-07-09, 100 seeds × 3/4/5/6p): all invariants 0 (incl. seaToken,
badStart, badTarget, badScenario); value gap ≤1 in 93–98%, ≤2 in 100%; 17–53ms/setup.

## SEO / analytics addenda (2026-07-09)

Vercel Web Analytics tag added (`/_vercel/insights/script.js`) — the user must also enable
Web Analytics in the Vercel dashboard (project `harbormaster` → Analytics) or the script 404s
and no data collects. There is NO pre-2026-07-09 visitor data (nothing was ever installed).
FAQ `<details>` in the footer + FAQPage JSON-LD in head; sitemap has `<lastmod>` — bump it on
content deploys. Still user-action-pending: Google Search Console verification + sitemap
submission, Bing import, Reddit/BGG backlinks.

## Backlog / ideas the user may ask for

- Port position fine-tuning if a physical mismatch is reported (see Ports caveats) — same
  applies to the Seafarers outer sea ring (cosmetic grid-string fix).
- (Cleared 2026-07-09: Seafarers mode, no-port-starts toggle, print layout, snake-draft
  stat on Board only, demo GIF refresh with mixed maps/player counts.)

## Toolbar extras (2026-07-09)

- **No port starts** (`#noPorts`, hash `&np=1`, fair mode only): filters port vertices out of
  settlement candidates in `drawSettlements` (6th arg). Falls back to allowing ports if a
  board can't seat everyone port-free. Filter runs after scoring, so RNG draws are unchanged
  and golden stays intact with the toggle off.
- **All 5 resources** (`#allRes`, hash `&a5=1`, fair mode only, added 2026-09-01): re-deals
  the starts so **every** player's two settlements produce all five base resources. Passed as
  the 7th arg of `drawSettlements` + 6th of `planRoads`. Three layers:
  1. *Search* — diversity weighted into the greedy score (weight cycles 2.2→7.0 across
     attempts), the whole independent set kept as a **swap reserve** instead of stopping at
     2N picks, objective key flipped to `[-covmin, spread, redspan]`, and deterministic
     1-swap repair sweeps (pair↔pair and pair↔reserve, no `rnd()`, so replays are stable).
     A 2nd phase with a 1-pip floor runs only if phase 1 leaves someone short. ~98% of
     players land 5/5 here.
  2. *`solveAllRes` (exact)* — runs only when the search still falls short. Enumerates every
     legal non-adjacent pair that already covers all five, backtracks for nPlayers mutually
     compatible ones (step-budgeted: 600k, keeps up to 60 solutions), then re-balances each
     solution with the same coverage-first repair and returns the best. This is what makes
     the toggle a guarantee rather than a best-effort; if it finds nothing, the board really
     can't seat everyone and the heuristic's best stands.
  3. *`planRoads`* — a player who still lacks something gets their road aimed at it
     (`missing` set, +4 per missing resource in the target score, shrunk as roads are fixed);
     the card then reads "Wheat via road".
  Measured 2026-09-01 (60 seeds × 3/4/5/6p × classic/sea): **100% of players at 5/5**,
  24–161ms/setup average, worst single setup 954ms (6p classic). Coverage outranks the pip
  gap while on, so `spread ≤2` drops to ~88–100% of setups (max seen 6, on the small sea-3p
  map) — that trade is the point of the toggle, and the ±N pill still shows it honestly.
- **Print** (`#print`): `window.print()` + `@media print` block at the end of the stylesheet —
  forces the light palette (overrides both dark mechanisms), hides toolbar/method/footer,
  two-column cards, `print-color-adjust:exact` so hex fills survive.
- **Board only** now shows a snake-draft spread ("a solid snake draft lands within ±N pips")
  via `snakeSpread()` — same greedy model as the test baseline; no rnd() calls, so it can't
  perturb determinism.

## User context

- Group plays both 4p and 6p; fairness is the whole product. User feedback so far:
  short names, simple scannable explanations (the in-page "cheat sheet"
  card — keep that style), ports must match their physical frame exactly.

## Build tier: T1

AI builds it end to end. Shipped; also a Koduo dogfood repo.

**Default tools for this repo:** tdd · refactor-clean · build-error-resolver

*Recorded 2026-09-15, confirmed by Sushobhith. This exists because the tiering
previously lived only in a chat session, so every new session re-guessed it from
how the code looked — which is wrong for any project whose intent differs from
its current state. Tier is an intent, not an observation. Change it here.*
