/**
 * Content model for Genesis Pure Lifesciences.
 *
 * Everything an administrator can change lives in one of these shapes and is
 * persisted by the content store (src/lib/store). Components never hold
 * business content of their own — they render these records.
 *
 * Two flags carry the "do not invent facts" rule through the whole system:
 *
 *   placeholder   A development sample. Never rendered on a production
 *                 deployment, never in the sitemap, always visibly stamped in
 *                 review mode. It exists so layouts can be reviewed before the
 *                 client's real catalogue arrives.
 *
 *   confirmed /   On settings fields: whether Genesis has confirmed the value.
 *   approved      Unconfirmed facts (address, phone, GSTIN …) are shown only
 *                 in review mode. Unapproved copy is shown with a review
 *                 marker in review mode so it can be signed off.
 */

export type PublishStatus = "draft" | "published";

export type MediaRef = {
  /** URL the browser should load: a Blob CDN URL or /api/media/<key>. */
  url: string;
  /** Storage key, used to stream private/filesystem media. */
  key: string;
  width: number;
  height: number;
  contentType: string;
};

/* ── Products ─────────────────────────────────────────────────────────── */

export const PRODUCT_CATEGORIES = [
  "womens-health",
  "general-medicine",
  "surgicals",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Therapeutic subcategories and the category each belongs to. The women's
 * health set follows the Zafieon reference catalogue (Gynaecology,
 * Reproductive Health, Fertility, Hormonal Health, Women's Wellness), plus
 * Pregnancy & Maternal Care for Genesis's pregnancy-focused packs. Labels
 * and descriptions live in src/content/site.ts.
 */
export const SUBCATEGORY_PARENT = {
  gynaecology: "womens-health",
  "reproductive-health": "womens-health",
  fertility: "womens-health",
  "hormonal-health": "womens-health",
  "womens-wellness": "womens-health",
  "pregnancy-maternal-care": "womens-health",
  "vitamins-nutrition": "general-medicine",
  "gastrointestinal-care": "general-medicine",
  "pain-management": "general-medicine",
} as const satisfies Record<string, ProductCategory>;
export type SubcategoryId = keyof typeof SUBCATEGORY_PARENT;
export const SUBCATEGORY_IDS = Object.keys(SUBCATEGORY_PARENT) as SubcategoryId[];

export const AVAILABILITY = [
  "unspecified",
  "available",
  "coming-soon",
  "limited",
  "discontinued",
] as const;
export type Availability = (typeof AVAILABILITY)[number];

export type Specification = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  /** Therapeutic subcategories within `category` (a product may sit in several). */
  subcategories: SubcategoryId[];
  /** Composition exactly as printed on the pack. */
  composition: string;
  /** e.g. "Tablets", "Softgel capsules", "Injection (IM / IV)". */
  dosageForm: string;
  /** e.g. "1 x 10 tablets". Only when printed on the pack. */
  packSize: string;
  /** One or two sentences for cards and search results. */
  shortDescription: string;
  /** Longer description (safe Markdown subset). */
  description: string;
  image: MediaRef | null;
  imageAlt: string;
  /** Caption under the image; empty = "Pack shown for identification. Artwork may vary." */
  imageCaption: string;
  /** Composition, pack size, dosage form … exactly as supplied. */
  specifications: Specification[];
  /** Only when verified. Shown as "Manufactured by". */
  manufacturer: string;
  /** Only when verified. Shown as "Marketed by". */
  marketedBy: string;
  /** Optional brand line, e.g. "Axon Surgicals". */
  brand: string;
  availability: Availability;
  /** Prescription-only medicines sit behind a healthcare-professional notice
   *  and are kept out of search-engine indexes. */
  prescriptionOnly: boolean;
  featured: boolean;
  status: PublishStatus;
  placeholder: boolean;
  /** Internal note for reviewers. Never rendered publicly. */
  reviewNote: string;
  seoTitle: string;
  metaDescription: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/* ── Insights ─────────────────────────────────────────────────────────── */

export type Insight = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Safe Markdown subset. */
  body: string;
  coverImage: MediaRef | null;
  coverAlt: string;
  category: string;
  author: string;
  featured: boolean;
  status: PublishStatus;
  /** Publication date (ISO). A future date schedules the article. */
  publishedAt: string;
  seoTitle: string;
  metaDescription: string;
  placeholder: boolean;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
};

/* ── Notices ──────────────────────────────────────────────────────────── */

export const NOTICE_KINDS = [
  "announcement",
  "product-launch",
  "coming-soon",
  "update",
] as const;
export type NoticeKind = (typeof NOTICE_KINDS)[number];

export type Notice = {
  id: string;
  slug: string;
  title: string;
  kind: NoticeKind;
  summary: string;
  image: MediaRef | null;
  imageAlt: string;
  /** Optional link to a product (by slug). */
  productSlug: string;
  /** Optional link to an Insights article (by slug). */
  insightSlug: string;
  /** Optional external or internal link. */
  linkUrl: string;
  linkLabel: string;
  pinned: boolean;
  status: PublishStatus;
  publishedAt: string;
  placeholder: boolean;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
};

/* ── Manufacturing partners ───────────────────────────────────────────── */

export type PartnerSite = { name: string; location: string; role: string };

export type Partner = {
  id: string;
  /** URL segment for the partner's profile page (/manufacturing/<slug>). */
  slug: string;
  /** Name exactly as supplied by Genesis. */
  name: string;
  /** Registered/full name as printed in the partner's own profile, if known. */
  fullName: string;
  /** Whether Genesis has confirmed the spelling and identity. */
  nameConfirmed: boolean;
  /** Verified description only. Paragraphs separated by a blank line. */
  description: string;
  tagline: string;
  location: string;
  /** e.g. "Himachal Pradesh · Gujarat · Haryana". */
  region: string;
  /** Manufacturing capabilities / dosage forms, as stated by the partner. */
  capabilities: string[];
  /** Certification marks as stated by the partner (credited, not Genesis's). */
  certifications: string[];
  /** Documented manufacturing and support sites. */
  sites: PartnerSite[];
  exportMarkets: string[];
  /** Therapeutic / product ranges the partner states it manufactures. */
  productRanges: string[];
  /** Regulatory market registrations the partner states it holds. */
  registrations: string[];
  /** Qualifiers shown with the profile (conflicting figures, planned capacity, etc.). */
  notes: string[];
  /** Where the profile information comes from — shown on the page. */
  sourceNote: string;
  /** Official logo, uploaded only once supplied and verified. */
  logo: MediaRef | null;
  website: string;
  sortOrder: number;
  published: boolean;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
};

/* ── Enquiries ────────────────────────────────────────────────────────── */

export const ENQUIRY_TYPES = [
  "general",
  "product",
  "distribution",
  "partnership",
  "careers",
  "other",
] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  type: EnquiryType;
  product: string;
  message: string;
  status: "new" | "handled";
  /** Whether a notification email was delivered (null = not configured). */
  emailDelivered: boolean | null;
  createdAt: string;
};

