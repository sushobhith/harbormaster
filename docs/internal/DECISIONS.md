# Harbormaster — Decisions

Format: Decision / Why / Alternatives rejected / Affects. Numbered, never edited after the fact; a
reversal is a new entry that names the old one. Founder calls are marked.

## D-001 — Harbormaster stays free; no paid feature before the Step 4 gate (2026-10-26, founder)
- **Decision:** No paid tier, no accounts for payment, no premium features before the 60-day gate in
  ROADMAP Step 4. The only money surface is a tip link (D-004).
- **Why:** Every comparable generator is free (catan.bunge.io, alexbeals.com, catanboard.com, Better
  Settlers, the official Catan Assistant; verified by Playwright 2026-07, re-checked by grounded search
  2026-10-26, confidence moderate). Catan is a trademark of Catan Studio / KOSMOS and indie tools stay
  free partly to avoid a takedown (confidence moderate, no primary source yet). Competitive players play
  one identical vetted board per round, not random fair boards. Traffic is 168 visitors a month.
- **Alternatives rejected:** a paid tier now (nothing to sell, legal exposure, zero traffic to sell
  to); a native app with a one-time price (same problems plus store fees).
- **Affects:** ROADMAP Steps 3 and 4; any future research on monetisation starts from the trademark.

## D-002 — Domain: free `eu.org` subdomain, else stay on `vercel.app` (2026-10-26, founder)
- **Decision:** Apply for `harbormaster.eu.org`. `vercel.app` stays live and canonical until the new
  name resolves and has been aliased. If eu.org has not approved within 30 days, stay on `vercel.app`.
- **Why:** The founder's budget is about ₹100 for 3 to 4 years. No real TLD meets that: the cheapest
  honest 4-year total found on 2026-10-26 was `.top` at Porkbun (about $1.63 first year then $4.63 a
  year, roughly $15.50 for four years, read off porkbun.com/tld, confidence moderate because the page
  mixes sale and list prices). Promo TLDs (`.xyz`, `.click`, `.site`, `.online`) are $1.50 to $2 the
  first year and $11 to $29 a year after. Cloudflare sells at registry cost but a `.com` is still
  around $10 a year. eu.org (nic.eu.org) registers free second-level-looking names for individuals
  and non-profits; approval is manual and known to be slow (confidence moderate). js.org is also free
  but requires GitHub Pages hosting and content "with a clear connection to JavaScript", which a Catan
  tool may not pass review on.
- **Alternatives rejected:** a paid `.com` (budget); `.top`/`.xyz` (cheap-TLD names read as spam to
  the US and EU audience the project wants); js.org (hosting move plus review risk).
- **Affects:** ROADMAP Step 2.2; `CLAUDE.md` deploy section and `sitemap.xml`/canonical tags when the
  name changes; Search Console property.

## D-003 — Analytics: PostHog, cookieless, custom events, free tier (2026-10-26)
- **Decision:** Add PostHog's JS snippet in cookieless mode and fire the eight events named in ROADMAP
  Step 1.2. Vercel Web Analytics stays for pageviews and countries. Nothing identifies a person.
- **Why:** Vercel Analytics gives no custom events on the Hobby plan, so nothing is known about what
  visitors do after the page loads. The target audience is in the EU and US; cookieless means no
  consent banner and no cookie at all. Free tier limits are to be confirmed on posthog.com/pricing by
  the task that wires it (the page is JS-rendered and could not be read 2026-10-26); if the free tier
  needs a card or is under 100k events a month, the task switches to Umami Cloud's free tier and says so.
- **Alternatives rejected:** Vercel Pro for custom events (paid); Plausible (paid cloud);
  self-hosting anything (ops for a one-file app).
- **Affects:** `index.html` script tail, `TEST_PLAN` TP-23..25, privacy line in the footer FAQ.

## D-004 — Tip link: Buy Me a Coffee, one footer link plus one post-generate line (2026-10-26, founder)
- **Decision:** A Buy Me a Coffee link in the footer and a single short line under the board after a
  board is generated. Element id `#tipLink`. No modal, no interstitial, no counter.
- **Why:** It is a signal for the Step 4 gate, not revenue. Expected conversion on free utilities is
  well under 1% of visitors (confidence low, no primary source), so at current traffic it is zero to
  one tip a month. Anything louder than a line costs trust with the audience it is meant to measure.
- **Alternatives rejected:** Ko-fi (equivalent; founder preference was Buy Me a Coffee); GitHub
  Sponsors (needs a GitHub-side setup and reads as "for developers").
- **Affects:** ROADMAP Step 1.4; footer; print layout hides it.

## D-005 — Mechanism is the build's, copy is the founder's (2026-10-26)
- **Decision:** Any string a visitor reads (tip line, footer, Reddit and BGG posts, issue replies) is
  written or approved by the founder. Subagents and Koduo tasks build the slot and ship placeholder
  text marked `TODO(copy)`; the founder fills it before deploy.
- **Why:** Same rule as every other project (`WORKFLOW.md`, model routing). Copy is taste.
- **Affects:** every Step 1 task and Step 2.5.

## D-006 — Step 1 goes through Koduo as five parallel bounty issues (2026-10-26, founder)
- **Decision:** The five Step 1 tasks are posted as five `bounty-<n>` issues on this repo and run in
  parallel. Everything else on the roadmap is done directly by the founder with `/orchestrate`.
  Bounty amounts are the founder's call and are not yet set.
- **Why:** Koduo's dogfood exit condition needs five harbormaster tasks and has sat at two for a month.
  Five is enough to pass it; routing the whole roadmap through Koduo would make a weekend project wait
  on a pipeline. The five were chosen to touch different parts of the one file (`<head>` and new files;
  script tail; a workflow file; the footer; one new function) so the PRs merge without conflicts.
  Shared ids are fixed here so parallel tasks agree: `#tipLink` (1.4, counted by 1.2);
  the `track(name, props)` helper (1.2) is the only analytics entry point.
- **Alternatives rejected:** all tasks through Koduo (slow); none through Koduo (loses the dogfood).
- **Affects:** ROADMAP Step 1; Koduo ROADMAP 10.9 dogfood count.

## D-007 — No backend, no accounts, until research says a paid-for feature needs them (2026-10-26)
- **Decision:** `index.html` stays a single static file with no server. Any feature that needs
  accounts (saved groups, game history, leagues) is proposed only after ROADMAP Step 2.4 shows users
  of comparable tools pay or donate for it, and is then a new decision.
- **Why:** The no-backend design is why the app is fast, free to host, works offline (after 1.1) and
  is easy for strangers to contribute to. Adding a backend for a feature nobody has asked for is the
  wrong order.
