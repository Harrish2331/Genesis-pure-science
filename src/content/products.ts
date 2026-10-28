import type { Product, ProductCategory, SubcategoryId } from "@/lib/content/types";

/**
 * GENESIS PURE LIFESCIENCES — PRODUCT CATALOGUE (seed dataset)
 *
 * The single structured source for every product. Pages, filters, search,
 * the sitemap and category counts all read from it (via the content store),
 * so adding a record here — or in Admin → Products — makes the product
 * appear in every relevant view with no page changes.
 *
 * ── Where each record comes from ────────────────────────────────────────
 * Only assets the client supplied for Genesis (all in public/products):
 *
 *   dvits.jpeg                                  D-VITS 60K pack
 *   WhatsApp Image 2026-10-20 at 4.26.*.jpeg    seven pack shots
 *   product ranges.jpeg                         eight named products
 *                                               (four further rows are
 *                                               redacted — not identifiable)
 *
 * Every name, composition, dosage form and pack size below is transcribed
 * from the artwork as printed. A field the artwork does not show is left
 * empty and is hidden on the site. No indication, benefit, dosage advice or
 * price is stated. Indication text printed on some packs (e.g. Novarg,
 * Labenova, Movacal) is used only to choose the subcategory and is not
 * repeated as a claim; it remains visible on the pack image itself.
 *
 * Also included, at Genesis's instruction of 25 October 2026: the fifteen
 * women's health products whose cartons are also in the Zafieon Pharma
 * catalogue (see `sharedRange` below).
 *
 * Prescription-only flags follow the molecule's prescription status
 * (mifepristone/misoprostol, labetalol, injectables); confirm with Genesis.
 */

const SEEDED_AT = "2026-10-23T00:00:00.000Z";

type Entry = {
  slug: string;
  name: string;
  category: ProductCategory;
  subcategories: SubcategoryId[];
  composition: string;
  dosageForm: string;
  packSize?: string;
  shortDescription: string;
  description?: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  imageCaption?: string;
  specifications?: { label: string; value: string }[];
  prescriptionOnly?: boolean;
  featured?: boolean;
  reviewNote: string;
};

const PACK = { w: 1536, h: 1024 };

const record = (e: Entry, sortOrder: number): Product => ({
  id: e.slug,
  slug: e.slug,
  name: e.name,
  category: e.category,
  subcategories: e.subcategories,
  composition: e.composition,
  dosageForm: e.dosageForm,
  packSize: e.packSize ?? "",
  shortDescription: e.shortDescription,
  description: e.description ?? "",
  image: { url: `/products/${e.image}`, key: `static/products/${e.image}`, width: e.imageWidth, height: e.imageHeight, contentType: "image/webp" },
  imageAlt: e.imageAlt,
  // Sheet-only products show their printed block, so they say so.
  imageCaption: e.imageCaption ?? (e.reviewNote === FROM_SHEET || e.reviewNote.startsWith(FROM_SHEET) ? SHEET_CAPTION : ""),
  specifications: e.specifications ?? [],
  manufacturer: "",
  marketedBy: "",
  brand: "",
  availability: "unspecified",
  prescriptionOnly: e.prescriptionOnly ?? false,
  featured: e.featured ?? false,
  status: "published",
  placeholder: false,
  reviewNote: e.reviewNote,
  seoTitle: "",
  metaDescription: "",
  sortOrder,
  createdAt: SEEDED_AT,
  updatedAt: SEEDED_AT,
});

const FROM_PACK = "Transcribed from the supplied pack artwork.";
const SHEET_CAPTION = "As printed on the Genesis product-range sheet. Pack image to follow.";
const FROM_SHEET =
  "Transcribed from the supplied “Product Ranges” sheet; no pack photograph supplied yet — the image is the product’s block cropped from that sheet. Supply a pack shot and pack size.";

/* ── Women's Health ───────────────────────────────────────────────────── */

