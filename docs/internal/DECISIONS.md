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
