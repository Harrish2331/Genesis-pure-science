import type { Partner } from "@/lib/content/types";

/**
 * Manufacturing partners, seeded until the dashboard saves its own copy.
 * Pure data (type-only imports) so unit tests can import this file directly.
 */

const SEEDED_AT = "2026-10-25T00:00:00.000Z";

const partner = (fields: Partial<Partner> & Pick<Partner, "id" | "slug" | "name" | "sortOrder" | "reviewNote">): Partner => ({
  fullName: "",
  nameConfirmed: false,
  description: "",
  tagline: "",
  location: "",
  region: "",
  capabilities: [],
  certifications: [],
  sites: [],
  exportMarkets: [],
  productRanges: [],
  registrations: [],
  notes: [],
  sourceNote: "",
  logo: null,
  website: "",
  published: true,
  createdAt: SEEDED_AT,
  updatedAt: SEEDED_AT,
  ...fields,
});

/**
 * Symbiosis and Bionexy profiles: shown at Genesis's instruction of
 * 25 October 2026, credited to each partner. Every detail is the partner's
 * own statement from its company brochure (as transcribed in the Zafieon
 * Pharma reference project); certification marks are the partner's, never
 * Genesis's. Genesis should confirm these are the same companies it works with.
 */
/**
 * Ravenbhel, Philanto, Eurocrit, Janus Biotech, Heliyac Healthcare and Amagen
 * Pharma: added as Genesis manufacturing partners at Genesis's instruction of
 * 26 October 2026. Their profiles are adapted from the partners' own
 * brochures, catalogue and website as transcribed in the Zafieon Pharma
 * reference project (src/data/partners.ts there); statements are credited to
 * each partner, and Zafieon-specific wording is not carried over. The client
 * companies those brochures list are the partners' customers, not partners of
 * Genesis, and are deliberately not shown.
 */
const SIX_NOTE = "Added at Genesis's instruction (26 Oct 2026). Confirm the profile is current with the partner, and confirm permission to show its logo.";

const IDENTITY_NOTE = "Confirm this profile is the same company Genesis works with (supplied to Genesis as a partner name only).";