- **Alternatives rejected:** Supabase-backed accounts now (premature).
- **Affects:** ROADMAP Step 3.

## D-008 — Domain: buy at Porkbun, reverses D-002's eu.org route (2026-10-26, founder)
- **Decision:** Register `harbormaster.fyi` at Porkbun (flat $5.66 a year, $22.64 for four years, about
  ₹2,150 at ₹95.16 per USD on 2026-10-26). Auto-renew on. `vercel.app` stays as a redirect.
- **Why:** The founder chose a paid name at Porkbun over waiting on eu.org. Prices are from Porkbun's
  public pricing API and availability from RDAP, both read 2026-10-26 (confidence high). `.com` and
  `.org` are taken. Cheapest available is `.top` ($1.63 then $4.63, $15.52 for four years) but `.top`
  carries a spam reputation with mail and link filters (confidence moderate, no fresh primary source),
  which matters for Reddit and BGG links to a US and EU audience. `.fyi` is the cheapest name with a
  flat renewal and a neutral reputation. Game-themed names are out of range: `.games` $99 and `.gg`
  $207 for four years; `.app` and `.dev` are taken.
- **Alternatives rejected:** `.top` (reputation); `.party` $21.53 (reads as a joke); `.cc` $29.05 and
  `.link` $30.88 (more for nothing); `.in` $31.32 (wrong audience); eu.org (free but slow approval).
- **Affects:** ROADMAP Step 2.2; `CLAUDE.md` deploy section, `sitemap.xml`, canonical and OG tags,
  Search Console property, the README link.

## D-009 — Tip platform: Buy Me a Coffee (2026-10-26, founder)
- **Decision:** Buy Me a Coffee, paid out through its Stripe Express path to the Indian bank account.
  Not Ko-fi, not Razorpay, for now.
- **Why, from each platform's own pages (2026-10-26, confidence high unless marked):**
  - *Buy Me a Coffee:* 5% platform fee plus Stripe 2.9% + $0.30 (+1% outside the US) plus 0.5% payout
    fee; India is listed as supported under "Stripe Express"; $10 minimum payout. A $5 tip from Europe
    nets about $4.24. Supporters see a familiar page with card, Apple Pay and Google Pay.
  - *Ko-fi:* 0% on one-off tips, but money goes straight to the creator's own PayPal or Stripe. Stripe
    is invite-only in India (support.stripe.com), so for us Ko-fi means PayPal only. PayPal India
    charges 4.4% + $0.30 on international receipts and 3 to 4% on conversion, and "for India users,
    we only support international payments", so an Indian supporter cannot tip at all. A $5 tip nets
    about $4.35. Ten cents better than Buy Me a Coffee, with a worse checkout.
  - *Razorpay:* Payment Pages/Buttons are 0.2% plus gateway fees (2% + GST domestic, up to 3% + GST
    international). International card acceptance is not on by default and needs activation
    (confidence moderate). The checkout is INR-denominated and unfamiliar to a US or EU visitor, with
    no PayPal, Apple Pay or Google Pay. Right tool for Indian UPI tippers, wrong one for the target
    audience.
  - The fee gap between the three is cents on a $5 tip. Friction and trust decide, and the audience
    the project wants is outside India.
- **Alternatives rejected:** Ko-fi (PayPal-only in India, excludes Indian tippers); Razorpay (wrong
  audience); GitHub Sponsors (reads as developer-only).
- **Revisit:** if analytics (Step 1.2) shows a large Indian share, add a Razorpay UPI button beside it.
- **Affects:** D-004's link target; ROADMAP Step 1.4.

## D-010 — Bounty per Step 1 task: $12 (2026-10-26, founder)
- **Decision:** $12 per issue, five issues, $60 total exposure.
- **Why:** Koduo pays domestic contributors once the balance clears ₹1,000 (Koduo 10.11c). At ₹95.16 per
  USD (open.er-api.com, 2026-10-26) a $10 bounty is ₹952 and a single merged task would sit below the
  floor; $12 is ₹1,142 and clears it with room for the rate to move. International contributors accrue
  toward Koduo's $100 minimum regardless of the amount. Each task is a two-to-four-hour change on a
  one-file app; ₹1,100 is in range for a micro-bounty in India and small but normal for the
  bounty-aggregator crowd that already finds this repo. If the AI lane does the work instead, the
  bounty is never paid and the cost is about $1 of model time per task.
- **Alternatives rejected:** $10 (under the domestic floor); $25 (the old slider default, more than
  the work).
- **Affects:** ROADMAP Step 1 issue labels (`bounty-12`).

