# Manufacturing partners — audit inventory

Audited 25 October 2026; updated 26 October 2026, when Genesis named six further partners. Internal document: it is not published on the website.

## Sources inspected

- **Zafieon Pharma reference project (read-only):**
  - `zafieon-web/src/data/partners.ts`: all 10 partner records, including the 2 Zafieon marks `retired`.
  - `zafieon-web/docs/CLAIMS.md`: per-partner sources and qualifiers.
  - `zafieon-web/public/partners/`: 10 logo files.
  - `zafieon-web/source-assets/partners/` and `source-assets/images/Qualified manufacturing patners.png`. That image is a generic world map with no partner names.
- **Genesis's own brief:** Genesis named Symbiosis, Bionexy and SB Lifense as its manufacturing partners. On 26 October 2026 it also named Ravenbhel, Philanto, Eurocrit, Janus Biotech, Heliyac Healthcare and Amagen Pharma.
- **Live websites:** checked from this machine on 25 October 2026.

## The rule applied

A company appears on Genesis's website only when Genesis itself named it as a partner. Appearing on Zafieon's website is not evidence of a relationship with Genesis.

Profile details taken from Zafieon's copy of a partner's brochure are shown on the site:
- credited to that partner;
- with a source note;
- with an "identity to confirm" marker in review mode.

This follows Genesis's instruction of 25 October 2026.

## Inventory

| # | Partner (exact name in source) | Source | Logo | Website (checked 25 Oct 2026) | Relationship with Genesis | On Genesis site |
|---|---|---|---|---|---|---|
| 1 | Symbiosis Group of Pharma Companies | Zafieon `partners.ts`, from the partner's brochure `symbiosis.pdf` | `symbiosis-group.webp`, copied | `www.symbiosispharmaceuticals.com`: **resolves**, redirects to symbiosispharma.in, page titled "SYMBIOSIS PHARMA" | **Named by Genesis** ("Symbiosis"). Still to confirm: that it is the same company as this brochure profile | **Published** with profile, credited |
| 2 | Bionexy Pharma | Zafieon `partners.ts`, from `bionexy pharma and unilite india injection.pdf` | `bionexy-pharma.webp`, copied | `www.bionexy.in`: **does not resolve** (DNS: non-existent domain) | **Named by Genesis** ("Bionexy"). Still to confirm: that it is the same company, and its current website | **Published** with profile, credited. **Website link withheld** |
| 3 | SB Lifense | Genesis brief only; not in Zafieon material | none supplied | none supplied | **Named by Genesis** | **Published** as a name only. Still to confirm: spelling, logo, website, profile |
| 4 | Systole Remedies Private Limited | Zafieon `partners.ts` (marked `retired` by Zafieon) | in Zafieon | `www.systoleremedies.com`, not checked | Not established | **Excluded**. No Genesis relationship; also retired by Zafieon |
| 5 | Eurocrit Labs International Pvt. Ltd. | Zafieon `partners.ts`, from the partner's brochure `eurocrit labs.pdf` | `eurocrit-labs.webp`, copied | `www.eurocrit.com`: **resolves**, site titled for Baddi, Himachal Pradesh | **Named by Genesis**, 26 Oct 2026 | **Published** with profile, credited |
| 6 | Philanto Wellness | Zafieon `partners.ts`, from the partner's company profile `philant wellness.pdf` | `philanto-wellness.webp`, copied | `www.philantowellness.com`: **resolves** | **Named by Genesis**, 26 Oct 2026 | **Published** with profile, credited. Conflicting history figures withheld; noted on the profile |
| 7 | Unilite India | Zafieon `partners.ts` (marked `retired` by Zafieon) | in Zafieon | none | Not established | **Excluded**. No Genesis relationship; also retired by Zafieon |
| 8 | Janus Biotech India Pvt. Ltd. | Zafieon `partners.ts`, profile from the partner's website | `janus-biotech-india.webp`, copied | `www.janusbiotech.co.in`: **resolves** in a browser (blocks scripted requests) | **Named by Genesis**, 26 Oct 2026 | **Published** with profile, credited. Conflicting range figures withheld |
| 9 | Ravenbhel Healthcare Pvt. Ltd. | Zafieon `partners.ts`, from the partner's product catalogue | `ravenbhel-healthcare.webp`, copied | `www.ravenbhel.com`: **resolves** | **Named by Genesis**, 26 Oct 2026 | **Published** with profile, credited. Qualifiers on USFDA/MHRA statement and planned facility shown |
| 10 | Heliyac Healthcare Pvt. Ltd. | Zafieon `partners.ts` (interim profile) | `heliyac-healthcare.webp`, copied | none | **Named by Genesis**, 26 Oct 2026 | **Published**: name, location and recorded certifications only |
| 11 | Amagen Pharma Private Limited | Zafieon `partners.ts` (interim profile) | `amagen-pharma.webp`, copied; a photo of signage | none | **Named by Genesis**, 26 Oct 2026 | **Published**: name, location and recorded certifications only |

**Totals:**
- 11 companies identified (10 in Zafieon material, plus 1 named only by Genesis).
- 9 published as Genesis partners.
- 2 excluded: Systole Remedies and Unilite India, which Zafieon has retired and Genesis has not named.

### How the six were adapted

- Zafieon-specific wording was dropped. That includes sentences about relevance "to Zafieon Pharma's portfolio" (Janus, Ravenbhel), and the generic "expectations Zafieon applies to every partner" text that made up most of the Heliyac and Amagen profiles.
- Qualifiers that matter to a visitor are shown on each profile under "Notes on this profile". Examples: conflicting figures in the source, statements of design standard rather than approvals, and capacity that is planned rather than installed.
- Left out deliberately:
  - personal names of directors and staff;
  - the client companies listed in the partners' brochures, which are the partners' customers, not partners of Genesis.

### Not partners

Zafieon's records also list the client companies that a partner says it manufactures for. Examples: Symbiosis lists 24, including Cadila, Intas and Zydus; Eurocrit lists 18, including Aurobindo and Micro Labs. These are the partners' own customers, not manufacturing partners of Zafieon or Genesis, and are not used anywhere on the Genesis site.

## To publish a pending partner

Genesis should confirm, in writing:

1. That the company manufactures for Genesis and may be named publicly.
2. Permission to show the company's logo. Logos are third-party trademarks; Zafieon's own notes record that permission for its use was still outstanding.
3. That the profile details (capabilities, certifications, sites) are current.
4. A working website address.

Then add the partner in **Admin → Partners**. Its logo goes in `public/partners/`, copied, never moved, from the reference material.

## Also to confirm for the published partners

- **Symbiosis:** that Genesis's "Symbiosis" is Symbiosis Group of Pharma Companies. Its export list includes "Kurdistan", which is not a sovereign state; it is reproduced exactly as printed in the brochure.
- **Bionexy:** that it is Bionexy Pharma, and its current website. The certification marks are brochure badges; no certificates were supplied.
- **SB Lifense:** the registered spelling, logo, website and profile.
