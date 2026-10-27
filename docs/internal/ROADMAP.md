# Harbormaster — Roadmap

Harbormaster is a free, open-source Catan setup generator (`harbormaster.fyi`; `harbormaster.vercel.app` redirects). This file is the
single source of truth for where the project is and what comes next. Decisions and their reasons live
in `DECISIONS.md`; test ids in `TEST_PLAN.md`. Architecture is `CLAUDE.md` at the repo root.

The project is a weekend side project and a Koduo dogfood repo. It does not compete with Koduo for
weekday time (vault `ACTION_BOARD.md`).

## Current State (Last Updated: 2026-10-28)

<!-- Now = the single current focus. Per-step detail lives in that step's Status line, never here. -->

- **Now:** **Step 1 — post the five Koduo issues** (drafts in the Step 1 table, updated 2026-10-28 against
  the final markup: 1.1 fonts + both theme colours, 1.2 `board_today` + `theme_toggle`, 1.4 placement, 1.5 sea
  ring + `#today`). First the founder deploys 3b by hand: `vercel deploy --prod --yes`, the alias step,
  `scripts/verify_live.sh`, then tap Today's board on two phones (same UTC day ⇒ same board). Step 3b is
  **live since 2026-10-28 early morning** (deployed and pushed by the founder; status under Step 3). Still open from
  Step 2: pay @bbyy21's $25 credit and the Reddit reply.
- **Next:** Step 1 (five parallel Koduo tasks) and Step 2 (founder ops) run in the same fortnight.
  Step 3 waits on the research in Step 2 and two weeks of analytics baseline.
- **Baseline numbers (D-015, Vercel Analytics, 30 days 2026-09-26 to 2026-10-26, read 2026-10-26
  via `vercel api`):** 185 visitors / 254 views, 84% mobile (156 of 185). Countries: IN 68 (37%),
  US 36, CA 30, KR 14, GB 6, ES 6, AU 5, DE 4; 63% of visitors outside India. Referrers: almost all
  direct or unknown; google.com 9, reddit app 3, bing.com 2. Only `/` is ever requested. No custom
  events exist yet, so nothing is known about what visitors do on the page. Read command:
  `vercel api "/v1/query/web-analytics/visits/aggregate?projectId=prj_oja7dumJosgyqpxcTr8StJ15KVvX&teamId=team_4x1sKLrHjPimznzfpf0BkFag&since=...&until=...&by=country" --method GET`.
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
| 1.1 | **Installable on phones (PWA).** `manifest.webmanifest`, a service worker that caches `index.html`, the og image and `/fonts/*` (two woff2), `theme_color`/`background_color` for both Night `#0d1311` and Day `#f2eee5`, icons. Works offline once opened. | new files + `<head>` | Lighthouse PWA installable; airplane-mode reload renders a board; `test_page` green. TP-20..22 |
| 1.2 | **Usage analytics.** PostHog (or the tool D-003 names) loaded cookieless, EU-safe. Events: `board_new`, `board_reroll`, `mode_toggle`, `map_toggle`, `players_set`, `link_copy`, `print`, `tip_click`, `board_today`, `theme_toggle`. No PII, no cookies banner needed. | script tail + a `track()` helper | Each event fires once per click in `test_ui`; no network call before consent is unnecessary (cookieless). TP-23..25 |
| 1.3 | **Deploy on merge.** GitHub Action: on push to `main` and CI green, `vercel deploy --prod` then the alias step from `CLAUDE.md`, then a smoke check of `/og-image.png` → 200. Ends the manual two-step. | `.github/workflows/deploy.yml`, docs | A docs-only merge produces a live deploy with the alias moved; `CLAUDE.md` deploy section updated. TP-26 |
| 1.4 | **Tip link.** Footer "Buy me a coffee" (D-004, platform D-009) and one short line under the fairness note, in the Tide layout (D-021). Copy is the founder's (D-005). Element id `#tipLink` so 1.2 can count clicks. | footer HTML + one line in render | Link present in both themes, print layout hides it, `test_ui` asserts id. TP-27 |
| 1.5 | **Share the board as an image.** "Save image" button exports the SVG board (plus the player cards in fair mode) as a PNG for WhatsApp, Reddit and BGG. Include the classic sea ring (a CSS `clip-path` on `.boardwrap`, not part of the SVG) and honour the active theme. Button in the secondary row next to `#today`. Client-side only. | one function + one toolbar button | PNG downloads at 2x, matches the on-screen theme, golden untouched. TP-28..29 |

