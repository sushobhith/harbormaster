# Contributing to Harbormaster

Thanks for dropping anchor. This is a tiny, dependency-free project, so contributing is low-ceremony.

## The shape of the thing

The entire app is **one file**: `index.html`. Everything (RNG, geometry, board generation, the balance optimizer, rendering) lives in a single `<script>` IIFE at the bottom. There is no framework, no bundler, no build step. Open the file, read top to bottom, and you have the whole program.

For a guided tour of how it all fits together — the generation pipeline, the fairness model, the port data — read [`CLAUDE.md`](CLAUDE.md). It is the architecture doc.

## Running it

```bash
open index.html          # or serve the folder: python3 -m http.server
```

Add `#s=<seed>&p=<players>` to the URL to reproduce a specific table.

## Before you open a PR

Run the test harness. It generates hundreds of boards and checks the hard rules never break and the balance stays tight.

```bash
npm install                              # playwright, for headless tests only
node test/test_balance.mjs "$PWD" 100    # balance sim across 3-6 players
node test/test_page.mjs "$PWD"           # render + constraint smoke test
```

A change is good to ship when `test_balance` reports **0 invariant violations** and a start-value gap of **2 or less in ~100%** of setups. If your change moves those numbers, say so in the PR.

## Fixing a port

The harbor layouts are hardcoded from photos of a real frame (in `docs/frames/`). If your physical set disagrees with the drawn board:

1. Find `SETUPS` near the top of the `<script>` in `index.html`.
2. Each board has a `portSeq` array, listed **clockwise starting from the west (left) edge**.
3. Change the single entry that is wrong (`"any"` for a 3:1, or a resource name like `"wheat"` for a 2:1).
4. Re-run the tests — the resource placer will re-balance the land around the corrected port automatically.

Please mention which edition/frame you have in the PR, since layouts differ between printings.

## Good first issues

- A **no-ports-on-starts** toggle (some groups prefer pure-production openings).
- A **print stylesheet** for setups you want on paper.
- Extra board geometries (Seafarers, Cities & Knights).
- Accessibility passes on the SVG board and player cards.

## Style

Match what is already there: terse, vanilla JS, no dependencies added to the runtime. Keep `index.html` self-contained — the "one file you can email to a friend" property is a feature, not an accident.