const womensHealth: Entry[] = [
  {
    slug: "d-vits-60k",
    name: "D-VITS 60K",
    category: "womens-health",
    subcategories: ["womens-wellness"],
    composition:
      "Each 5 ml contains: Cholecalciferol IP 60,000 IU (in nano droplet form); excipients q.s.; in a flavoured base. Colour: Tartrazine.",
    dosageForm: "Oral solution (nano), ready-to-drink",
    packSize: "4 x 5 ml bottles",
    shortDescription: "Vitamin D3 Oral Solution 60,000 IU — a nano oral solution, presented as a ready-to-drink solution in 4 x 5 ml bottles.",
    description: "D-VITS 60K is a Vitamin D3 (Cholecalciferol) nano oral solution, supplied as a ready-to-drink solution in 5 ml bottles.\n\nUse as directed by the physician.",
    image: "d-vits-60k.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "D-VITS 60K carton — Vitamin D3 Oral Solution 60,000 IU, Nano Oral Solution, ready-to-drink, 4 x 5 ml bottles",
    specifications: [
      { label: "Dosage", value: "As directed by the physician" },
      { label: "Storage", value: "Store protected from light, at a temperature not exceeding 30°C. Keep all medicines out of reach of children." },
    ],
    featured: true,
    reviewNote: `${FROM_PACK} Placed in Women’s Health at Genesis’s request. The pack shows a “Pelagic” mark — confirm the manufacturer/marketer.`,
  },
  {
    slug: "mifestand-kit",
    name: "Mifestand Kit",
    category: "womens-health",
    subcategories: ["reproductive-health", "gynaecology"],
    composition: "Combipack of Mifepristone & Misoprostol Tablets",
    dosageForm: "Combipack (tablets)",
    packSize: "1 kit",
    shortDescription: "Combipack of Mifepristone and Misoprostol Tablets, presented as a single kit.",
    image: "mifestand-kit.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Mifestand Kit carton — Combipack of Mifepristone & Misoprostol Tablets, 1 kit",
    prescriptionOnly: true,
    featured: true,
    reviewNote: `${FROM_PACK} Strengths are not shown on the supplied artwork. The pack carries a “Nova Sea” mark — confirm the manufacturer/marketer.`,
  },
  {
    slug: "labenova",
    name: "Labenova",
    category: "womens-health",
    subcategories: ["pregnancy-maternal-care", "gynaecology"],
    composition: "Labetalol 100 mg Tablets",
    dosageForm: "Tablets",
    packSize: "1 x 10 tablets",
    shortDescription: "Labetalol 100 mg tablets, presented in a pack of 1 x 10 tablets.",
    image: "labenova.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Labenova carton — Labetalol 100 mg Tablets, 1 x 10 tablets",
    prescriptionOnly: true,
    featured: true,
    reviewNote: `${FROM_PACK} Subcategory from the pregnancy-related text printed on the pack.`,
  },
  {
    slug: "novarg",
    name: "Novarg",
    category: "womens-health",
    subcategories: ["pregnancy-maternal-care"],
    composition: "L-Arginine 3 gm + DHA 200 mg + Proanthocyanidin 75 mg + Vitamin B6 3 mg",
    dosageForm: "Sachets",
    shortDescription: "L-Arginine, DHA, Proanthocyanidin and Vitamin B6 in sachet form.",
    image: "novarg.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Novarg carton — L-Arginine 3 gm, DHA 200 mg, Proanthocyanidin 75 mg and Vitamin B6 3 mg sachets",
    featured: true,
    reviewNote: `${FROM_PACK} Subcategory from the pregnancy-related text printed on the pack. Pack size not shown.`,
  },
  {
    slug: "chinfol-m",
    name: "Chinfol-M",
    category: "womens-health",
    subcategories: ["pregnancy-maternal-care"],
    composition: "Methylcobalamin 1500 mcg + L-Methylfolate 1 mg + Pyridoxal 5 Phosphate 0.5 mg",
    dosageForm: "",
    shortDescription: "Methylcobalamin, L-Methylfolate and Pyridoxal 5 Phosphate.",
    image: "chinfol-m.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Chinfol-M carton — Methylcobalamin 1500 mcg, L-Methylfolate 1 mg and Pyridoxal 5 Phosphate 0.5 mg",
    reviewNote: `${FROM_PACK} Subcategory from the maternal-care line printed on the pack. Dosage form and pack size not shown — confirm.`,
  },
  {
    slug: "movacal",
    name: "Movacal",
    category: "womens-health",
    subcategories: ["pregnancy-maternal-care", "womens-wellness"],
    composition: "Dicalcium malate 1379 mg + Vitamin D2 400 IU + Folic acid 100 mg + Glycine 10 mg",
    dosageForm: "Tablets",
    shortDescription: "Dicalcium malate, Vitamin D2, Folic acid and Glycine tablets.",
    image: "movacal.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Movacal carton — Dicalcium malate 1379 mg, Vitamin D2 400 IU, Folic acid and Glycine 10 mg tablets",
    reviewNote: `${FROM_PACK} VERIFY: the artwork prints “Folic acid 100mg”, which may be a typo (e.g. 100 mcg) — confirm against the approved label before launch. Subcategories from the pregnancy, lactation and post-menopausal text on the pack. Pack size not shown.`,
  },
];