- **Status:** not started. Issues drafted 2026-10-26, not yet posted.

## Step 2 — Founder ops and research, same fortnight
Nothing here is code. Order is by what unblocks the most.

1. **Clean the repo front door.** Close #6/#7/#8 naming deleted issue #4. Ask @mortenbruket-max to
   rebase #10 or close it with thanks. Answer #12/#13/#14 once with the @bbyy21 payout as proof and
   close two as duplicates. Reply to redditor_286 that the port bug shipped (drafted 2026-09-23).
2. **Domain (D-008).** `harbormaster.fyi` registered at Porkbun 2026-10-26 (expires 2027-10-26,
   auto-renew on, lock on, WHOIS privacy on). Cutover is the Step 2 orchestrate brief in the vault;
   `vercel.app` stays live and becomes a redirect (D-011, D-012).
3. **Search.** Google Search Console: Domain property `harbormaster.fyi` verified 2026-10-27 by TXT
   record at Porkbun (do not delete that record), under the padfootsush Google account; sitemap
   submitted the same day, first read said "Couldn't fetch" (normal for a new property; recheck
   after 2026-10-28). Bing Webmaster Tools: site imported from Search Console 2026-10-27 (Google
   sign-in, no separate verification); the import carried no sitemap because Google had not read it
   yet, so it was submitted to Bing by hand the same day, status "Processing". **2.3 done.**
4. **Research (deep-research, filed in the vault as `knowledge/pages/board-game-tools-monetisation.md`).**
   Widened 2026-10-27 on the founder's call: the bottom line is traffic, so the question is what
   Harbormaster can become, not only what people pay for. Four parts: (a) which communities serious
   Catan and Eurogame players actually use, found by the research itself, with their self-promotion
   rules and what tool posts got traction there; (b) which features of free board-game tools earned
   real traffic or virality, and which fit a static no-account page; (c) what users of such tools
   actually pay or tip for, with amounts, plus the counter-examples (failed paywalls, trademark
   takedowns); (d) three to five creative product directions ranked by expected traffic, fit, build
   cost and legal risk. **Done 2026-10-27**, filed at vault `knowledge/pages/board-game-tools-monetisation.md`.
   Headline: CatanBoard already ships a 0-100 balance score, so "fair" is table stakes; the strongest
   traffic pattern is a date-seeded daily board with a share card (static fit); CATAN's IP policy
   calls even indirect income commercial exploitation, which puts the tip link (D-004, Step 1.4)
   in question until the founder decides. Feeds Step 3.
5. **Post.** One r/Catan post and one BGG thread after Step 1 ships (fair settlements + Seafarers +
   phone install). Copy is the founder's.

- **Status (2026-10-26):** **2.2 shipped.** `harbormaster.fyi` and `www` (308 to apex) added to the
  Vercel project, Porkbun DNS set to Vercel's recommended records (A `216.198.79.1` + `64.29.17.1`,
  CNAME `www` → `52b6af7c1ab1380e.vercel-dns-017.com`), deployed twice the same evening: the first
  deploy (`dpl_GqArofS6…`) left the bare root unredirected on the old hosts, D-016 added explicit
  root rules, second deploy `dpl_EjyAhhDX…` (`harbormaster-ka5ha9p3m`) is live and aliased from
  `harbormaster.vercel.app`. Proof: `scripts/verify_live.sh` 9/9 and TP-30 6/6 against live at
  about 19:40 IST (old-host `#s=abc&p=4` lands on the same board on the new host). Repo side:
  D-011..D-016, every self-URL on the new host, og-image re-rendered, TP-31/32/33 proven red first.
  Commits `46d3913`..`db86734` plus this one are local and not yet pushed. 2.1 sweep, part done
  2026-10-27: PRs #6/#7/#8 closed with the approved text (deleted #4, no server endpoint on a static
  page); #10 closed with thanks. Zero open PRs. Still open: #12/#13/#14 (proof-of-payment questions;
  answered from Koduo once @bbyy21's payout exists, not from here), the Reddit reply (founder posts
  it), the #9 bot-comment edit (declined). 2.3 done 2026-10-27 (see above). 2.4 research not started
  (separate run). 2.5 after Step 1.

