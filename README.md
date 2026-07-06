# Harbormaster

Balanced Catan setup generator: board, numbers, fixed ports, and fair pre-assigned starting
settlements + roads for 3–6 players. One static file, no build.

**Live:** https://fairhex.vercel.app · share a setup via `#s=<seed>&p=<players>`

```
index.html          the entire app (edit this)
test/               Playwright test harness (balance sims + render smoke test)
docs/frames/        photos of the physical frames the port layouts were read from
CLAUDE.md           full context for future Claude sessions — read this first
```

## Commands

```bash
node test/test_balance.mjs "$PWD" 100   # balance simulation, 100 seeds × 3-6 players
node test/test_page.mjs "$PWD"          # render + constraint smoke test
vercel deploy --prod                    # ship
```