export const seedPartners: Partner[] = [
  partner({
    id: "partner-symbiosis",
    slug: "symbiosis",
    name: "Symbiosis",
    fullName: "Symbiosis Group of Pharma Companies",
    sortOrder: 1,
    tagline: "Seven manufacturing units in the foothills of the Shivalik Range.",
    location: "India",
    region: "Himachal Pradesh · Gujarat · Haryana",
    description:
      "Symbiosis Group manufactures across pharmaceuticals, nutraceuticals, dermaceuticals, hormones, soft gels, pellets and medicated suppositories.\n\nThe group operates seven manufacturing units, each with self-contained quality control laboratories and R&D facilities, managed by pharma professionals supported by manufacturing, quality assurance, quality control and research personnel.",
    capabilities: ["Pharmaceuticals", "Nutraceuticals", "Dermaceuticals", "Hormones", "Soft gels", "Pellets", "Medicated suppositories"],
    certifications: ["ISO 9001:2015", "GMP", "WHO", "PIC/S Approved"],
    sites: [
      { name: "Symbiosis Pharmaceuticals Pvt. Ltd.", location: "Suketi Road, Kala Amb – 173030, Himachal Pradesh", role: "Plant I" },
      { name: "Saitech Medicare Pvt. Ltd.", location: "Trilokpur Road, Kala Amb – 173030, Himachal Pradesh", role: "Plant II" },
      { name: "Ovation Remedies", location: "Trilokpur Road, Kala Amb – 173030, Himachal Pradesh", role: "Plant III" },
      { name: "Prism Medico & Pharmacy Ltd.", location: "Suketi Road, Kala Amb – 173030, Himachal Pradesh", role: "Plant IV" },
      { name: "Infuze Well Private Limited", location: "Shahzadpur, Ambala, Haryana", role: "Plant V" },
      { name: "Hightech Healthcare", location: "Kala Amb – 173030, Himachal Pradesh", role: "" },
      { name: "Symbiosis Bioscience Pvt. Ltd.", location: "Makarba, Ahmedabad – 380051, Gujarat", role: "" },
      { name: "Balaji Prelams Pvt. Ltd.", location: "Trilokpur Road, Kala Amb – 173030, Himachal Pradesh", role: "Bottling" },
      { name: "Tejas Medipack", location: "Suketi Road, Kala Amb – 173030, Himachal Pradesh", role: "Printing" },
      { name: "NK Industries", location: "Suketi Road, Kala Amb – 173030, Himachal Pradesh", role: "Printing" },
    ],
    exportMarkets: [
      "Afghanistan", "Angola", "Azerbaijan", "Bolivia", "Cambodia", "Cameroon", "Chile", "DRC (Congo)", "Ethiopia", "Guatemala",
      "Ghana", "Georgia", "Iraq", "Iran", "Jordan", "Kenya", "Kurdistan", "Liberia", "Libya", "Mali", "Madagascar", "Malawi",
      "Mauritius", "Mozambique", "Myanmar", "Nigeria", "Peru", "Philippines", "Rwanda", "Somalia", "Sri Lanka", "South Sudan",
      "Tanzania", "Tajikistan", "Uganda", "Uzbekistan", "Venezuela", "Yemen", "Zambia",
    ],
    sourceNote:
      "Information from Symbiosis Group's corporate brochure. Certification marks, sites and export markets are the partner's own statements.",
    logo: { url: "/partners/symbiosis-group.webp", key: "static/partners/symbiosis-group.webp", width: 900, height: 298, contentType: "image/webp" },
    website: "https://www.symbiosispharmaceuticals.com",
    reviewNote: IDENTITY_NOTE,
  }),
  partner({
    id: "partner-bionexy",
    slug: "bionexy",
    name: "Bionexy",
    fullName: "Bionexy Pharma",
    sortOrder: 2,
    tagline: "A facility dedicated to soft gelatin capsules and hormonal tablets.",
    location: "India",
    description:
      "Bionexy Pharma began as a distribution business in 2021 and moved into manufacturing in 2022, after building a marketing network across India.\n\nThe facility is dedicated to the production of soft gelatin capsules and hormonal tablets, and is divided into departments covering infrastructure, equipment and delivery of finished pharmaceuticals.\n\nThe company states that its manufacturing is carried out under World Health Organization Good Manufacturing Practice principles.",
    capabilities: ["Soft gelatin capsules", "Hormonal tablets"],
    certifications: ["GMP", "GLP", "ISO 9001:2015", "WHO"],
    sourceNote: "Information from Bionexy Pharma's company brochure. Certification marks are the partner's own; certificate documents were not supplied.",
    logo: { url: "/partners/bionexy-pharma.webp", key: "static/partners/bionexy-pharma.webp", width: 900, height: 450, contentType: "image/webp" },
    // The brochure prints www.bionexy.in, but that domain did not resolve
    // (DNS: non-existent domain) when checked on 25 October 2026, so no link
    // is published until Genesis supplies a working address.
    website: "",
    reviewNote: `${IDENTITY_NOTE} Website: the brochure's www.bionexy.in does not resolve — supply the current address.`,
  }),
  partner({
    id: "partner-ravenbhel",
    slug: "ravenbhel-healthcare",
    name: "Ravenbhel",
    fullName: "Ravenbhel Healthcare Pvt. Ltd.",
    nameConfirmed: true,
    sortOrder: 3,
    tagline: "Your dependable formulation partner.",
    location: "India",
    region: "Amritsar, Punjab",
    description:
      "Ravenbhel Healthcare Pvt. Ltd. is an Indian formulation company working across contract development, scale-up and commercial manufacture, with its head office in Amritsar, Punjab.\n\nThe business traces its origins to 1981 and to Macmillon Pharmaceutical Ltd. The group has since added Ravenbhel Pharmaceutical Pvt. Ltd. in 2001, Ravenbhel Healthcare Pvt. Ltd. in 2004, Ravenmac Pharmaceuticals Pvt. Ltd. in 2010, Oswin Pharmaceutical in 2013 and Ravenbhel Biotech in 2014.\n\nManufacturing is organised across three units: Unit I serves domestic contract manufacturing and rest-of-world markets, Unit II — Ravenbhel Biotech — serves regulated markets, and Unit III — Macmillon Pharma — is dedicated to hormones.\n\nIts catalogue runs across gynaecology, anti-diabetic, pain management, ortho, gastro, neuro, general and supplement ranges. The gynaecology range is hormone-led, including dydrogesterone, progesterone, norethisterone, medroxyprogesterone acetate, allylestrenol, levonorgestrel and hydroxyprogesterone caproate.\n\nThe company states that it has sponsored and conducted six Phase IV clinical trials and twenty-six bioequivalence studies, and that it maintains in-house research and development alongside its manufacturing.",
    capabilities: [
      "Contract formulation development",
      "Scale-up and commercial manufacture",
      "Hormones — dedicated unit",
      "Tablets",
      "Capsules",
      "Oral liquids",
      "Sachets",
      "Sustained-release formulations",
      "In-house research and development",
      "Bioequivalence studies",
    ],
    productRanges: ["Gynaecology (hormones)", "Anti-diabetic", "Pain management", "Ortho", "Gastro", "Neuro", "General", "Supplements"],
    certifications: ["WHO"],
    registrations: [
      "Ethiopian Food & Drug Authority (EFDA)",
      "Food and Drug Administration, Philippines",
      "Direction de la Pharmacie et du Médicament (DPM)",
      "Pharmacy and Poisons Board, Ministry of Health, Republic of Kenya",
      "National Agency for Food and Drug Administration and Control (NAFDAC), Nigeria",
      "Ministry of Health & Prevention, United Arab Emirates",
    ],
    sites: [
      { name: "Ravenbhel Healthcare Pvt. Ltd.", location: "Amritsar, Punjab", role: "Unit I — domestic contract and ROW markets" },
      { name: "Ravenbhel Biotech", location: "Amritsar, Punjab", role: "Unit II — regulated markets" },
      { name: "Macmillon Pharma", location: "Amritsar, Punjab", role: "Unit III — dedicated to hormones" },
      { name: "Head office", location: "17/2 Kennedy Avenue, Amritsar – 143 001, Punjab", role: "" },
    ],
    exportMarkets: [
      "Afghanistan", "Bolivia", "Cambodia", "Cameroon", "Costa Rica", "Dominican Republic", "Ecuador", "El Salvador", "Ethiopia",
      "Fiji", "Guatemala", "Honduras", "Ivory Coast", "Kenya", "Mali", "Mauritius", "Myanmar", "Nicaragua", "Nigeria", "Panama",
      "Philippines", "Thailand", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zimbabwe",
    ],
    notes: [
      "The catalogue states that Unit III is built to USFDA, UK MHRA and PIC/S requirements. This is the partner's own statement of the standard the unit is designed to, not evidence of an inspection outcome or an approval held.",
      "The registrations listed are market registrations held by Ravenbhel. They do not indicate the registration status of any Genesis product.",
      "A sterile injectables and R&D facility, to be operated by Biovonic Healthcare Pvt. Ltd., is announced in the catalogue as upcoming. Its stated capacities are planned, not installed: liquid vials 3 million, liquid ampoules 200 million, dry powder injections 2 million, lyophilised injectables 18 million, and pre-filled syringes and cartridges 5 million per annum.",
      "The catalogue states forty-three years of experience and dates the group's origins to 1981; both are reproduced as printed.",
    ],
    sourceNote: "Information from Ravenbhel Healthcare's own product catalogue. Certifications, registrations and capacities are the partner's own statements.",
    logo: { url: "/partners/ravenbhel-healthcare.webp", key: "static/partners/ravenbhel-healthcare.webp", width: 900, height: 275, contentType: "image/webp" },
    website: "https://www.ravenbhel.com",
    reviewNote: SIX_NOTE,
  }),
  partner({
    id: "partner-philanto",
    slug: "philanto-wellness",
    name: "Philanto",
    fullName: "Philanto Wellness",
    nameConfirmed: true,
    sortOrder: 4,
    tagline: "Third-party manufacturing across tablets, capsules, syrups and ointments.",
    location: "India",
    region: "Dera Bassi, Mohali, Punjab",
    description:
      "Philanto Wellness is a third-party pharmaceutical manufacturer located at Dera Bassi, S.A.S. Nagar (Mohali), Punjab, manufacturing tablets, capsules, syrups and ointments.\n\nThe company states that its products meet relevant pharmacopoeial standards and statutory requirements, that design, development and manufacture are managed to deliver consistent quality, and that it holds more than 500 product approvals.\n\nManufacturing volumes cited in its company profile peak at 1,000 million tablets, 200 million capsules, 50 million oral liquid and 10 million beta-lactam and syrup units.",
    capabilities: ["Tablets", "Capsules", "Syrups", "Ointments"],
    sites: [
      { name: "Manufacturing unit", location: "Village Behra Road, Dera Bassi, District S.A.S. Nagar, Mohali, Punjab", role: "" },
      { name: "Corporate office", location: "Plot No. 14, Arjun Nagar, Nanhera, Ambala Cantt", role: "" },
    ],
    notes: [
      "The company profile gives two different figures for the company's history — fifteen years in distribution and manufacturing, and five years of manufacturing experience — so neither is used here until the partner reconciles them.",
    ],
    sourceNote: "Information from Philanto Wellness's own company profile. Volumes and approvals are the partner's own statements.",
    logo: { url: "/partners/philanto-wellness.webp", key: "static/partners/philanto-wellness.webp", width: 900, height: 415, contentType: "image/webp" },
    website: "https://www.philantowellness.com",
    reviewNote: SIX_NOTE,
  }),
  partner({
    id: "partner-eurocrit",
    slug: "eurocrit-labs",
    name: "Eurocrit",
    fullName: "Eurocrit Labs International Pvt. Ltd.",
    nameConfirmed: true,
    sortOrder: 5,
    tagline: "Human Values… Innovating Without Hassle.",
    location: "India",
    region: "Baddi, Himachal Pradesh",
    description:
      "Eurocrit Labs International is a manufacturer of parenteral and liquid formulations, working across large volume parenterals, respules, sachets and form-fill-seal oral solutions.",
    capabilities: ["Parenteral drugs (LVP)", "Respules (SVP)", "Sachets (drug)", "Oral solutions — FFS", "Probiotic oral solution"],
    sourceNote: "Information from Eurocrit Labs' own company brochure; location from the partner's website.",
    logo: { url: "/partners/eurocrit-labs.webp", key: "static/partners/eurocrit-labs.webp", width: 900, height: 376, contentType: "image/webp" },
    website: "https://www.eurocrit.com",
    reviewNote: SIX_NOTE,
  }),
  partner({
    id: "partner-janus",
    slug: "janus-biotech-india",
    name: "Janus Biotech",
    fullName: "Janus Biotech India Pvt. Ltd.",
    nameConfirmed: true,
    sortOrder: 6,
    tagline: "Formulation manufacturing at Kala Amb, Himachal Pradesh, across a wide range of dosage forms.",
    location: "India",
    region: "Kala Amb, Himachal Pradesh · Chandigarh",
    description:
      "Janus Biotech India Pvt. Ltd. is a pharmaceutical formulation manufacturer with its manufacturing facility at Kala Amb, Himachal Pradesh, and its business office in Chandigarh.\n\nThe company states that it manufactures under WHO-GMP and GLP standards and holds ISO 9001:2015 certification. Its portfolio of DCGI-approved products is organised into General, Cardiac & Diabetic, Derma, Ophthalmic, Critical Care and Ayurvedic ranges, marketed through eight specialised divisions — Rumi Pharma, Thea, NYX Critical Care, Janus Neutrave, Spica Drugs, Janus Gold, Burgeon Health Series and Drishti Ophthalmi — and its stated range includes gynaecology products.\n\nAlongside its own portfolio, Janus Biotech offers third-party manufacturing, covering formulation development, production and packaging under the client's own brand. The dosage forms it lists run from tablets, capsules and soft gelatin capsules to injectables, syrups, oral suspensions and oral drops, and on to ointments, eye and nasal drops, lotions and shampoos, dental care, protein powders, ORS sachets and antiseptic products.",
    capabilities: [
      "Third-party manufacturing",
      "Tablets",
      "Capsules",
      "Soft gelatin capsules",
      "Injectables",
      "Syrups",
      "Oral suspensions",
      "Oral drops",
      "Ointments",
      "Eye and nasal drops",
      "Lotions and shampoos",
      "Dental care products",
      "Protein powders",
      "ORS and sachets",
      "Antiseptic products",
    ],
    productRanges: ["General", "Cardiac & Diabetic", "Derma", "Ophthalmic", "Critical Care", "Ayurvedic", "Gynaecology"],
    certifications: ["WHO-GMP", "GLP", "ISO 9001:2015"],
    registrations: ["Drugs Controller General of India (DCGI) — product approvals"],
    sites: [
      { name: "Manufacturing unit", location: "Kala Amb, Himachal Pradesh", role: "" },
      { name: "Business office", location: "Plot No. 84, Raipur Kalan, Chandigarh – 160102", role: "" },
    ],
    notes: [
      "The partner's website gives two different figures for the size of its product range and refers to two manufacturing units while naming only the Kala Amb facility; neither figure is reproduced here.",
      "Certifications are as stated on the partner's website; certificate documents have not been supplied.",
    ],
    sourceNote: "Information from Janus Biotech's own website (home, about, certification and third-party manufacturing pages).",
    logo: { url: "/partners/janus-biotech-india.webp", key: "static/partners/janus-biotech-india.webp", width: 900, height: 688, contentType: "image/webp" },
    website: "https://www.janusbiotech.co.in",
    reviewNote: SIX_NOTE,
  }),
  partner({
    id: "partner-heliyac",
    slug: "heliyac-healthcare",
    name: "Heliyac Healthcare",
    fullName: "Heliyac Healthcare Pvt. Ltd.",
    nameConfirmed: true,
    sortOrder: 7,
    tagline: "Pharmaceutical manufacturing in Pondicherry.",
    location: "India",
    region: "Pondicherry",
    description:
      "Heliyac Healthcare Pvt. Ltd. is a pharmaceutical manufacturing partner located in Pondicherry.\n\nA fuller company profile — facilities, dosage-form capabilities and quality systems — will be added once the company's corporate documentation has been received.",
    certifications: ["WHO", "ISO 9001:2015", "GMP", "GLP"],
    sites: [{ name: "Manufacturing unit", location: "Pondicherry", role: "" }],
    sourceNote: "Name, location and certifications from the partner's certification records. A full company brochure has not yet been supplied, so no capability is claimed on its behalf.",
    logo: { url: "/partners/heliyac-healthcare.webp", key: "static/partners/heliyac-healthcare.webp", width: 740, height: 678, contentType: "image/webp" },
    reviewNote: `${SIX_NOTE} Interim profile: no brochure or website supplied.`,
  }),
  partner({
    id: "partner-amagen",
    slug: "amagen-pharma",
    name: "Amagen Pharma",
    fullName: "Amagen Pharma Private Limited",
    nameConfirmed: true,
    sortOrder: 8,
    tagline: "Pharmaceutical manufacturing in Himachal Pradesh.",
    location: "India",
    region: "Himachal Pradesh",
    description:
      "Amagen Pharma Private Limited is a pharmaceutical manufacturing partner located in Himachal Pradesh.\n\nA fuller company profile — facilities, dosage-form capabilities and quality systems — will be added once the company's corporate documentation has been received.",
    certifications: ["WHO", "ISO 9001:2015", "GMP", "GLP"],
    sites: [{ name: "Manufacturing unit", location: "Himachal Pradesh", role: "" }],
    sourceNote: "Name, location and certifications from the partner's certification records. A full company brochure has not yet been supplied, so no capability is claimed on its behalf.",
    logo: { url: "/partners/amagen-pharma.webp", key: "static/partners/amagen-pharma.webp", width: 900, height: 900, contentType: "image/webp" },
    reviewNote: `${SIX_NOTE} Interim profile: no brochure or website supplied. The supplied logo is a photograph of signage; flat or vector artwork would sit better beside the other marks.`,
  }),
  partner({
    id: "partner-sb-lifense",
    slug: "sb-lifense",
    name: "SB Lifense",
    sortOrder: 9,
    reviewNote: "Spelling supplied as “SB Lifense” — confirm the exact registered name, plus logo, website and a verified profile.",
  }),
];
