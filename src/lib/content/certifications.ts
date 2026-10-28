/**
 * The certification registry: which supplied mark represents a certification
 * or registration a manufacturing partner claims. Pure, so tests import it.
 *
 * The rule
 * --------
 * A mark is only ever shown because a partner's OWN documentation claims that
 * certification (Partner.certifications) or registration
 * (Partner.registrations). resolve() and markForRegistration() read those
 * strings and nothing else, so there is no way to show a mark for Genesis, a
 * product, or a partner that does not claim it. Genesis Pure Lifesciences holds
 * no certification in any supplied material; every surface that shows marks
 * across the network says that they are the partners'.
 *
 * Artwork
 * -------
 * public/certifications holds the supplied seals (WHO, GMP, GLP, ISO 9001,
 * circular artwork on white, 320 x 320) and, under revenbhel/, the regulator
 * emblems cut from Ravenbhel's own certifications sheet. Claims with no
 * supplied artwork (PIC/S) are never given an invented emblem: they are listed
 * as text. The WHO crop on the Ravenbhel sheet is not used — WHO already comes
 * from the seal — and the full sheet ("Revenbhel certifications.png") was only
 * the source the emblems were cut from.
 */

export type CertificationMark = {
  id: string;
  /** Short label shown under the mark. */
  label: string;
  /** What the certification is. */
  description: string;
  /** Supplied artwork in /public, or undefined when none exists. */
  logo?: string;
  alt?: string;
  /** Shown with the mark where its meaning is commonly misread. */
  note?: string;
  match: RegExp[];
};

export const CERTIFICATION_MARKS: CertificationMark[] = [
  {
    id: "who",
    label: "WHO",
    description: "World Health Organization GMP standards",
    logo: "/certifications/who.webp",
    alt: "World Health Organization emblem",
    note: "WHO-GMP certificates are issued by national or state drug regulators applying WHO Good Manufacturing Practice guidelines; the WHO does not itself certify manufacturers.",
    match: [/\bWHO\b/i, /world health organization/i],
  },
  {
    id: "gmp",
    label: "GMP",
    description: "Good Manufacturing Practice",
    logo: "/certifications/gmp.webp",
    alt: "Good Manufacturing Practice certified seal",
    match: [/\bGMP\b/i, /good manufacturing practice/i],
  },
  {
    id: "glp",
    label: "GLP",
    description: "Good Laboratory Practice",
    logo: "/certifications/glp.webp",
    alt: "Good Laboratory Practice certified seal",
    match: [/\bGLP\b/i, /good laboratory practice/i],
  },
  {
    id: "iso",
    label: "ISO 9001",
    description: "ISO 9001 quality management system",
    logo: "/certifications/iso.webp",
    alt: "ISO 9001:2015 certified seal",
    match: [/\bISO\s*9001\b/i],
  },
  {
    id: "pics",
    label: "PIC/S",
    description: "Pharmaceutical Inspection Co-operation Scheme",
    // No artwork supplied, and PIC/S has no public seal: shown as text only.
    match: [/\bPIC\s*\/?\s*S\b/i],
  },
];

/** The distinct marks a partner's own certification claims resolve to, in registry order. */
export function resolve(claims: readonly string[]): CertificationMark[] {
  return CERTIFICATION_MARKS.filter((m) => claims.some((c) => m.match.some((re) => re.test(c))));
}

/** The mark a single claim string represents, if any. */
export function markFor(claim: string): CertificationMark | undefined {
  return CERTIFICATION_MARKS.find((m) => m.match.some((re) => re.test(claim)));
}

/** Marks (with artwork) that at least one of these partners claims, with how many claim each. */
export function marksAcross(partners: readonly { certifications: string[] }[]): { mark: CertificationMark; count: number }[] {
  return CERTIFICATION_MARKS.filter((m) => m.logo)
    .map((mark) => ({ mark, count: partners.filter((p) => resolve(p.certifications).some((x) => x.id === mark.id)).length }))
    .filter((x) => x.count > 0);
}

/* ── Regulator emblems, for market registrations a partner states ───────── */

export type RegulatorMark = { id: string; logo: string; width: number; height: number; alt: string; match: RegExp[] };

/**
 * Registrations are not certifications — a market registration says products
 * may be sold in a country, not that a quality system was audited — so they
 * are kept apart and labelled as such wherever they appear.
 */
export const REGULATOR_MARKS: RegulatorMark[] = [
  { id: "efda", logo: "/certifications/revenbhel/efda-ethiopia.webp", width: 508, height: 204, alt: "Ethiopian Food and Drug Authority emblem", match: [/\bEFDA\b/i, /ethiopian food/i] },
  { id: "fda-ph", logo: "/certifications/revenbhel/fda-philippines.webp", width: 444, height: 192, alt: "Food and Drug Administration, Philippines emblem", match: [/philippines/i] },
  { id: "dpm", logo: "/certifications/revenbhel/dpm.webp", width: 432, height: 148, alt: "Direction de la Pharmacie et du Médicament emblem", match: [/\bDPM\b/, /direction de la pharmacie/i] },
  { id: "ppb", logo: "/certifications/revenbhel/ppb-kenya.webp", width: 331, height: 320, alt: "Pharmacy and Poisons Board, Republic of Kenya emblem", match: [/pharmacy and poisons board/i, /\bkenya\b/i] },
  { id: "nafdac", logo: "/certifications/revenbhel/nafdac-nigeria.webp", width: 327, height: 320, alt: "National Agency for Food and Drug Administration and Control, Nigeria emblem", match: [/\bNAFDAC\b/i] },
  // The ministry's crest was supplied separately at a higher resolution than the sheet crop.
  { id: "mohap", logo: "/certifications/revenbhel/UAE.png", width: 1309, height: 1202, alt: "United Arab Emirates Ministry of Health & Prevention emblem", match: [/ministry of health\s*&?\s*prevention/i, /united arab emirates/i] },
];

export function markForRegistration(registration: string): RegulatorMark | undefined {
  return REGULATOR_MARKS.find((m) => m.match.some((re) => re.test(registration)));
}