## D-011 — Old hosts redirect with a host-matched 308 in `vercel.json`; the hash survives by standard (2026-10-26)
- **Decision:** A root `vercel.json` with one `redirects` rule per old public host, `harbormaster.vercel.app`
  and `fairhex.vercel.app`: `source: "/:path*"`, `has: [{type: "host", value: <old host>}]`,
  `destination: "https://harbormaster.fyi/:path*"`, `permanent: true` (308). Deployment-specific URLs
  (`harbormaster-<hash>-sushobhiths-projects.vercel.app`) are deliberately not matched, so previews and
  the golden/page suites can still be run against a deployment before it is aliased.
  `www.harbormaster.fyi` is added to the Vercel project as a 308 redirect to the apex, not handled in
  `vercel.json`. The shared-link seed lives in the URL fragment, which the browser never sends; on a
  3xx whose `Location` has no fragment the browser re-attaches the original one (Fetch standard,
  HTTP-redirect fetch, step "if locationURL's fragment is null, set it to request's current URL's
  fragment"). Query strings are passed through by Vercel's redirect handling. TP-30 is the proof: a
  live Playwright run opens `https://harbormaster.vercel.app/#s=abc&p=4` and must land on
  `https://harbormaster.fyi/#s=abc&p=4` with a board drawn; it is written now, is red until the
  founder's deploy, and is not part of `npm test` because host matching only fires on the live hosts.
- **Why:** `harbormaster.vercel.app` is a manual alias, not a project domain, so Vercel's per-domain
  redirect setting cannot be used for it; a host-matched rule in the deployed `vercel.json` is the one
  mechanism that covers both old hosts and ships with the app. 308 keeps method and is the code
  Vercel emits for `permanent: true`. A client-side `location.replace` in the page would also work
  but would serve the whole app first and would break for crawlers.
- **Alternatives rejected:** Vercel domain-level redirect (does not reach the manual alias); JS
  redirect in `index.html` (slower, SEO-hostile); dropping the old alias (every link ever shared dies).
- **Affects:** new `vercel.json`; `CLAUDE.md` deploy section; TP-30; `scripts/verify_live.sh` (D-013).

## D-012 — What changes host, and the new deploy procedure (2026-10-26)
- **Decision:** Every absolute self-reference moves to `https://harbormaster.fyi/`: `<link rel=canonical>`,
  `og:url`, `og:image`, `twitter:image`, the `url` of every JSON-LD block that has one, `sitemap.xml`
  `<loc>` plus `<lastmod>` bumped to the deploy date, `robots.txt` `Sitemap:` line, `package.json`
  `homepage`, the README play link and badge, the URL text on `docs/og-card.html` with `og-image.png`
  re-rendered from it (1200×630, same board asset). The Vercel Analytics tag and the GitHub repo URL do
  not change. `CLAUDE.md` Live/Deploy becomes: `harbormaster.fyi` is a production domain of the Vercel
  project, so `vercel deploy --prod --yes` assigns it automatically; the manual alias step stays but its
  job flips: `vercel alias set <deploy> harbormaster.vercel.app` now makes the old host serve the
  redirect from the new deploy. Verification is `scripts/verify_live.sh` (D-013). TP-31 (`test_page`
  asserts canonical, OG, Twitter and JSON-LD all start with the new origin and no `vercel.app` string is
  left in `<head>`) and TP-32 (`sitemap.xml` and `robots.txt` name the new host; `<lastmod>` is a valid
  date not before 2026-10-26 and not after today) become failing assertions, which `test_page` has not
  had until now. Golden, balance and UI suites must stay byte-for-byte green: nothing in the script
  changes.
- **Why:** A canonical that disagrees with the served host splits ranking between two URLs; the OG
  image URL on the old host would resolve through a redirect and some scrapers refuse redirected
  images. The `lastmod` window check guards the easy-to-forget bump without going red next month.
- **Alternatives rejected:** keeping `vercel.app` canonical during a transition (nothing to transition,
  there is no inbound SEO equity worth preserving at 168 visitors a month); leaving the OG card text
  (the card is the first thing a Reddit or BGG reader sees, and it would name a host that redirects).
- **Affects:** `index.html` head, `sitemap.xml`, `robots.txt`, `package.json`, `README.md`, `CLAUDE.md`,
  `docs/og-card.html`, `og-image.png`, `test/test_page.mjs`; TP-31, TP-32.

## D-013 — Live verification is a script with negative proof (2026-10-26)
- **Decision:** `scripts/verify_live.sh [new-host] [old-host ...]`, defaults `harbormaster.fyi` and
  `harbormaster.vercel.app fairhex.vercel.app`. On the new host it requires `/` → 200 whose body
  carries the canonical for that exact host, `/og-image.png` → 200 with `image/png`, `/sitemap.xml` and
  `/robots.txt` → 200 naming the host. On each old host it requires `/` and `/og-image.png?x=1` → 308
  with `Location` on the new host, path and query intact. `www.<new-host>` must 3xx to the apex. One
  PASS/FAIL line per check, exit 1 on any FAIL, curl only. TP-33 is two negative runs that must exit
  non-zero: a host that does not resolve, and `example.com` (which serves 200 but carries no canonical),
  so the script is shown to check content and not only status.
- **Why:** The one-line `curl -sI .../og-image.png` in `CLAUDE.md` catches only the alias-not-moved
  failure. The cutover adds a second way to be wrong (redirect not served, hash or query dropped) and
  Step 1.3's deploy workflow needs a single smoke command to call.
- **Alternatives rejected:** a Playwright test for the live checks (the browser is needed only for the
  hash, which TP-30 covers; everything else is headers).
- **Affects:** `scripts/verify_live.sh`; `CLAUDE.md` deploy section; ROADMAP 1.3 smoke step; TP-33.

## D-014 — The front-door sweep is done by hand with `gh`, after copy approval (2026-10-26)
- **Decision:** Four PR comments (#6, #7, #8 close with one text; #10 per the founder's choice), three
  issue actions (#14 answered with the @bbyy21 payout as proof; #12 and #13 closed as duplicates of #14
  with a one-line pointer), the edit of the Koduo bot's "released" comment on #9 (founder edits as repo
  owner; if GitHub refuses, a correcting reply instead), and one Reddit reply the founder posts
  themself. Every text is the founder's under D-005; the orchestrator posts the GitHub ones with
  `gh pr close -c` / `gh issue close -c` / `gh issue comment` only after each is approved verbatim.
- **Why:** Eight writes with hand-approved text are under the delegation threshold; a subagent would
  add a brief and a review for no gain, and the texts cannot be written by it anyway.
- **Alternatives rejected:** a sweep script (nothing to reuse; the next sweep will have different text).
- **Affects:** ROADMAP Step 2.1 Status.

## D-015 — Analytics baseline for the Step 4 gate: the 30 days ending on the cutover date (2026-10-26)
- **Decision:** The baseline is Vercel Web Analytics for the 30 days ending 2026-10-26, read from the
  dashboard (project `harbormaster` → Analytics) and written into ROADMAP Current State as visitors,
  views, mobile share and top countries. The API query endpoints return "Web Analytics not found" for
  this project (re-confirmed 2026-10-26 on both the count and aggregate endpoints), so the founder
  reads it. If it is not read on the day, the 2026-10-16 figures already in ROADMAP stand as the
  baseline and the Status line says so. The custom domain joins the same Vercel project, so the series
  is unbroken across the cutover; the Step 4 comparison is the 30 days ending about 2026-12-25 against
  this window.
- **Why:** The gate needs a before. Nothing is built here; event-level analytics is Step 1.2 (D-003).
- **Alternatives rejected:** waiting for 1.2 to define the baseline (loses two months of the only
  series that exists).
- **Affects:** ROADMAP Current State; Step 4.
- **Amended 2026-10-26 (later):** the "Web Analytics not found" answer is the MCP token's, not the
  project's. The same endpoints answer through the CLI (`vercel api /v1/query/web-analytics/visits/...`
  with `projectId` and `teamId` as query parameters). Baseline read that way and written into ROADMAP
  Current State; the 2026-10-16 figures are superseded. Step 4 reads the same way.

## D-016 — Explicit root rules in `vercel.json`; `/:path*` alone misses `/` on Vercel (2026-10-26)
- **Decision:** Two extra `redirects` entries with `source: "/"` (one per old host) ahead of the
  `/:path*` rules from D-011. Everything else in D-011 stands.
- **Why:** Measured on the first `.fyi` deploy (dpl_GqArofS6eVQoeq5WoUcbsLNPiyAM): on the old hosts
  `/foo`, `/index.html`, `/robots.txt`, `/og-image.png?x=1` and a never-requested `/vercel.json` all
  returned 308 to the new host, while `/` and `/?q=1` returned 200 with the new deploy's own
  `index.html`. The body being the new file rules out a stale alias; other static paths redirecting
  rules out an edge-cache key collision. So Vercel serves the root document before a `/:path*`
  host rule is consulted, and the one URL every shared link starts with was the one not redirected.
  TP-30's first live run caught it (the hash case failed, the query case passed).
