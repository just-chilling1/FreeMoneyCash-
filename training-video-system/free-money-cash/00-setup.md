# Free Money Cash — Phase 1 Setup

**Software slug:** `free-money-cash`  
**Repo:** `d:\Apps\FreeMoneyCash-` (branch `main`, pulled ff-only, clean)  
**Stack:** Next.js 16 · React 19 · Supabase Auth  
**Output root:** `training-video-system/free-money-cash/`  
**Character portrait:** `character-portrait.png` (Phase 2)  
**Logo asset:** `logo-full.png` — official lockup (olive circle + hand/$ + FREE MONEY / CASH). Use on every thumbnail bottom-left.  
**Thumbnails:** `thumbnails/fmc-thumb-{NN}-{slug}.png` (23 total: dashboard 01–03, then mindset→how-to interleaved 04–23)

---

## 1.1 Product Fact Sheet

| Field | Value |
|---|---|
| Product name + one-line promise | **Free Money Cash** — "Generate Affiliate Pages in Minutes" / Zero-friction platform to create compliant affiliate marketing pages with AI |
| Price paid | Not in repo. Speak as "what you paid today" — do not invent a dollar figure. Upgrade unlock values on-screen: Unlimited **$47**, Instant Income **$97**, Automated Income **$197**. |
| Dream customer | Beginner affiliate marketers who want pages without writing/tech skills |
| Point A | Stuck consuming free MMO content; no pages live; no commissions |
| Point B | Live profit pages with affiliate links, traffic flowing, commissions tracked |
| The vehicle | Affiliate marketing via AI-built review/profit pages + free traffic |
| The mechanism | Pick niche → paste affiliate link → AI builds a shareable profit page → share the page link → clicks convert to commissions |
| Unfair advantage | Removes writing + page-building grind; DigiStore24 quick-start in-app; Share Tools + Training for traffic |
| Core loop | Niche → affiliate link → Generate Page → Your Pages link → Share & Promote → views/clicks/est. earnings |
| First win / activation | Build Page → Choose Niche → paste link → Generate Page with AI → land on Your Pages with a live page |
| Proof inventory | Motivational ticker lines (e.g. "Jennifer L. reached $1,000…") — **do not invent testimonials**. Founder/system story OK. |
| Guarantee | **30-Day Guarantee** — full refund within 30 days of purchase, no questions asked. Email support with account email + purchase date. Processed 5–7 business days. (Support page; FAQ notes upgrade purchases.) |
| Effort truth | Build a page in minutes; first week is quiet while traffic starts; still must share/post by hand; software removes writing, not showing up |

---

## 1.2 Branding map (old / alternate → current — scripts use CURRENT only)

| Old / internal / alternate | Current user-facing |
|---|---|
| ProfitLoop | Free Money Cash |
| v0-mmo-app-builder | Free Money Cash |
| Share Tools (page H1 — OK to say when on that page) | Nav: **Share & Promote** |
| Bonus Training (mobile More menu / FAQ) | Sidebar: **New System to Earn $1,000-$5,000 Per Day** (same `/bonus-training`) |
| page builder / affiliate page builder | **Build Page** / **Build Your Profit Page** |
| Charge HQ / BatteryProfits / etc. | **Free Money Cash** (never leak other products) |
| Existing Vimeo titles on dashboard ("Create Your First Profit Page", etc.) | **New Track A titles for scripts:** Watch This First / How The Money Flows / Your 5-Minute Tour — UI roster titles in `training-videos.ts` will be updated when videos ship |

---

## 1.3 UI inventory (exact labels)

### Sidebar — Navigation
Dashboard · Build Page · Your Pages · Share & Promote · Instant Cash Injection · New System to Earn $1,000-$5,000 Per Day · Training · Settings · Support · Sign Out

### Sidebar — Premium Features
Done-For-You Profit · Unlimited · Instant Income · Automated Income · Guaranteed High-Ticket Payouts · Reseller & License Rights · Cyber Protection

### Dashboard (Home)
- Eyebrow **Home** · Welcome to Free Money Cash  
- Body: Watch the three videos below in order — then jump into Build Page…  
- Stats: Pages Created · Total Views · Total Clicks · Est. Earnings  
- **Start Here** section — 3 videos with **BonusPromoCard** between 1→2 and 2→3  
- Quick actions: Build New Page / Learn & Earn / Instant Cash Injection  
- Right rail: tips / premium / live stats · floating **Need help?** support widget  

### Build Page (`/create`)
- **Build Your Profit Page** · Two steps: pick a niche, paste your affiliate link…  
- Steps: **Choose Niche** · **Generate Page**  
- Step 1: **Choose Your Niche** + niche cards  
- Step 2: **Your Affiliate Link** · **Generate Page with AI** / **Generating Your Page...**  
- Wait: **Building your page** · Preparing… Writing the article… Embedding… Finalizing…  
- Success: **Page Created Successfully!**

### Your Pages
- **Your Pages** · **Build New Page** · empty: **No Pages Yet** / **Build Your First Page**  
- Detail: **Your links** · **View Page** · **Share** · **Rename** · Pause/Activate · Delete  