/* ── Site settings ────────────────────────────────────────────────────── */

/** A fact about the company. Never invented; shown publicly only once confirmed. */
export type Fact = { value: string; confirmed: boolean };
/** Drafted copy. Rendered everywhere, flagged in review mode until approved. */
export type Copy = { text: string; approved: boolean };

export type Office = {
  id: string;
  label: string;
  lines: string[];
  mapsUrl: string;
  confirmed: boolean;
};

export type ValueItem = { title: string; text: string };

/** An enquiry route on the Contact page, e.g. "Sales & Business Development". */
export type Department = {
  id: string;
  label: string;
  emails: string[];
  confirmed: boolean;
};

export type Settings = {
  brand: {
    /** Name as it appears in the official logo. */
    name: string;
    legalName: Fact;
    /** Official tagline. Empty until Genesis supplies it. */
    tagline: Fact;
  };
  copy: {
    heroEyebrow: Copy;
    heroHeadline: Copy;
    heroIntro: Copy;
    footerIntro: Copy;
    aboutIntro: Copy;
    whoWeAre: Copy;
    vision: Copy;
    mission: Copy;
    qualityCommitment: Copy;
    scienceFocus: Copy;
    womensHealth: Copy;
    generalMedicine: Copy;
    surgicals: Copy;
    manufacturingIntro: Copy;
    axonIntro: Copy;
    contactIntro: Copy;
  };
  values: { items: ValueItem[]; approved: boolean };
  axon: {
    /** e.g. "a sister company of …" — only once Genesis confirms it. */
    relationship: Fact;
    website: Fact;
  };
  contact: {
    customerServicePhone: Fact;
    email: Fact;
    /** WhatsApp business number, international format, digits only. */
    whatsapp: Fact;
    whatsappMessage: string;
    gstin: Fact;
    hours: Fact;
    offices: Office[];
    /** Enquiry routes shown as separate cards on the Contact page. */
    departments: Department[];
  };
  social: {
    linkedin: Fact;
    instagram: Fact;
    facebook: Fact;
    x: Fact;
    youtube: Fact;
  };
  intro: {
    /** Company introduction video, once supplied (MP4 URL). */
    videoUrl: string;
    poster: MediaRef | null;
  };
  updatedAt: string;
};