- **Alternatives rejected:** `source: "/(.*)"` with `$1` (would probably work, but untested here and
  less explicit than naming the root); a client-side fallback redirect in `index.html` (D-011's
  reasons still apply).
- **Affects:** `vercel.json`; TP-30 stays the proof; `scripts/verify_live.sh` already checks `/`.

## D-017 — Tip link ships without asking CATAN; risk accepted (2026-10-27, founder)
- **Decision:** Step 1.4 ships as D-004 describes. No email to ip@catan.com. If CATAN objects, the
  link comes down then.
- **Why:** CATAN's IP guidelines (catan.com, read 2026-10-27) call indirect income such as ads
  "commercial exploitation" and do not name tips. Harbormaster uses no CATAN artwork, and asking
  invites a slow answer or a no for a link expected to earn under one tip a month (D-004). Removing a
  link is a one-line change.
- **Alternatives rejected:** email ip@catan.com first (delay for a marginal signal); hold until the app
  covers several games (ties a small signal to a large build).
- **Affects:** ROADMAP Step 1.4 (unchanged); evidence in vault `knowledge/pages/board-game-tools-monetisation.md`.

## D-018 — Step 3 is the daily board (2026-10-27, founder)
- **Decision:** Step 3 builds a daily board: one board per calendar day, the same for every visitor,
  seeded from the date, on which the player places an opening and gets a shareable result card.
  The phasing and scoring method are decided in the Step 3 brief, not here.
- **Why:** The Step 2.4 research found a fair-board generator is table stakes (CatanBoard already ships
  a 0-100 balance score), and that the strongest traffic pattern in adjacent games is a single shared
  daily challenge with a share card (Chess.com reports 1M+ daily solvers, self-reported). A date seed
  needs no backend, so it fits D-007.
- **Alternatives rejected for now:** SEO calculator pages (CatanBoard owns them); multi-game setup (no
  demand evidence); tournament packs (no evidence leagues want them); Cities & Knights setup.
- **Affects:** ROADMAP Step 3 scope.

## D-019 — What Harbormaster is: the fastest way to set up a fair Catan game, on your phone, at the table (2026-10-27, founder)
- **Decision:** The product is a mobile-first setup tool for in-person play. Growth comes from groups
  sharing board links and from search. The daily shared board (D-018) is a feature inside it, a
  "Today's board" button with the same date-seeded board for everyone, **with no scoring**. The name
  leads; "Catan" is used only as a description (CATAN IP guidelines, vault research page).
- **Why:** 84% of visitors are on mobile and the tool is used at the table. A daily board without a
  score has no result to compare, so it cannot carry the product on its own. A game-night companion
  (timer, dice stats, score tracker) had no traffic evidence in the Step 2.4 research.
- **Alternatives rejected:** B "tonight's board everywhere" as the product (thin hook without a score);
  C full game-night companion (no evidence).
- **Affects:** D-018 (amended: feature, no scoring); ROADMAP Step 3 becomes the UI revamp then
  Today's board; Step 1 Koduo issues held until the revamp lands (all five touch `index.html`).

## D-020 — Visual system "Tide": night and day pair, quiet board, few boxes (2026-10-27, founder)
- **Decision:** The revamp (Step 3a) uses the "Tide" system picked from the design canvas
  (claude.ai artifact 5HEyuYS5CwvChu3toYVuhb, artboards "T4 Night" and "T4 Day"):
  - **Two modes.** Follows the phone's setting by default; a small toggle overrides it and is
    remembered in the browser. Print and the link preview image use Day.
  - **Night:** ground `#0d1311`, ink `#ece6d8`, muted `#a7a294`, line `#27312d`, accent copper
    `#c58a5c` with `#0d1311` text on it. **Day:** ground `#f2eee5`, ink `#16201c`, muted `#56605b`,
    line `#ddd5c6`, accent `#9a5a30` with `#fbf8f1` text on it.
  - **Board, muted tiles.** Night: wood `#4b6b55`, sheep `#7f9970`, wheat `#bfa06a`, brick
    `#97604c`, ore `#6c7376`, desert `#9b8f78`, sea `#1f4540`. Day: wood `#5e8566`, sheep
    `#9cb58a`, wheat `#d2b47a`, brick `#b07560`, ore `#8b9294`, desert `#c9bca2`, sea `#a9c4bd`.
    The sea ring stays visible (it carries the ports). Number tokens show pip dots like the
    physical tokens; 6 and 8 in red; ports drawn as ringed markers on the water.
  - **Type:** Instrument Serif for the wordmark only, Manrope for everything else, tabular
    figures for numbers. **Self-hosted** woff2 files, no request to Google (both fonts are SIL OFL;
    German courts have fined sites for embedding Google Fonts, and the PWA in Step 1.1 needs them
    offline).
  - **Few boxes:** controls sit on the ground without borders or panels; one copper primary
    button; hairline rules separate sections. No gradients, no emoji, no left-border cards.
  - **Layout (phone):** wordmark and share at top; map switch and player count on one row; board
    first and nearly full width; a one-line fairness note; "New board" full width; secondary
    actions in one row; turn order as a short list. Everything currently on the page stays
    reachable; rarely used toggles and the long rules text move below the fold or into a sheet.
- **Why:** The founder rejected the first three directions as "almost but not quite"; a
  one-change-at-a-time row showed the fix was fewer boxes, editorial type and a quieter board
  together. A dark-only look excludes daylight and table use; the current site already follows the
  phone's setting. Visible water keeps the board reading as Catan and keeps ports legible.
- **Alternatives rejected:** A1 Admiralty, A4 Chart (founder preferred A2/A3); dark only.
- **Affects:** ROADMAP Step 3a; `index.html` styles and toolbar markup; `docs/og-card.html` and
  `og-image.png`; `theme-color` meta. Generation code is untouched, so `test_golden` must stay green.

