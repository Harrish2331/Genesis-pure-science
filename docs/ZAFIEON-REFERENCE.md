# Zafieon reference inventory and Genesis gap map

Inspected **24 October 2026** at https://zafieon-pharma.vercel.app — live
pages fetched and parsed in the browser, interactive features exercised at
1440 px and 375 px. Zafieon's own source (E:\zafieon\zafieon-web) was used
only to confirm category definitions. Nothing here is Genesis content.

## 1. Sitemap and navigation

**Sitemap (`/sitemap.xml`, 33 URLs)** — 8 top-level pages, 8 product pages,
8 manufacturing-partner pages, 4 Insights articles, 5 Our Focus anchors.
Linked but deliberately left out of the sitemap: 7 prescription product pages
and 3 legal pages (`robots.txt` disallows `/legal/`, `/admin`, `/api/`).

| Page | Status | Main structure (headings as found) |
|---|---|---|
| `/` | 200 | 3D capsule hero (one `<canvas>`) · About + certification strip · Focus explorer (01–05 tabs → panel) · all 15 products · Quality pillars + lifecycle · Manufacturing partners with animated counters · Insights · closing statement |
| `/about` | 200 | Purpose · Beginning in women's health · Five commitments · "Not simply a business" |
| `/our-focus` | 200 | One section per area (image, headline, detail, "In this area" product list) |
| `/products` | 200 | Catalogue — client-rendered (see §2) |
| `/products/[slug]` | 200 | Hero (name, composition, badges, pack image) · Product information list · disclaimer · Related products · Enquire |
| `/quality` | 200 | Four pillars · lifecycle (6 stages) · partner network · partner certifications |
| `/manufacturing` | 200 | Partner standards (8) · partner grid · cluster by Indian state · international reach · "Manufacture with Zafieon" |
| `/manufacturing/[slug]` | 200 | Country/Region/Website · About · Capabilities · Quality & regulatory · Documented sites · Export markets · Other partners |
| `/insights`, `/insights/[slug]` | 200 | Lead article + "More from Zafieon"; article + "Continue reading" |
| `/contact` | 200 | Email / offices (Get directions) / Follow us · five department cards (mailto) · no form |
| `/legal/privacy`, `/legal/terms`, `/legal/disclaimer` | 200 | Short legal pages |
| unknown URL | 404 | Branded "This page doesn't exist." |

**Header** — flat navigation, no dropdown menus: About, Our Focus, Products,
Quality, Manufacturing, Zafieon Insights, Contact + "Get in Touch" button.
Mobile: "Open menu" button. No site search, no WhatsApp shortcut.

**Footer** — statement, intro, columns Company / Portfolio (All, Nutraceuticals,
Prescription, Hormones) / Standards (Quality, Certifications, Manufacturing,
Partners) / Contact (email, two offices with "Get directions"), legal links,
and a prescription-information notice.

## 2. Product catalogue

- **Category (product class) chips:** All · Nutraceuticals · Prescription · Hormones.
- **Therapeutic-area chips with counts:** Gynaecology 15 · Hormonal Health 05 ·
  Fertility 04 · Women's Wellness 06 · Reproductive & Women's Health 02.
- **Search:** "Name or composition", with an "N of N" result count.
- Filters are client state only — the URL does not change, so a filtered view
  cannot be shared or bookmarked.
- **Card fields:** pack image · veg mark · badges (Rx, Coming soon) · category
  label · name · composition · dosage form · "View →". Hairline-bordered grid.
- **Mobile:** chip rows wrap; single-column cards.

**Product page fields:** Category · Dosage form · Composition · Packaging ·
Therapeutic area · Licence (FSSAI, nutraceuticals); "information is taken from
the product pack … not a substitute for professional advice" note; pack caption
"Pack shown for identification. Artwork may vary."

**Prescription pages:** full-screen, session-only acknowledgement ("I am a
healthcare professional or trade visitor" / "Take me back"); copy states the
information is for reference, not an advertisement or medical advice; the pack
image is blurred.

## 3. Design and interaction observations

Large uppercase display type with a two-colour line break; eyebrow labels with
a short rule; dark navy hero bands with a repeating logo pattern; generous
section spacing; scroll-reveal entrances; animated count-up statistics;
interactive numbered focus list; hairline grids for products and partners.

## 4. Gap map — what Genesis does with each finding

| Zafieon feature | Genesis | Decision |
|---|---|---|
| Therapeutic-area categories | Gynaecology, Reproductive Health, Fertility, Hormonal Health, Women's Wellness + Pregnancy & Maternal Care; General Medicine with three areas | Implemented (previous update) |
| Catalogue filters, search, count | Area sidebar + chips, dosage-form filter, search, count — all in the URL (shareable) | Implemented; Genesis improves on URL state |
| Product-class filter (Nutraceutical / Prescription / Hormone) | No evidence on Genesis packs for nutraceutical vs prescription status | Not implemented — would require guessing |
| Product information list | Composition, dosage form, pack size, + **Category and Therapeutic area rows**, **reference disclaimer**, **pack caption** | Added in this update |
| Prescription acknowledgement | Inline HCP notice; copy strengthened to match (reference only, not an advertisement) | Updated in this update |
| Interactive focus explorer | **Therapeutic-area explorer** on the homepage, driven by Genesis's own areas and products | Added in this update |
| Animated statistics | **Counters computed from live data** (products, areas, partners) — no invented figures | Added in this update |
| Disclaimer page + footer notice | **/disclaimer** and footer prescription notice | Added in this update |
| Quality page, certifications, partner certifications | No Genesis certifications or approvals supplied | Not implemented — would be unverified claims; quality commitment remains on About |
| Partner detail pages, capabilities, state cluster, export markets | No verified Genesis partner information | Not implemented; partner cards gain details once supplied in Admin |
| Partner standards list ("What we hold our partners to") | Would be new company commitments | Not implemented — needs Genesis-approved wording |
| Contact department cards, office directions | Department cards, Customer Service, office + Maps link field | Already implemented |
| Search, WhatsApp, Notice, Axon Surgicals, admin CMS | Not on Zafieon | Genesis-only features kept |

## 5. Limitations

- The mobile menu opened on tap, but its panel did not render in the captured
  frame, so its visual design was not recorded.
- Mid-scroll screenshots were affected by reveal animations; section structure
  was taken from the DOM instead.
- Zafieon's catalogue filtering could not be verified by counting DOM nodes
  (cards appear to be hidden rather than removed); filter UI and counts were
  recorded from the rendered page.
