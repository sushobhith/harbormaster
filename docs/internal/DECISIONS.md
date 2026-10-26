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