## D-021 — Step 3a phone layout: where every existing control goes (2026-10-27)
- **Decision:** One column at phone width, top to bottom: (1) header: wordmark `Harbormaster`
  (Instrument Serif) with the one-line tagline under it (copy, D-029), and on the right a round
  44px theme toggle (new id `theme`); the GitHub link leaves the header and lives only in the footer
  sentence that already links the repo. (2) one row: `#map` segment (Classic / Seafarers, flex 1)
  and `#players` segment (3 4 5 6), both as today's `.seg` groups with `aria-pressed` buttons.
  (3) the board, nearly full width (`#board` inside `.boardwrap`, no border, no panel: the sea ring
  is the board's own edge). (4) the fairness line: `#fairCard` becomes one line of muted text between
  two hairlines (copy, D-029); it keeps the strings the UI suite reads ("All 5 resources each",
  "roads fill the gaps", "snake draft … ±N"). (5) `#newBoard`, full width, copper, 54px.
  (6) secondary row, three equal cells: `#reroll`, `#copy`, `#print`; `#copy` is the share control
  (its text feedback "Copied ✓" / the link on clipboard failure stays, so it must remain a text
  button). (7) turn order: `#playerCards` keeps one card per player with today's content (head row,
  two settlement rows with hex chips and road targets, the coverage line) but sorted into turn order
  and drawn as hairline-separated rows, not boxes. (8) an options row labelled by copy call 5 (new
  id `options`): `#mode` segment (Fair settlements / Board only), `#noPorts`, `#allRes` as toggle
  chips, and `.seedbox` with `#seedLabel`. (9) the legend as one muted line. (10) `#methodCard`
  (cheat sheet + built-in rules + Seafarers notes) and the footer FAQ as collapsed `<details>`
  blocks, in the DOM for search engines. (11) footer: physical-setup sentence, re-draw sentence,
  GitHub link. Nothing in the options row or below is inside a hidden container: every control is
  one tap away and the existing Playwright clicks reach it without opening anything.
- **Why:** D-020 fixes the order of the first six blocks; the rest follows "everything stays
  reachable, rarely used things go below the fold". A sheet would hide `#mode`, `#noPorts` and
  `#allRes` behind a tap and break the UI suite's direct clicks. `#players` stays a four-button
  segment instead of the canvas's stepper because one tap reaches any count and the suite reads the
  pressed button's text.
- **Alternatives rejected:** a "More" bottom sheet (hides controls, breaks tests); a stepper for
  players (two taps from 4 to 6, test rewrite); an icon-only share button in the header as `#copy`
  (its feedback is text).
- **Affects:** `index.html` markup and CSS; `renderPanel` (sort order only); TP-36, TP-37.

## D-022 — Step 3a desktop layout: board left, everything else right (2026-10-27)
- **Decision:** At `min-width: 900px` the page is a centred two-column grid, max 1120px wide: the
  header spans both columns; the board takes the left column (`minmax(0, 1fr)`); the right column
  (380px) stacks the map/players row, fairness line, `#newBoard`, the secondary row, the options row,
  the turn-order rows; the legend, cheat sheet, FAQ and footer sit under the board in the left
  column. Same tokens, type and spacing as the phone; nothing is shown or hidden by width.
- **Why:** 16% of visitors are on desktop; a 1120px single column leaves the board small and the
  controls far from it. Board left matches reading order and today's layout.
- **Alternatives rejected:** a phone-width column centred on desktop (wastes the screen);
  controls left (reading order puts the result first).
- **Affects:** `index.html` CSS only.

## D-023 — Theme mechanics: system by default, one toggle, remembered, print is Day (2026-10-27)
- **Decision:** Day tokens live on bare `:root`; Night tokens are repeated under
  `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])` and under
  `:root[data-theme="dark"]`, so the override wins in both directions. The `#theme` button reads the
  effective mode (`data-theme` if set, else `matchMedia`) and sets the opposite as
  `document.documentElement.dataset.theme`, storing it under `localStorage["hm-theme"]` inside
  `try/catch`; a 12-line inline script at the end of `<head>` applies a stored value before first
  paint. `<meta name="theme-color">` is updated by the same function to the active ground
  (`#0d1311` / `#f2eee5`) and on `matchMedia` change events. `@media print` forces the Day tokens
  on `:root`, `:root[data-theme="dark"]` and `:root[data-theme="light"]` and hides the toolbar rows,
  toggle, cheat sheet, FAQ and footer. No theme code touches `rnd`, `state.seed` or generation.
- **Why:** The site already follows the phone's setting; a remembered override is what D-020 asks
  for. Reading the stored value before paint avoids a flash. Two-state toggle (not a three-way
  cycle through "system") because the third state is invisible on a phone.
- **Alternatives rejected:** a `<select>` with system/night/day (clutter); a cookie (no server).
- **Affects:** `index.html` head, CSS, orchestration tail; TP-35.

## D-024 — Element ids and test-read strings stay; new ids are new (2026-10-27)
- **Decision:** These ids keep their element type, role and behaviour: `newBoard`, `reroll`,
  `noPorts`, `allRes`, `copy`, `print`, `map`, `players`, `mode`, `seedLabel`, `board`, `fairCard`,
  `playerCards`, `methodCard`. `#map`, `#players`, `#mode` stay `.seg` groups of buttons carrying
  `data-map` / `data-n` / `data-mode` and `aria-pressed`, with the button texts `Classic`,
  `Seafarers`, `3`..`6`, `Fair settlements`, `Board only`. The board SVG keeps: number text with
  `font-size="15"`, house path `M -8 8 …`, `ROBBER`, `PIRATE` and `✦` texts, `polygon` per hex with
  `fill="var(--…)"`. The classes `.legend .sea-only`, `.player .pips`, `.seg` keep their meaning.
  New elements get new ids: `theme` (toggle), `options` (options row), `fold` (class for the
  collapsed sections). `body[data-map]` and the `.sea-only` / `.classic-only` swaps stay.
- **Why:** Both UI suites and the page audit read exactly these; they are the regression net for
  "no feature removed".
- **Alternatives rejected:** renaming to BEM-style ids with a test rewrite (no benefit).
- **Affects:** `index.html`; TP-36.

## D-025 — Fonts: two self-hosted latin woff2 files under `/fonts/`, OFL texts beside them (2026-10-27)
- **Decision:** `fonts/instrument-serif-latin.woff2` (Instrument Serif Regular 400, latin subset)
  and `fonts/manrope-latin.woff2` (Manrope variable, wght 200–800, latin subset), both the woff2
  files Google Fonts serves for the latin `unicode-range`, downloaded once and committed. Their
  licence texts ship as `fonts/OFL-InstrumentSerif.txt` and `fonts/OFL-Manrope.txt` (SIL OFL 1.1
  requires the notice to travel with the files). `@font-face` in `index.html`: `font-display: swap`,
  `font-weight: 200 800` for Manrope, `src: url(/fonts/…) format("woff2")`, with the latin
  `unicode-range` from Google's CSS. Stacks: wordmark `"Instrument Serif", Georgia, serif`; body
  `Manrope, system-ui, -apple-system, "Segoe UI", sans-serif`; `font-variant-numeric: tabular-nums`
  on every number. `.vercelignore` is an exclusion list and does not name `fonts`, so no change is
  needed for them to deploy; `scripts/verify_live.sh` gains a check that `/fonts/manrope-latin.woff2`
  returns 200 so a future ignore rule cannot silently drop them.