### Share & Promote
- Page H1 **Share Tools** · tabs: Social Media · Embed Codes · QR Codes · Post Captions  
- Tips: Best Times to Post (Facebook 1–3 PM weekdays · Twitter 12–1 & 5–6 · LinkedIn 7–8 AM & 5–6 PM) · hashtag counts · etc.

### Instant Cash Injection
- **Instant Cash Injection** · Toluna Surveys · **Open Toluna** · How It Works (3 steps)

### Training Center
- **Training Center** · Academy eyebrow · Mark as complete  

### Free-training / Bonus surfaces (verbatim)

| Surface | Copy | Destination | Where |
|---|---|---|---|
| **EarningsBanner** | H2: Want To Multiply Your Earnings To **$1,000 – $5,000** A Day? · CTA **Click Here To Learn How** | `/bonus-training` | Top of almost every protected page |
| **BonusPromoCard** | Badge **Bonus Training** · CTA **Yes! Show Me How To Earn $1,000–$5,000 A Day** | `/bonus-training` | Between Start Here videos on Dashboard |
| **VideoOverlay** (while playing training videos) | Member Bonus Unlocked · Free training that shows how to scale to **$1,000–$5,000/day** · CTA **Watch Free Training** | `https://freedomescapexcelerator.com/2k-per-day` | Under player when a Home/Academy training video is open |
| **Sidebar nav** | New System to Earn $1,000-$5,000 Per Day | `/bonus-training` | Left sidebar |
| **Bonus Training page** | Watch The Bonus Training That Took Me To Earning **$1,000–$5,000 Per Day** · **Click Here To Continue >>** | external 2k-per-day URL | `/bonus-training` |

**Spoken pitch (current language):** scale to one thousand — even five thousand dollars a day; free for Free Money Cash members; limited / won't be up forever.

**Video 01 CTA placement (real):** After video 1 card, scroll to the **Bonus Training** card → button **Yes! Show Me How To Earn $1,000–$5,000 A Day**. (Also valid: top EarningsBanner **Click Here To Learn How**, or sidebar New System link.) Do **not** invent a banner glued under the video player itself — the BonusPromoCard sits as its own card between videos.

**Generation waits:** Build Page / DFY Profit / Instant Income / Unlimited publish / High-Ticket personalize show progress UI but **do not** mount VideoOverlay. During those waits the **EarningsBanner** remains at the top of the layout — academy free-training mentions point at that top gold banner (or sidebar New System link), not a fictional under-progress bar.

### Loading states (CTA-eligible)

| Feature | Wait copy | Free-training mention? |
|---|---|---|
| Build Page | Building your page / Generating Your Page... | YES — top EarningsBanner |
| Done-For-You Profit | Building your kit | YES — top banner |
| Instant Income | Writing your posts… | YES — top banner |
| Unlimited | Creating... | YES — brief |
| High-Ticket | Personalizing article with your page link... | YES — brief |
| Share / Instant Cash / Automated Income / License Rights / Cyber Protection | none / static | **NO ad** |

---

## 1.4 Jargon Ledger (top terms for Disconnect)

| Term | Plain def (≤15 words) | Analogy | Why you care |
|---|---|---|---|
| Affiliate link | Your unique tracking URL that pays you when someone buys | Your personal barcode on the product | Without it, sales don't credit you |
| Niche | The market aisle your page speaks to | One supermarket aisle you own | Match niche to offer or the page feels random |
| Profit page | The AI-built review page visitors read before the offer | Your shop window on the internet | This is what you share — not the raw vendor link |
| Commission | Money the vendor pays you for a tracked sale | The referral fee for sending a customer | That's your payday |
| DigiStore24 | Free affiliate marketplace to find products + links | A giant product mall with promote buttons | Fastest way to get a real link if you don't have one |
| Views / Clicks | How many people opened your page / hit the offer | Foot traffic vs people who walked to the register | Dashboard proof the machine is moving |
| Share Tools | Built-in ways to post your page (social, QR, captions) | A megaphone rack next to your shop | Pages without traffic earn zero |
| Premium Features | Paid upgrades that multiply pages, posts, or traffic | Extra tools in the workshop | Optional accelerators after the core loop works |
| Bonus Training | Free member training on scaling to $1k–$5k/day | The advanced playbook behind the gold banners | Highest-leverage click after you own the software |

---

## 1.5 Money Map

1. Vendors sell digital/physical offers and run affiliate programs (e.g. DigiStore24).  
2. You grab **your affiliate link** for an offer in a niche you chose.  
3. Free Money Cash AI builds a **profit page** with that link embedded.  
4. You **share** the profit-page URL (Share Tools, groups, captions, QR, premium traffic sources).  
5. Strangers **view** the page → **click** through → some **buy** → you earn a **commission**.  
6. Dashboard tracks Pages / Views / Clicks / Est. Earnings.