## Step 3 — Build what the research says people value
- **Why:** Both previous features people asked for (board-only mode, Seafarers) came from r/Catan.
  Guessing is how hobby projects stay hobby projects.
- **Scope (D-019, 2026-10-27):** product is "the fastest way to set up a fair Catan game, on your
  phone, at the table". 3a **UI revamp**: premium, mobile-first, the link preview (og image and title)
  included; founder picks one of two or three directions from a tappable page, then one /orchestrate
  session builds it. 3b **Today's board**: one button, date-seeded, same board for everyone, no score.
  Step 1 Koduo issues stay unposted until 3a lands.
- **Status:** product decided 2026-10-27 (D-019); visual system "Tide" night/day pair picked the same day
  (D-020, design canvas https://claude.ai/artifact/5HEyuYS5CwvChu3toYVuhb). **3a built 2026-10-27** in one
  attended /orchestrate session: decisions D-021..D-029 first (`6c33e4f`, `a6eff25`, copy approved one string
  at a time), TEST_PLAN rows `09f81da`, then two Opus worktrees: Piece A `index.html` + `test_tide.mjs`
  (`9169361`, 9 min) and Piece B fonts + og card + `test_assets.mjs` (`a317c28`, `623b455`, 4 min);
  orchestrator fixes after the screenshot-vs-canvas review (`36cf3ee` tagline, classic sea ring, copper
  segments, legend contrast; `c811c79` og board fit; `8714e90` centred fairness line, no hairlines on the
  secondary row, the founder's two picks). `npm test` green: golden identical (TP-34), ui 176/176, tide 76
  (TP-35..38), assets 14 (TP-39/40), balance and page clean. **Deployed and pushed by the founder 2026-10-27 evening**, verify_live 10/10, TP-30 green,
  WhatsApp preview checked by the founder. **3b built 2026-10-28** (00:20–01:05 IST, attended /orchestrate): D-030..D-034 written and committed first
  (`9792f49`, `b7a6376`; six copy and scope calls answered one at a time, D-034; tile palette shown live-vs-proposed
  at 390px before the build), then two Opus worktrees: Piece 1 `index.html` + `test_ui` + `test_tide` + og pair
  (`048085a` Today's board, `97dd03f` tiles, 9 min, landed as returned) and Piece 2 CI + README + CONTRIBUTING +
  `test_assets` + demo script + Step 1 drafts (`6fb16e2`..`e73f94e`, 5 min, one wording fix `66c508b`); demo gif
  re-recorded from the landed page `a9a5368`. `npm test` green: golden identical (TP-43), ui 202/202, tide 80
  (TP-47), assets 27 (TP-45/46), page 11, balance clean; TP-41..47 all proven red first. `sitemap.xml` lastmod is
  2026-10-27 (UTC build date; TP-32 forbids a future date). **Deployed and pushed by the founder 2026-10-28 ~01:50 IST**: live page carries `#today` and the D-030
  tokens, og-image 200, old host 308 to the apex, first CI run with all six suites green (1m39s). The
  sitemap lastmod bump (`a8e371b`) still needs its push and redeploy.

## Step 4 — The 60-day gate (late December 2026)
Three numbers decide it: monthly visitors, share from outside India, and whether a single tip
arrived. If visitors are in the thousands and tips are nonzero, open the paid-tier question, starting
with the trademark (D-001). Otherwise Harbormaster stays a well-made free tool and a Koduo dogfood
repo, which is already worth having.