- **Why:** D-020 (no request to Google; offline PWA later). Variable Manrope is one file instead
  of four. Latin subset keeps the two files under about 60 KB total.
- **Alternatives rejected:** Google Fonts `<link>` (D-020); static Manrope 400/500/600/700 (four
  requests); full character sets (size, no non-latin text on the page).
- **Affects:** new `fonts/` directory; `index.html` `@font-face`; `scripts/verify_live.sh`; TP-39.

## D-026 — Board rendering in Tide: colours and token drawing change, positions do not (2026-10-27)
- **Decision:** All colours in `render()` come from CSS custom properties so the board follows the
  theme: hex `fill` stays `var(--wood)` etc. with the D-020 tile values; hex `stroke` becomes
  `var(--edge)` (the ground colour, so tiles read as islands) at width 2.5; number tokens: fill
  `var(--tok)`, stroke `var(--ring)` width 1, number in Manrope 700 tabular (`font-size="15"` attribute
  kept), pip dots under the number as today, 6 and 8 and their dots in `var(--hot)` (`#a8352b`);
  ports: a ringed marker on the water at today's position: circle r 11 filled `var(--tok)`, ring
  width 2.5 coloured by the port's resource for 2:1 and `var(--port)` (accent) for 3:1, the `2:1` /
  `3:1` label kept inside in `var(--tink)`, and the two dock lines to the port's vertices kept but
  thinner (width 2, `var(--port)` at 55% opacity) because they are the only thing that says which
  two corners the port serves; settlements keep the house path and player number, stroke `var(--edge)`;
  roads keep their two-stroke drawing with the dark under-stroke replaced by `var(--edge)`.
  `PLAYERCOLORS` become theme tokens `--p1`..`--p6` (Night: `#d4553f`, `#4a83d1`, `#ece6d8`,
  `#e39545`, `#5a9e63`, `#9a6a45`; Day: `#c8432f`, `#2f62b0`, `#ffffff`, `#e08a2c`, `#3f8a4a`,
  `#8a5a3b`) used through `var(--pN)` in both the SVG and the cards; the name strings stay. The
  robber, pirate and gold sparkles keep their glyphs, recoloured to `var(--tink)` / `var(--muted)`.
  Token values per mode (from the canvas `renderVals()`, T4 flags): Night `--tok #ece6d8`,
  `--tink #1a1f1c`, `--ring #a7a294`, `--edge #0d1311`, `--port #c58a5c`, `--card #111815`;
  Day `--tok #fffdf8`, `--tink #16201c`, `--ring #9a8f7c`, `--edge #f2eee5`, `--port #9a5a30`,
  `--card #f6f2ea`. Gold stays `--gold` (`#c9a24a` night, `#d8b253` day). Nothing in `buildGeom`,
  `placePorts`, `placeResources`, `placeNumbers`, `drawSettlements`, `planRoads` or `__hm.run`
  changes; `test_golden` must stay byte-identical.
- **Why:** D-020 names the look; the rendering code already takes its colours from variables, so
  the change is confined to `render()` attributes and the token blocks. Port type and the two served
  vertices are information the table needs, so the canvas's bare dot is not enough.
- **Alternatives rejected:** canvas-style unlabelled port dots (loses the 2:1 type); square
  settlement markers (loses the player number that links board to card).
- **Affects:** `index.html` `render()`, `PLAYERCOLORS`, tokens; TP-34.

## D-027 — Link preview card in Tide Day; drawn favicon (2026-10-27)
- **Decision:** `docs/og-card.html` is restyled to the Day tokens: ground `#f2eee5`, wordmark in
  Instrument Serif, tagline in Manrope (the existing card sentence, kept), the five resource dots,
  the URL line, and a Day render of the board on the right. The board asset is re-rendered from the
  new `index.html` by a new `scripts/render-og.mjs` (Playwright: open `index.html#s=gamenite&p=6` in
  Day, screenshot `#board` to `docs/assets/board-day.png`, then screenshot the card at 1200×630 to
  `og-image.png`). The card loads the fonts from `../fonts/` so the render needs no network. The
  "FREE & OPEN SOURCE" pill keeps its words without the anchor emoji. The favicon becomes a drawn
  SVG data URI (copper ring on the night ground) instead of the emoji anchor.
- **Why:** D-020 says the preview uses Day and no emoji. Re-rendering from the real page keeps the
  card honest; the script makes the re-render repeatable after Piece A lands.
- **Alternatives rejected:** keeping the dark card (contradicts D-020); a hand-drawn board in the
  card (drifts from the product).
- **Affects:** `docs/og-card.html`, `docs/assets/board-day.png`, `og-image.png`, `scripts/render-og.mjs`,
  `index.html` favicon; TP-40.

## D-028 — Step 3a test strategy and landing order (2026-10-27)
- **Decision:** TP-34 is `test_golden` unchanged. TP-35 (theme), TP-36 (ids and strings of D-024),
  TP-37 (390px: `#board` width ≥ 340, bottom edge ≤ 844 at 4 and 6 players classic, no horizontal
  scroll) and TP-38 (contrast ≥ 4.5:1, computed from `getComputedStyle` with the first opaque ancestor
  as ground, for body text, muted text, tagline, buttons, fairness line, player rows, seed, token
  numbers in both modes) live in a new `test/test_tide.mjs` (Piece A). TP-39 (no request to
  `fonts.googleapis.com` or `fonts.gstatic.com` during load; at least two `@font-face` rules naming
  Manrope and Instrument Serif whose files exist under `fonts/` and load with `document.fonts`) and
  TP-40 (`og-image.png` is 1200×630 by `pngjs`; outside CI its mtime is not older than
  `docs/og-card.html`) live in a new `test/test_assets.mjs` (Piece B). `package.json` gains
  `test:tide` and `test:assets`, both appended to `npm test`. Every new assertion is shown red
  before green (a temporary edit in the worktree, reverted, or the pre-change file). Landing order:
  Piece A first (it owns `index.html`), then Piece B rebased onto it, then `scripts/render-og.mjs`
  run once on the landed page so TP-40 sees the final card; `npm test` after each landing.
- **Why:** Piece B's font-loading assertion can only go green on top of Piece A's `@font-face`, so
  B lands second and its red run on the old `index.html` is its proof.
- **Alternatives rejected:** one shared test file (merge conflict between parallel worktrees);
  mtime check in CI (git checkout does not preserve mtimes).