/* ── General Medicine ─────────────────────────────────────────────────── */

const generalMedicine: Entry[] = [
  {
    slug: "encical",
    name: "Encical",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition: "Calcium Citrate Malate 500 mg, Vitamin D3 1000 IU",
    dosageForm: "Softgel capsules",
    shortDescription: "Calcium Citrate Malate 500 mg and Vitamin D3 1000 IU softgel capsules.",
    image: "encical.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Encical carton — Calcium Citrate Malate 500 mg and Vitamin D3 1000 IU softgel capsules",
    featured: true,
    reviewNote: `${FROM_PACK} The pack does not name a patient group, so it is listed under General Medicine — move it to Women’s Health if Genesis positions it there. Pack size not shown.`,
  },
  {
    slug: "leesam",
    name: "Leesam",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition: "Multivitamin and multimineral with grape seed extract",
    dosageForm: "",
    shortDescription: "A multivitamin and multimineral combination with grape seed extract.",
    image: "leesam.webp",
    imageWidth: PACK.w,
    imageHeight: PACK.h,
    imageAlt: "Leesam carton — multivitamin, multimineral with grape seed extract",
    reviewNote: `${FROM_PACK} VERIFY: the artwork gives no detailed composition, dosage form, pack size or patient group. Listed under General Medicine › Vitamins & Nutrition until Genesis confirms its category.`,
  },
  {
    slug: "meconia-inj",
    name: "Meconia Inj",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition: "Methylcobalamin 1000 mcg, Pyridoxine HCl 100 mg, Nicotinamide 100 mg & D-Panthenol 50 mg & Benzyl Alcohol 1.5% v/v",
    dosageForm: "Injection (IM / IV)",
    shortDescription: "Methylcobalamin, Pyridoxine HCl, Nicotinamide and D-Panthenol injection for IM / IV use.",
    image: "meconia-inj.webp",
    imageWidth: 1014,
    imageHeight: 760,
    imageAlt: "Meconia Inj — Methylcobalamin 1000 mcg, Pyridoxine HCl 100 mg, Nicotinamide 100 mg, D-Panthenol 50 mg, Benzyl Alcohol 1.5% v/v, injection IM / IV",
    prescriptionOnly: true,
    reviewNote: FROM_SHEET,
  },
  {
    slug: "meconia-pfs-inj",
    name: "Meconia PFS Inj",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition: "Methylcobalamin 1500 mcg, Benzyl Alcohol 2% v/v",
    dosageForm: "PFS injection (IM / IV)",
    shortDescription: "Methylcobalamin 1500 mcg PFS injection for IM / IV use.",
    image: "meconia-pfs-inj.webp",
    imageWidth: 811,
    imageHeight: 608,
    imageAlt: "Meconia PFS Inj — Methylcobalamin 1500 mcg, Benzyl Alcohol 2% v/v, injection IM / IV",
    prescriptionOnly: true,
    reviewNote: FROM_SHEET,
  },
  {
    slug: "meconia-tab",
    name: "Meconia Tab",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition:
      "Methylcobalamin 1500 mcg, Biotin 100 mcg, ALA 100 mg, Inositol 2 mg, Folic Acid 1.5 mg, Chromium Picolinate 60 mcg, Sodium Selenite 65 mcg, Vitamin B6 3 mg & Zinc Sulphate 15 mg",
    dosageForm: "Tablets",
    shortDescription: "Methylcobalamin with Biotin, ALA, Inositol, Folic Acid, Chromium Picolinate, Sodium Selenite, Vitamin B6 and Zinc Sulphate tablets.",
    image: "meconia-tab.webp",
    imageWidth: 1014,
    imageHeight: 760,
    imageAlt: "Meconia Tab — Methylcobalamin 1500 mcg with Biotin, ALA, Inositol, Folic Acid, Chromium Picolinate, Sodium Selenite, Vitamin B6 and Zinc Sulphate tablets",
    reviewNote: FROM_SHEET,
  },
  {
    slug: "meq-d3",
    name: "MEQ-D3",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition: "Cholecalciferol 60000 IU",
    dosageForm: "Softgel capsules",
    shortDescription: "Cholecalciferol 60000 IU soft gel capsules.",
    image: "meq-d3.webp",
    imageWidth: 1096,
    imageHeight: 822,
    imageAlt: "MEQ-D3 Soft Gel Cap — Cholecalciferol 60000 IU",
    reviewNote: FROM_SHEET,
  },
  {
    slug: "meq-7",
    name: "MEQ-7",
    category: "general-medicine",
    subcategories: ["vitamins-nutrition"],
    composition: "Foxtail Millet, Pearl Millet, Kodo Millet, Little Millet, Finger Millet, Sorghum Millet, Barnyard Millet",
    dosageForm: "Protein with health mix",
    shortDescription: "A protein health mix of seven millets.",
    image: "meq-7.webp",
    imageWidth: 1014,
    imageHeight: 760,
    imageAlt: "MEQ-7 Protein with Health Mix — Foxtail, Pearl, Kodo, Little, Finger, Sorghum and Barnyard millet",
    reviewNote: FROM_SHEET,
  },
  {
    slug: "gasco",
    name: "Gasco",
    category: "general-medicine",
    subcategories: ["gastrointestinal-care"],
    composition: "Dried Aluminium Hydroxide 250 mg + Magnesium Hydroxide 250 mg + Oxetacaine 10 mg",
    dosageForm: "Suspension",
    shortDescription: "Dried Aluminium Hydroxide, Magnesium Hydroxide and Oxetacaine suspension.",
    image: "gasco.webp",
    imageWidth: 1014,
    imageHeight: 760,
    imageAlt: "Gasco — Dried Aluminium Hydroxide 250 mg, Magnesium Hydroxide 250 mg and Oxetacaine 10 mg suspension",
    reviewNote: FROM_SHEET,
  },
  {
    slug: "sucra-l",
    name: "Sucra L",
    category: "general-medicine",
    subcategories: ["gastrointestinal-care"],
    composition: "Sucralfate 500 mg + Oxetacaine 10 mg",
    dosageForm: "Suspension",
    shortDescription: "Sucralfate 500 mg and Oxetacaine 10 mg suspension.",
    image: "sucra-l.webp",
    imageWidth: 1096,
    imageHeight: 822,
    imageAlt: "Sucra L — Sucralfate 500 mg and Oxetacaine 10 mg suspension",
    reviewNote: FROM_SHEET,
  },
  {
    slug: "rubgo",
    name: "Rubgo",
    category: "general-medicine",
    subcategories: ["pain-management"],
    composition: "Diclofenac Diethylamine, Linseed Oil, Menthol, Methyl Salicylate & Benzyl Alcohol Gel",
    dosageForm: "Roll-on gel",
    shortDescription: "Diclofenac Diethylamine, Linseed Oil, Menthol and Methyl Salicylate roll-on gel.",
    image: "rubgo.webp",
    imageWidth: 1096,
    imageHeight: 822,
    imageAlt: "Rubgo Roll On — Diclofenac Diethylamine, Linseed Oil, Menthol, Methyl Salicylate and Benzyl Alcohol gel",
    reviewNote: `${FROM_SHEET} Strengths are not printed on the sheet.`,
  },
];