**Weakest link software fixes:** writing + building the converting page (and packaging promo kits in upgrades).  
**Still human:** picking offer, sharing/posting, consistency.  
**Most-doubted link:** "will anyone click / buy?" → answered by traffic training + Share Tools + Bonus Training scale path.

---

## 1.6 First Win

Tonight: open **Build Page** → pick one niche → paste one real affiliate link → hit **Generate Page with AI** → when it finishes, open **Your Pages** and copy your profit-page link. Visible result under 5–10 minutes once generation completes.

---

## 1.7 Free-training mention map

| Video | Moment | Placement language |
|---|---|---|
| 01 Buyer's Remorse | Beat 10 micro-action | Bonus Training card below video 1 → **Yes! Show Me How To Earn $1,000–$5,000 A Day** |
| 02 Disconnect | During software / generate beat | Glance at top gold EarningsBanner → **Click Here To Learn How** |
| 03 Quick Overview | Close — sidebar New System once | New System to Earn $1,000-$5,000 Per Day |
| All **mindset** videos (04,06,08,10,12,14,16,18,20,22) | **NONE** | Belief / effort only — no ads |
| 05 Build Page how-to | During **Building your page** wait | Top EarningsBanner |
| 07 Your Pages + Share | **NO** | |
| 09 Instant Cash Injection | **NO** | |
| 11 DFY Profit | During **Building your kit** | Top banner |
| 13 Unlimited | During **Creating...** | Top banner |
| 15 Instant Income | During **Writing your posts…** | Top banner |
| 17 Automated Income | **NO** | |
| 19 High-Ticket Payouts | During personalize wait | Top banner |
| 21 Reseller & License Rights | **NO** | |
| 23 Cyber Protection | **NO** (final academy how-to) | |

---

## 1.8 Video roster

**Consumption order:** Dashboard 01→02→03, then Academy in file order. Each tool starts with a **mindset** video (belief, blocks, effort) then the how-to.

| # | File | Track | Public title | Feature(s) | Target | Ad? |
|---|---|---|---|---|---|---|
| 1 | `01-buyers-remorse.md` | Dashboard | Watch This First | — | ≥1600w | Yes (Bonus card) |
| 2 | `02-disconnect.md` | Dashboard | How The Money Flows | — | ≥1600w | Yes (banner) |
| 3 | `03-quick-overview.md` | Dashboard | Your 5-Minute Tour | whole app shallow | 450–750w | Yes (sidebar) |
| 4 | `04-build-page-mindset.md` | Academy | Build Page Mindset | `/create` belief | ≥900w | **No** |
| 5 | `05-build-page.md` | Academy | Build Page | `/create` how-to | ≥900w | Yes |
| 6 | `06-pages-and-share-mindset.md` | Academy | Your Pages + Share Mindset | belief | ≥900w | **No** |
| 7 | `07-pages-and-share.md` | Academy | Your Pages + Share & Promote | how-to | ≥900w | **No** |
| 8 | `08-instant-cash-mindset.md` | Academy | Instant Cash Mindset | belief | ≥900w | **No** |
| 9 | `09-instant-cash.md` | Academy | Instant Cash Injection | how-to | ≥900w | **No** |
| 10 | `10-dfy-profit-mindset.md` | Academy | DFY Profit Mindset (1st premium) | belief | ≥900w | **No** |
| 11 | `11-dfy-profit.md` | Academy | Done-For-You Profit | how-to | ≥900w | Yes |
| 12 | `12-unlimited-mindset.md` | Academy | Unlimited Mindset (2nd) | belief | ≥900w | **No** |
| 13 | `13-unlimited.md` | Academy | Unlimited | how-to | ≥900w | Yes |
| 14 | `14-instant-income-mindset.md` | Academy | Instant Income Mindset (3rd) | belief | ≥900w | **No** |
| 15 | `15-instant-income.md` | Academy | Instant Income | how-to | ≥900w | Yes |
| 16 | `16-automated-income-mindset.md` | Academy | Automated Income Mindset (4th) | belief | ≥900w | **No** |
| 17 | `17-automated-income.md` | Academy | Automated Income | how-to | ≥900w | **No** |
| 18 | `18-high-ticket-mindset.md` | Academy | High-Ticket Mindset (5th) | belief | ≥900w | **No** |
| 19 | `19-high-ticket-payouts.md` | Academy | Guaranteed High-Ticket Payouts | how-to | ≥900w | Yes |
| 20 | `20-license-rights-mindset.md` | Academy | License Rights Mindset (6th) | belief | ≥900w | **No** |
| 21 | `21-license-rights.md` | Academy | Reseller & License Rights | how-to | ≥900w | **No** |
| 22 | `22-cyber-protection-mindset.md` | Academy | Cyber Protection Mindset (7th) | belief | ≥900w | **No** |
| 23 | `23-cyber-protection.md` | Academy | Cyber Protection (**final**) | how-to | ≥900w | **No** · final sign-off |

---

## Auth notes for live audit

No built-in `DEV_BYPASS_AUTH`. Live audit uses temporary middleware + page auth patches marked `// TEMP SCREENSHOT BYPASS — remove after capture`, then fully reverted.