- **Affects:** `test/test_tide.mjs`, `test/test_assets.mjs`, `package.json`, `TEST_PLAN.md`.

## D-029 — Step 3a copy: the five customer-visible strings (2026-10-27, founder)
- **Decision:** (1) Tagline under the wordmark: `Fair setup for Catan` (replaces "Balanced Catan
  boards with fair starting settlements, for 3–6 players."). (2) Re-draw button: `Re-draw spots`;
  the footer sentence becomes `Re-draw spots keeps the board and only re-deals the starting
  settlements and roads.` (3) Fairness line, balanced state: `Balanced start · every seat within
  ±N pips` with N the real spread (e.g. `±1`); uneven state (spread over 2): `Uneven — re-draw ·
  ±N pips apart`; Board only keeps today's "Balanced board" sentence including the snake-draft
  `±N pips`; All 5 resources keeps today's `All 5 resources each` / `Best possible — roads fill
  the gaps`. The starter line (`Red starts first, then weakest to strongest`) stays as today's
  second, smaller line. (4) Theme toggle: icon only, `aria-label` and `title` read `Switch to day
  mode` when Night is active and `Switch to night mode` when Day is active. (5) Options row label:
  `Options`. `<title>` and meta description unchanged. No other visible wording changes.
- **Why:** D-005: copy is the founder's. Asked and answered one at a time 2026-10-27.
- **Alternatives rejected:** per call: "Fair Catan setup, 3–6 players"; "Re-draw starts"; "best and
  worst seat N pips apart"; "Day mode"/"Night mode"; "Setup", "More".
- **Affects:** `index.html` header, secondary row, `renderPanel`, footer, theme toggle, options row.

## D-030 — Tile colours read as Catan: blue water, one distinct hue per tile (2026-10-28, founder)
- **Decision:** The board's eight tile tokens take conventional Catan colours, water is blue, and no
  two tiles share a colour family. Day: wood `#2f6b45`, sheep `#a9c957`, wheat `#e6c24a`, brick
  `#c75f3a`, ore `#8a8e95`, desert `#e3d2a6`, sea `#7fb2d4`, gold `#e0962a`. Night: wood `#2a5a3b`,
  sheep `#7e9f3f`, wheat `#c9a637`, brick `#a4482a`, ore `#666c74`, desert `#ab9d75`, sea `#1d4b6e`,
  gold `#c7861f`. Print uses the Day values. The values live in exactly four places in `index.html`
  (the three `:root` token blocks and the `@media print` block) plus the two hard-coded swatches in
  `docs/og-card.html` (wood, brick, and the other three dots follow the Day values); `render()`, the
  legend dots, the 2:1 port rings and the classic sea ring already read `var(--…)`, so nothing else
  changes. `--hot`, `--tok`, `--tink`, `--ring`, `--edge`, `--port`, `--card` and `--p1..p6` stay as
  D-026 set them. The link preview is re-rendered from the new page. This supersedes the "Board,
  muted tiles" lines of D-020 and the tile values in D-026, and nothing else in either. Guard, TP-47
  in `test_tide`, both schemes: water hue within 195°–235°, pairwise CIE76 ΔE ≥ 20 for every tile
  pair except wheat/gold ≥ 15 (the ✦ sparkle on gold carries the rest). The founder saw the palette
  on a 390px live-vs-proposed preview (classic and Seafarers, both schemes) before the build.
- **Why:** On the live Tide board wood, sheep and the water are three greens (Day hues 132°/95°/164°,
  Night 139°/98°/172°) and wheat and gold sit 19 ΔE apart: 13 tile pairs under ΔE 30 in each
  scheme. The board is the single thing the page delivers, and it has to read at a glance at the
  table. The proposed sets have 3 (Day) and 2 (Night) pairs under 30 and only Night wheat/gold under
  20, at 17.7.
- **Alternatives rejected:** keeping the muted set and adding hatch patterns per tile (busier, and
  the legend would need the patterns too); photographic tile textures (weight, and off-brand for
  Tide); nudging only the water (sheep and wood stay two greens).
- **Affects:** `index.html` token blocks and print block; `docs/og-card.html`; `docs/assets/board-day.png`
  and `og-image.png` (re-rendered); TP-47; D-020 and D-026 as stated; `CLAUDE.md` "Visual system".

## D-031 — Today's board: a date seed in the existing hash, one button, nothing new in generation (2026-10-28)
- **Decision:** `todaySeed()` returns `today-YYYY-MM-DD` from `new Date().toISOString().slice(0,10)`,
  so the date is **UTC** and the whole world gets one board a day. It is an ordinary seed: it rides
  `#s=`, the `seed|players` and `|sea` namespaces, Copy link, Back/Forward and the golden test with no
  new path in generation, and a shared link keeps working tomorrow because the seed carries its date.
  New button `#today` (`<button class="btn" id="today">`, label is copy call 1) in `.row-sec` between
  `#reroll` and `#copy`. The row becomes a two-by-two grid (`grid-template-columns:repeat(2,1fr)`):
  at 390px "Re-draw spots" is 104.5px of text and four cells would be 79.5px wide. `generate()`
  sets `document.body.dataset.mode` next to `dataset.map`, and `body[data-mode="board"] .row-sec`
  goes back to three columns because `#reroll` is hidden in Board only. Click:
  `state.seed=todaySeed(); state.board=null; generate(true,"push")`. `aria-pressed` on `#today` is
  **derived**, set in `generate()` from `state.seed===todaySeed()`: true after the click, after
  opening a `today-` link for the current date, after Back/Forward to one; false after New board or
  on yesterday's link, with no toggle code anywhere. The button is present in both modes (the board
  is the same; placement is theirs in Board only). `#seedLabel` keeps the raw seed; the word beside it
  (copy call 2, may be nothing) is a `<span class="seedtag">` inside `.seedbox` with no id, filled by
  `generate()` only while the seed is today's. `#copy` is unchanged. No scoring, streaks, server or
  analytics event (D-019; `board_today` goes into the Step 1.2 issue). `sitemap.xml` `<lastmod>`
  is bumped in the same change to the UTC date of the build (2026-10-27: TP-32 forbids a date after
  today UTC, and the build finished at 19:16 UTC).
- **Why:** Every other design adds a second source of truth. A `&today=1` flag or a dedicated code
  path would need its own history, copy-link and golden handling and would break the day after. A
  local date gives neighbouring time zones different "today"s. Deriving `aria-pressed` in `generate()`
  means it cannot desync from the hash.
- **Alternatives rejected:** local-date seed; a `&today=1` hash flag; toggling `aria-pressed` in the
  click and New board handlers (popstate desync); a fourth equal cell in one row (does not fit at
  390px); hiding the button in Board only (the shared board is the point in both modes).
