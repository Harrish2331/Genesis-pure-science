/**
 * Server-side validation for every administrative write.
 *
 * The API routes parse request bodies with these schemas and reject anything
 * that does not match — unknown keys are stripped, strings are trimmed and
 * length-limited, enums are closed, URLs are restricted to safe schemes and
 * media references must point at this site's own storage.
 */

import { z } from "zod";
import { safeHref } from "../markdown.ts";
import { SLUG_PATTERN } from "../text.ts";
import { normaliseWhatsAppNumber } from "../whatsapp.ts";
import {
  AVAILABILITY,
  NOTICE_KINDS,
  PRODUCT_CATEGORIES,
  SUBCATEGORY_IDS,
  SUBCATEGORY_PARENT,
} from "./types.ts";

const text = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer.`);
const required = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} character${min === 1 ? "" : "s"}.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "A URL slug is required.")
  .max(80, "Slugs must be 80 characters or fewer.")
  .regex(SLUG_PATTERN, "Use lower-case letters, numbers and single hyphens only.");

const optionalSlug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .refine((v) => v === "" || SLUG_PATTERN.test(v), "Not a valid slug.");

/** Accepts "YYYY-MM-DD" or a full ISO timestamp; stores ISO. */
export const dateSchema = z
  .string()
  .trim()
  .refine((v) => /^\d{4}-\d{2}-\d{2}/.test(v) && !Number.isNaN(new Date(v).getTime()), "Enter a valid date.")
  .transform((v) => new Date(v.length === 10 ? `${v}T00:00:00.000Z` : v).toISOString());

// Uploaded media, a Blob CDN URL, or an image shipped with the site in public/products.
const MEDIA_URL = /^(\/api\/media\/media\/[\w./-]+|\/(products|partners|images)\/[\w./-]+\.(webp|png|jpe?g|avif)|https:\/\/[a-z0-9-]+\.(public\.)?blob\.vercel-storage\.com\/[\w./%-]+)$/i;

export const mediaSchema = z
  .object({
    url: z.string().trim().max(600).regex(MEDIA_URL, "Images must be uploaded through the dashboard."),
    key: z.string().trim().max(300).regex(/^(media|static)\/[\w./-]+$/, "Invalid media key."),
    width: z.number().int().min(1).max(20000),
    height: z.number().int().min(1).max(20000),
    contentType: z.enum(["image/webp", "image/jpeg", "image/png", "image/avif"]),
  })
  .nullable();

const safeLink = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || safeHref(v) !== null, "Use an https://, mailto:, tel: or site-relative link.");

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Use a full https:// address.");

const status = z.enum(["draft", "published"]);

/* ── Products ─────────────────────────────────────────────────────────── */

export const productSchema = z
  .object({
    name: required(2, 120, "Product name"),
    slug: slugSchema,
    category: z.enum(PRODUCT_CATEGORIES),
    subcategories: z.array(z.enum(SUBCATEGORY_IDS)).max(6),
    composition: text(1000),
    dosageForm: text(80),
    packSize: text(80),
    shortDescription: text(300),
    description: text(8000),
    image: mediaSchema,
    imageAlt: text(200),
    imageCaption: text(160),
    specifications: z
      .array(z.object({ label: required(1, 60, "Specification label"), value: required(1, 300, "Specification value") }))
      .max(20),
    manufacturer: text(120),
    marketedBy: text(120),
    brand: text(80),
    availability: z.enum(AVAILABILITY),
    prescriptionOnly: z.boolean(),
    featured: z.boolean(),
    status,
    placeholder: z.boolean(),
    reviewNote: text(1000),
    seoTitle: text(70),
    metaDescription: text(170),
    sortOrder: z.number().int().min(-9999).max(9999),
  })
  .superRefine((p, ctx) => {
    for (const s of p.subcategories) {
      if (SUBCATEGORY_PARENT[s] !== p.category)
        ctx.addIssue({ code: "custom", path: ["subcategories"], message: "A subcategory does not belong to the chosen category." });
    }
    if (p.image && !p.imageAlt)
      ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe the image for screen-reader users." });
    if (p.status === "published" && !p.shortDescription)
      ctx.addIssue({ code: "custom", path: ["shortDescription"], message: "A short description is required before publishing." });
  });

/* ── Insights ─────────────────────────────────────────────────────────── */

export const insightSchema = z
  .object({
    title: required(3, 160, "Title"),
    slug: slugSchema,
    excerpt: text(320),
    body: text(50000),
    coverImage: mediaSchema,
    coverAlt: text(200),
    category: text(60),
    author: text(80),
    featured: z.boolean(),
    status,
    publishedAt: dateSchema,
    seoTitle: text(70),
    metaDescription: text(170),
    placeholder: z.boolean(),
    reviewNote: text(1000),
  })
  .superRefine((a, ctx) => {
    if (a.coverImage && !a.coverAlt)
      ctx.addIssue({ code: "custom", path: ["coverAlt"], message: "Describe the cover image for screen-reader users." });
    if (a.status === "published") {
      if (!a.excerpt) ctx.addIssue({ code: "custom", path: ["excerpt"], message: "An excerpt is required before publishing." });
      if (a.body.length < 20) ctx.addIssue({ code: "custom", path: ["body"], message: "The article body is too short to publish." });
    }
  });

/* ── Notices ──────────────────────────────────────────────────────────── */

export const noticeSchema = z
  .object({
    title: required(3, 160, "Title"),
    slug: slugSchema,
    kind: z.enum(NOTICE_KINDS),
    summary: required(1, 2000, "Notice text"),
    image: mediaSchema,
    imageAlt: text(200),
    productSlug: optionalSlug,
    insightSlug: optionalSlug,
    linkUrl: safeLink,
    linkLabel: text(60),
    pinned: z.boolean(),
    status,
    publishedAt: dateSchema,
    placeholder: z.boolean(),
    reviewNote: text(1000),
  })
  .superRefine((n, ctx) => {
    if (n.image && !n.imageAlt)
      ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe the image for screen-reader users." });
    if (n.linkUrl && !n.linkLabel)
      ctx.addIssue({ code: "custom", path: ["linkLabel"], message: "Give the link a label." });
  });

/* ── Partners ─────────────────────────────────────────────────────────── */

const list = (max: number, itemMax: number) => z.array(z.string().trim().min(1).max(itemMax)).max(max);

export const partnerSchema = z.object({
  slug: slugSchema,
  name: required(1, 120, "Partner name"),
  fullName: text(160),
  nameConfirmed: z.boolean(),
  description: text(3000),
  tagline: text(200),
  location: text(120),
  region: text(160),
  capabilities: list(30, 80),
  certifications: list(20, 60),
  sites: z.array(z.object({ name: required(1, 120, "Site name"), location: text(160), role: text(60) })).max(30),
  exportMarkets: list(80, 60),
  productRanges: list(30, 80),
  registrations: list(30, 160),
  notes: list(10, 600),
  sourceNote: text(500),
  logo: mediaSchema,
  website: httpsUrl,
  sortOrder: z.number().int().min(-9999).max(9999),
  published: z.boolean(),
  reviewNote: text(1000),
});

/* ── Settings ─────────────────────────────────────────────────────────── */

const fact = (max: number) => z.object({ value: text(max), confirmed: z.boolean() });
const copy = (max: number) => z.object({ text: text(max), approved: z.boolean() });

const urlFact = z.object({ value: httpsUrl, confirmed: z.boolean() });

export const settingsSchema = z.object({
  brand: z.object({
    name: required(2, 80, "Company name"),
    legalName: fact(160),
    tagline: fact(120),
  }),
  copy: z.object({
    heroEyebrow: copy(80),
    heroHeadline: copy(140),
    heroIntro: copy(500),
    footerIntro: copy(400),
    aboutIntro: copy(600),
    whoWeAre: copy(2000),
    vision: copy(800),
    mission: copy(800),
    qualityCommitment: copy(2000),
    scienceFocus: copy(1500),
    womensHealth: copy(800),
    generalMedicine: copy(800),
    surgicals: copy(800),
    manufacturingIntro: copy(1500),
    axonIntro: copy(1500),
    contactIntro: copy(600),
  }),
  values: z.object({
    items: z.array(z.object({ title: required(1, 60, "Value title"), text: text(300) })).max(8),
    approved: z.boolean(),
  }),
  axon: z.object({
    relationship: fact(300),
    website: urlFact,
  }),
  contact: z.object({
    customerServicePhone: z.object({
      value: text(30).refine((v) => v === "" || /^\+?[\d\s\-()]{7,30}$/.test(v), "Enter a valid telephone number."),
      confirmed: z.boolean(),
    }),
    email: z.object({
      value: text(200).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v), "Enter a valid email address."),
      confirmed: z.boolean(),
    }),
    whatsapp: z.object({
      value: text(20).refine((v) => v === "" || normaliseWhatsAppNumber(v) !== null, "Use the international format with country code, e.g. 919876543210."),
      confirmed: z.boolean(),
    }),
    whatsappMessage: text(300),
    gstin: z.object({
      value: text(15)
        .toUpperCase()
        // Stored exactly as supplied: 15 letters/digits. The standard GSTIN
        // pattern is not enforced so a number Genesis supplies is never
        // rejected or altered — verify it against the GST certificate.
        .refine((v) => v === "" || /^[0-9A-Z]{15}$/.test(v), "A GSTIN has exactly 15 letters and digits."),
      confirmed: z.boolean(),
    }),
    hours: fact(160),
    offices: z
      .array(
        z.object({
          id: required(1, 40, "Office id"),
          label: required(1, 60, "Office label"),
          lines: z.array(text(160)).max(8),
          mapsUrl: httpsUrl,
          confirmed: z.boolean(),
        }),
      )
      .max(6),
    departments: z
      .array(
        z.object({
          id: required(1, 40, "Department id"),
          label: required(1, 60, "Department name"),
          emails: z
            .array(z.string().trim().max(200).regex(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, "Enter a valid email address."))
            .max(5),
          confirmed: z.boolean(),
        }),
      )
      .max(8),
  }),
  social: z.object({
    linkedin: urlFact,
    instagram: urlFact,
    facebook: urlFact,
    x: urlFact,
    youtube: urlFact,
  }),
  intro: z.object({
    videoUrl: httpsUrl.refine((v) => v === "" || /\.(mp4|webm)(\?.*)?$/i.test(v), "Link directly to an .mp4 or .webm file."),
    poster: mediaSchema,
  }),
});

export const enquiryStatusSchema = z.object({ status: z.enum(["new", "handled"]) });

/** Flatten a ZodError into { "path.to.field": "message" } for the forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
