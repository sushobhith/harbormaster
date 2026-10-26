# Harbormaster — Roadmap

Harbormaster is a free, open-source Catan setup generator (`harbormaster.vercel.app`). This file is the
single source of truth for where the project is and what comes next. Decisions and their reasons live
in `DECISIONS.md`; test ids in `TEST_PLAN.md`. Architecture is `CLAUDE.md` at the repo root.

The project is a weekend side project and a Koduo dogfood repo. It does not compete with Koduo for
weekday time (vault `ACTION_BOARD.md`).

## Current State (Last Updated: 2026-10-26)

<!-- Now = the single current focus. Per-step detail lives in that step's Status line, never here. -->

- **Now:** **Step 0 — docs and the first paid contributor.** This file, `DECISIONS.md` and
  `TEST_PLAN.md` written 2026-10-26. @bbyy21 (PR #19, merged 2026-10-16) has signed in to Koduo and
  holds a $25 credit; paying it by hand and marking the row paid closes Koduo step 10.11d.
- **Next:** Step 1 (five parallel Koduo tasks) and Step 2 (founder ops) run in the same fortnight.
  Step 3 waits on the research in Step 2 and two weeks of analytics baseline.
- **Baseline numbers (Vercel Analytics, read 2026-10-16):** 168 visitors / 229 views per 30 days,
  91% mobile. No custom events exist yet, so nothing is known about what visitors do on the page.
- **Blockers:** none on the build. Search Console, Bing and the domain need founder logins.

## The thesis, in one line

Nobody will pay for a board generator (every competitor is free and Catan is a trademark, D-001),
so the goal for the next 60 days is reach and quality, with a tip link as a signal. Whether anything
paid is ever built is decided at the Step 4 gate on measured numbers, not on hope.

---

## Step 0 — Docs and the first paid contributor
- **Why:** The plan lived in chat. The repo had a `CLAUDE.md` but no roadmap or decision log, so a
  Koduo task or an `/orchestrate` run had nothing to read.
- **Scope:** this file, `DECISIONS.md` (D-001 to D-007), `TEST_PLAN.md` (existing suites named,
  ids reserved). Founder: pay @bbyy21's $25 credit by hand, `mark-paid` the row.
- **Status:** docs written 2026-10-26. Payment pending (founder).

## Step 1 — Five Koduo tasks, in parallel
Each is one bounty-labelled issue on this repo. Koduo plans it, the AI lane or an outside contributor
builds it, CI verifies, the founder merges. They are chosen to touch different parts of the one-file
app so five PRs can land without conflicting (D-006). Bounty: $12 each (D-010). Issue text is
written the way an owner actually writes one: short, missing details, no acceptance criteria. Koduo's
plan step is what turns it into a spec; the TP ids in `TEST_PLAN.md` are what the founder checks at merge.

| # | Task | Touches | Exit condition |
|---|------|---------|----------------|
| 1.1 | **Installable on phones (PWA).** `manifest.webmanifest`, a service worker that caches `index.html` and the og image, theme colour, icons. Works offline once opened. | new files + `<head>` | Lighthouse PWA installable; airplane-mode reload renders a board; `test_page` green. TP-20..22 |
| 1.2 | **Usage analytics.** PostHog (or the tool D-003 names) loaded cookieless, EU-safe. Events: `board_new`, `board_reroll`, `mode_toggle`, `map_toggle`, `players_set`, `link_copy`, `print`, `tip_click`. No PII, no cookies banner needed. | script tail + a `track()` helper | Each event fires once per click in `test_ui`; no network call before consent is unnecessary (cookieless). TP-23..25 |
| 1.3 | **Deploy on merge.** GitHub Action: on push to `main` and CI green, `vercel deploy --prod` then the alias step from `CLAUDE.md`, then a smoke check of `/og-image.png` → 200. Ends the manual two-step. | `.github/workflows/deploy.yml`, docs | A docs-only merge produces a live deploy with the alias moved; `CLAUDE.md` deploy section updated. TP-26 |
| 1.4 | **Tip link.** Footer "Buy me a coffee" (D-004, platform D-009) and one short line under the board after a generate. Copy is the founder's (D-005). Element id `#tipLink` so 1.2 can count clicks. | footer HTML + one line in render | Link present in both themes, print layout hides it, `test_ui` asserts id. TP-27 |
| 1.5 | **Share the board as an image.** "Save image" button exports the SVG board (plus the player cards in fair mode) as a PNG for WhatsApp, Reddit and BGG. Client-side only. | one function + one toolbar button | PNG downloads at 2x, matches the on-screen theme, golden untouched. TP-28..29 |

- **Status:** not started. Issues drafted 2026-10-26, not yet posted.

## Step 2 — Founder ops and research, same fortnight
Nothing here is code. Order is by what unblocks the most.

1. **Clean the repo front door.** Close #6/#7/#8 naming deleted issue #4. Ask @mortenbruket-max to
   rebase #10 or close it with thanks. Answer #12/#13/#14 once with the @bbyy21 payout as proof and
   close two as duplicates. Reply to redditor_286 that the port bug shipped (drafted 2026-09-23).
2. **Domain (D-002).** Apply for `harbormaster.eu.org` (free); keep `vercel.app` live throughout.
   If eu.org has not approved within 30 days, stay on `vercel.app` and stop.
3. **Search.** Google Search Console verification + sitemap, Bing import. Pending since 2026-07-09.
4. **Research (deep-research, filed in the vault as `knowledge/pages/board-game-tools-monetisation.md`).**
   Question: what do users of free board-game tools actually pay or donate for, and what did tools
   that tried to charge get wrong. Sources: r/Catan, r/boardgames, BGG forums, Ko-fi and Buy Me a
   Coffee pages of comparable tools, Colonist.io's model. Must include the counter-examples. Output:
   a ranked list of candidate features with evidence, feeding Step 3.
5. **Post.** One r/Catan post and one BGG thread after Step 1 ships (fair settlements + Seafarers +
   phone install). Copy is the founder's.

- **Status:** not started.

## Step 3 — Build what the research says people value
- **Why:** Both previous features people asked for (board-only mode, Seafarers) came from r/Catan.
  Guessing is how hobby projects stay hobby projects.
- **Scope:** decided after Step 2.4 and two weeks of 1.2 data. Candidates on the table today, none
  committed: Cities & Knights setup; a "same board on every table" print sheet for clubs and
  tournaments; saved groups and game history (which would need accounts and a backend, D-007).
- **Status:** gated.

## Step 4 — The 60-day gate (late December 2026)
Three numbers decide it: monthly visitors, share from outside India, and whether a single tip
arrived. If visitors are in the thousands and tips are nonzero, open the paid-tier question, starting
with the trademark (D-001). Otherwise Harbormaster stays a well-made free tool and a Koduo dogfood
repo, which is already worth having.