- **Affects:** `index.html` markup, `.row-sec` CSS, `generate()`, one handler; TP-41..44; `CLAUDE.md`
  Architecture §1; `sitemap.xml`.

## D-032 — Step 3b tests and landing order (2026-10-28)
- **Decision:** TP-41..44 extend `test/test_ui.mjs` as a new section at its end; the date is frozen
  for the whole section with `page.clock.setFixedTime(new Date("2026-10-27T12:00:00Z"))` on every page
  it opens, so the expected seed is the literal `today-2026-10-27`. TP-45 and TP-46 go in
  `test/test_assets.mjs`; TP-47 in `test/test_tide.mjs`. TP-46 is three checks: every image that
  `README.md` or `docs/og-card.html` references under `docs/assets/` exists; every png or gif under
  `docs/assets/` is referenced by one of those two files or by a script under `scripts/` (no orphans);
  and, outside CI (same skip and reason as TP-40), each referenced png or gif has an mtime no older
  than `index.html`'s, so a visible change to the page forces the previews to be re-rendered. Each
  new assertion is shown red before green, with the red named in TEST_PLAN. `test_golden` is not
  touched and must stay byte-identical. Landing order: Piece 1 (`index.html` and its tests) lands
  first; Piece 2 is rebased onto it and landed second; then the orchestrator re-records
  `docs/assets/demo.gif` and re-renders the og pair from the landed page, because Piece 2's worktree
  has neither the button nor the new tiles and a preview recorded there would show the old page.
- **Why:** The UI suite is the UI suite (TP-36 already asserts `test_ui` passes unedited; adding to it
  keeps one net). A frozen clock makes the seed assertion literal instead of a race with midnight. A
  git-date check for stale assets is meaningless in a depth-1 checkout, while the mtime rule is the
  pattern TP-40 already uses and it says exactly what CLAUDE.md asks for.
- **Alternatives rejected:** a separate `test_today.mjs`; comparing asset dates against a fixed
  anchor commit (passes forever once the anchor is old); recording the gif in Piece 2's worktree.
- **Affects:** `test/test_ui.mjs`, `test/test_assets.mjs`, `test/test_tide.mjs`, TEST_PLAN TP-41..47.

## D-033 — Front door before Step 1: CI runs all six suites, README and CONTRIBUTING describe the product as it is, old-look assets go (2026-10-28)
- **Decision:** `.github/workflows/ci.yml` gains steps for `test:tide` and `test:assets` (`fonts/` is in
  the repo; TP-40's mtime half already skips itself under `CI`). TP-45 reads `package.json` and asserts
  every `test:*` script except `test:quick` appears as a `run: npm run test:<name>` line in `ci.yml`.
  `README.md`: the five badge colours move to Tide (`9a5a30`, `5e8566`, `9cb58a`, `8b9294`, `d2b47a`);
  the "Themed" row and a new "Today's board" row take the founder's wording (copy calls); both test
  blocks become `npm test` with the six suites named in one line each; `docs/assets/demo.gif` is
  re-recorded with `scripts/make-demo-gif.mjs` at the Tide desktop layout (1300×940, D-022), keeping
  the mixed player-count and map list and adding one `today-` seed, after Piece 1 has landed (D-032).
  `hero-dark.png`, `hero-light.png`, `board-dark.png`, `board-light.png` are deleted: nothing references
  them, git history keeps them, and a social post that wants a hero gets one rendered from the current
  page. `CONTRIBUTING.md`: the test section becomes `npm test`, names the six suites and what each
  proves, and says `fonts/` must be present for `test_tide` and `test_assets`; three new lines: element
  ids and segment texts are frozen (D-024, both UI suites read them); visible wording is the
  founder's (D-005, ship `TODO(copy)` placeholders); no external requests, fonts are self-hosted
  (D-025). The five Step 1 issue drafts in ROADMAP are updated in place so they are posted once
  against final markup: 1.1 caches `/fonts/*` and carries both theme colours; 1.2 adds `board_today`
  and `theme_toggle`; 1.4 places the tip line in the Tide layout (footer, one line under the fairness
  note); 1.5 includes the classic sea ring (a CSS `clip-path` on `.boardwrap`, not part of the SVG)
  and honours the active theme. Text only; nothing posted. The Claude-artifact copy of the app in
  `CLAUDE.md` is the founder's call (asked in this session; default: delete the line).
- **Why:** Koduo tasks merge on CI green, and two of the six suites have never run on a PR. The
  README is the first thing the invited contributors see, and it shows a palette and a theme line
  that no longer exist. The issue drafts name markup that 3a and 3b changed.
- **Alternatives rejected:** keeping the old pngs for a future post (dead weight that misleads);
  recording the demo at phone width (a 390px gif in an 880px README slot); a separate CI job for the
  two new suites (one job, one green).
- **Affects:** `.github/workflows/ci.yml`, `README.md`, `CONTRIBUTING.md`, `docs/assets/`,
  `scripts/make-demo-gif.mjs`, `docs/internal/ROADMAP.md` Step 1 table, `CLAUDE.md`; TP-45, TP-46.

## D-034 — Step 3b copy: the customer-visible strings, and the artifact copy (2026-10-28, founder)
- **Decision:** (1) `#today` label: `Today's board`. (2) Nothing beside the seed label while on
  today's board: the seed text already carries the date and the pressed button shows it, so the
  `.seedtag` span of D-031 is not built. (3) Cheat sheet, last bullet of the first list:
  `**Today's board** = the same board for everyone, every day, for your player count. Share the link.`
  (4) Footer FAQ, fifth entry after "Can I share a board?", and the same pair in the FAQPage JSON-LD:
  Q `What is Today's board?` A `One shared board a day. Everyone who taps Today's board on the same
  day, with the same player count and map, gets the same board and the same fair starting
  settlements. Copy the link to play the same board as your friends.` (5) README feature table: the
  "Themed" row becomes `**Night and day** — follows your phone; one tap to switch, remembered.` and a
  new row after "Shareable": `**Today's board** — one shared board a day for your player count; send
  the link.` (6) The Claude-artifact copy of the app: the line in `CLAUDE.md` is deleted; the site is
  the canonical copy and nothing is republished. `<title>` and meta description unchanged. No other
  visible wording changes.
- **Why:** D-005: copy is the founder's. Asked and answered one at a time 2026-10-28.
- **Alternatives rejected:** per call: "Today", "Daily board"; "today" / "shared" beside the seed; the
  shorter cheat-sheet and FAQ answers; keeping "Themed" as the row name; republishing the artifact.
- **Affects:** `index.html` secondary row, cheat sheet, FAQ and JSON-LD; `README.md`; `CLAUDE.md`.