/* ── Women's health range also carried in the Zafieon Pharma catalogue ──
 *
 * Published at Genesis's instruction of 25 October 2026 ("All"). Pack images
 * are byte-identical copies of the cartons in Zafieon's project, and every
 * value is transcribed from Zafieon's verified pack data, which was itself read
 * off those cartons. Femi-Dros 20/30 and Proluvia-AQ cartons carry the Zafieon
 * Pharma mark; their captions say so. Therapeutic areas map Zafieon's onto
 * Genesis's (Reproductive & Women's Health → Reproductive Health).
 */
const ZAF_NOTE =
  "Published at Genesis's instruction; details transcribed from the carton (as recorded in Zafieon Pharma's verified catalogue data). Confirm the marketer and licence details for the Genesis listing.";
const ZAF_MARK_CAPTION = "Pack shown for identification. The carton shown carries the Zafieon Pharma mark.";

const sharedRange: Entry[] = [
  {
    slug: "femulet",
    name: "Femulet",
    category: "womens-health",
    subcategories: ["gynaecology", "fertility"],
    composition: "N-Acetyl L-Cysteine, Coenzyme Q10, Melatonin, Astaxanthin, Folic Acid, Vitamin B6, Vitamin B12 & Vitamin D2 Tablets",
    dosageForm: "Tablets",
    packSize: "1 x 10 x 1 tablets",
    shortDescription:
      "A nutraceutical tablet for women combining N-Acetyl L-Cysteine, Coenzyme Q10, Melatonin, Astaxanthin, Folic Acid and vitamins B6, B12 and D2.",
    image: "femulet.webp",
    imageWidth: 1200,
    imageHeight: 1160,
    imageAlt: "Femulet carton — N-Acetyl L-Cysteine, Coenzyme Q10, Melatonin, Astaxanthin, Folic Acid and vitamin tablets",
    specifications: [
      { label: "Pack markings", value: "Nutraceutical — For Women; Vegetarian" },
      { label: "Licence (as printed)", value: "FSSAI Lic. No. 22426535000422" },
    ],
    featured: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "florabet-ll",
    name: "Florabet LL",
    category: "womens-health",
    subcategories: ["gynaecology", "womens-wellness"],
    composition: "Prebiotic, Probiotic (Lactobacilli) and Lactoferrin Capsules",
    dosageForm: "Capsules",
    packSize: "10 x 1 capsules",
    shortDescription: "A nutraceutical capsule combining prebiotic, probiotic Lactobacilli and Lactoferrin.",
    image: "florabet-ll.webp",
    imageWidth: 1200,
    imageHeight: 728,
    imageAlt: "Florabet LL carton — prebiotic, probiotic Lactobacilli and Lactoferrin capsules",
    specifications: [{ label: "Pack markings", value: "Nutraceutical; Vegetarian" }],
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "zyfolic",
    name: "Zyfolic",
    category: "womens-health",
    subcategories: ["gynaecology", "womens-wellness"],
    composition: "L-Methyl folate, Methylcobalamin, Pyridoxal-5 Phosphate, DHA & Vitamin D3 Softgel Capsules",
    dosageForm: "Softgel capsules",
    packSize: "1 x 10 x 1 softgel capsules",
    shortDescription: "A softgel capsule combining L-Methyl folate, Methylcobalamin, Pyridoxal-5 Phosphate, DHA and Vitamin D3.",
    image: "zyfolic.webp",
    imageWidth: 1200,
    imageHeight: 900,
    imageAlt: "Zyfolic carton — L-Methyl folate, Methylcobalamin, Pyridoxal-5 Phosphate, DHA and Vitamin D3 softgel capsules",
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "zyfolic-q4",
    name: "Zyfolic Q4",
    category: "womens-health",
    subcategories: ["gynaecology", "womens-wellness"],
    composition:
      "(6S)-5-Methyltetrahydrofolic Acid 527.25 mcg, Glucosamine Salt, Pyridoxal 2.3 mg, Cyanocobalamin 2.45 mcg & Glycine 10.0 mg Tablets",
    dosageForm: "Tablets",
    packSize: "1 x 10 x 1 tablets",
    shortDescription: "(6S)-5-methyltetrahydrofolic acid glucosamine salt with Pyridoxal, Cyanocobalamin and Glycine tablets.",
    image: "zyfolic-q4.webp",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Zyfolic Q4 carton — (6S)-5-methyltetrahydrofolic acid glucosamine salt, Pyridoxal, Cyanocobalamin and Glycine tablets",
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "meta-coq",
    name: "Meta-CoQ 300",
    category: "womens-health",
    subcategories: ["fertility"],
    composition: "Coenzyme Q10 (Ubiquinol Acetate) 300 mg + L-Carnitine L-Tartrate 750 mg + Astaxanthin 8 mg",
    dosageForm: "Tablets",
    packSize: "1 x 5 x 1 tablets",
    shortDescription:
      "A nutraceutical tablet for men combining Coenzyme Q10 (ubiquinol acetate), L-Carnitine L-Tartrate and Astaxanthin.",
    image: "meta-coq.webp",
    imageWidth: 1200,
    imageHeight: 900,
    imageAlt: "Meta-CoQ 300 carton for men — Coenzyme Q10, L-Carnitine L-Tartrate and Astaxanthin tablets",
    specifications: [{ label: "Pack markings", value: "For Men" }],
    reviewNote: `${ZAF_NOTE} The carton is marked “For Men” (kept visible); listed under Fertility, as in the reference catalogue.`,
  },
  {
    slug: "iro-cal",
    name: "Iro Cal",
    category: "womens-health",
    subcategories: ["womens-wellness"],
    composition: "Calcium Citrate Malate 500 mg, Magnesium 100 mg, Vitamin D3 400 IU & Folic Acid 200 mcg Tablets",
    dosageForm: "Tablets",
    packSize: "1 x 10 x 1 tablets",
    shortDescription: "Calcium Citrate Malate, Magnesium, Vitamin D3 and Folic Acid tablets.",
    image: "iro-cal.webp",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Iro Cal carton — Calcium Citrate Malate, Magnesium, Vitamin D3 and Folic Acid tablets",
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "iro-plus",
    name: "Iro Plus",
    category: "womens-health",
    subcategories: ["womens-wellness"],
    composition: "Ferric Pyrophosphate (Liposomal) eq. Iron 30 mg, Vitamin C 50 mg, Vitamin B12 2.2 mcg & Folic Acid 200 mcg Tablets",
    dosageForm: "Tablets",
    packSize: "1 x 10 x 1 tablets",
    shortDescription: "Liposomal ferric pyrophosphate (eq. iron 30 mg) with Vitamin C, Vitamin B12 and Folic Acid tablets.",
    image: "iro-plus.webp",
    imageWidth: 1200,
    imageHeight: 800,
    imageAlt: "Iro Plus carton — Ferric Pyrophosphate (Liposomal) eq. Iron 30 mg, Vitamin C, Vitamin B12 and Folic Acid tablets",
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "ferrin-xt",
    name: "Ferrin-XT",
    category: "womens-health",
    subcategories: ["womens-wellness", "pregnancy-maternal-care"],
    composition:
      "Lactoferrin 50 mg, Disodium Guanosine 5-Monophosphate 5 mg, Elemental Iron (FBG) 27 mg, Vitamin D3 600 IU, Folic Acid 200 mcg and DHA 200 mg Tablets",
    dosageForm: "Tablets",
    packSize: "10 x 1 x 10 tablets",
    shortDescription: "Lactoferrin, elemental iron, folic acid, DHA, Vitamin D3 and disodium guanosine 5-monophosphate tablets.",
    image: "ferrin-xt.webp",
    imageWidth: 1400,
    imageHeight: 1050,
    imageAlt: "Ferrin-XT carton — Lactoferrin, elemental iron, folic acid, DHA and vitamin tablets",
    specifications: [{ label: "Pack markings", value: "Food for special dietary use; For pregnant women; Vegetarian" }],
    reviewNote: `${ZAF_NOTE} Pregnancy & Maternal Care from the “For pregnant women” marking on the carton.`,
  },
  {
    slug: "femi-dros-30",
    name: "Femi-Dros 30",
    category: "womens-health",
    subcategories: ["gynaecology", "hormonal-health"],
    composition: "Drospirenone 3 mg + Ethinyl Estradiol 0.03 mg Tablets IP",
    dosageForm: "Tablets",
    packSize: "1 x 21 tablets",
    shortDescription: "A prescription combination tablet containing Drospirenone and Ethinyl Estradiol, presented in a twenty-one tablet pack.",
    image: "femi-dros-30.webp",
    imageWidth: 1400,
    imageHeight: 933,
    imageCaption: ZAF_MARK_CAPTION,
    imageAlt: "Femi-Dros 30 carton — Drospirenone 3 mg and Ethinyl Estradiol 0.03 mg Tablets IP, bearing the Zafieon Pharma mark",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "femi-dros-20",
    name: "Femi-Dros 20",
    category: "womens-health",
    subcategories: ["gynaecology", "hormonal-health"],
    composition: "Drospirenone 3 mg & Ethinylestradiol 0.02 mg Tablets IP",
    dosageForm: "Tablets",
    packSize: "10 x 1 x 21 tablets",
    shortDescription: "A prescription combination tablet containing Drospirenone and Ethinylestradiol at a lower estradiol strength.",
    image: "femi-dros-20.webp",
    imageWidth: 1200,
    imageHeight: 800,
    imageCaption: ZAF_MARK_CAPTION,
    imageAlt: "Femi-Dros 20 carton — Drospirenone 3 mg and Ethinylestradiol 0.02 mg Tablets IP, bearing the Zafieon Pharma mark",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "luna-35",
    name: "Luna 35",
    category: "womens-health",
    subcategories: ["gynaecology", "hormonal-health"],
    composition: "Cyproterone Acetate & Ethinylestradiol Tablets",
    dosageForm: "Tablets",
    packSize: "10 x 1 x 21 tablets",
    shortDescription: "A prescription combination tablet containing Cyproterone Acetate and Ethinylestradiol.",
    image: "luna-35.webp",
    imageWidth: 1400,
    imageHeight: 1050,
    imageAlt: "Luna 35 carton — Cyproterone Acetate and Ethinylestradiol Tablets",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "proluvia-aq",
    name: "Proluvia-AQ 50 mg",
    category: "womens-health",
    subcategories: ["fertility", "hormonal-health"],
    composition: "Aqueous Solution of Progesterone Injection 50 mg",
    dosageForm: "Injection (IM / subcutaneous)",
    packSize: "5 x 2 ml",
    shortDescription: "A prescription aqueous solution of Progesterone for injection, 50 mg, presented in five 2 ml units.",
    image: "proluvia-aq.webp",
    imageWidth: 1200,
    imageHeight: 900,
    imageCaption: ZAF_MARK_CAPTION,
    imageAlt: "Proluvia-AQ 50 mg carton — aqueous solution of Progesterone injection, 5 x 2 ml, bearing the Zafieon Pharma mark",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "let-bloom",
    name: "Let Bloom",
    category: "womens-health",
    subcategories: ["fertility"],
    composition: "Letrozole Tablets 5 mg",
    dosageForm: "Tablets",
    packSize: "10 x 1 x 5 tablets",
    shortDescription: "A prescription tablet containing Letrozole 5 mg.",
    image: "let-bloom.webp",
    imageWidth: 1400,
    imageHeight: 1050,
    imageAlt: "Let Bloom carton — Letrozole Tablets 5 mg",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "mifiprine",
    name: "Mifiprine",
    category: "womens-health",
    subcategories: ["reproductive-health", "hormonal-health"],
    composition: "Mifepristone Tablets IP 200 mg",
    dosageForm: "Tablets",
    packSize: "10 x 1 x 1 tablets",
    shortDescription: "A prescription tablet containing Mifepristone 200 mg.",
    image: "mifiprine.webp",
    imageWidth: 1400,
    imageHeight: 1050,
    imageAlt: "Mifiprine carton — Mifepristone Tablets IP 200 mg",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
  {
    slug: "miso-pro",
    name: "MISO-PRO",
    category: "womens-health",
    subcategories: ["reproductive-health", "gynaecology"],
    composition: "Misoprostol Tablets IP 200 mcg",
    dosageForm: "Tablets",
    packSize: "5 x 4 tablets",
    shortDescription: "A prescription tablet containing Misoprostol 200 mcg.",
    image: "miso-pro.webp",
    imageWidth: 1400,
    imageHeight: 1050,
    imageAlt: "MISO-PRO carton — Misoprostol Tablets IP 200 mcg",
    prescriptionOnly: true,
    reviewNote: ZAF_NOTE,
  },
];

export const seedProducts: Product[] = [
  ...womensHealth.map((e, i) => record(e, i + 1)),
  ...sharedRange.map((e, i) => record(e, 20 + i)),
  ...generalMedicine.map((e, i) => record(e, i + 1)),
];
