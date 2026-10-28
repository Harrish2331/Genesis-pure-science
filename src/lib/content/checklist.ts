import "server-only";
import { COLLECTIONS, readCollection, readSettings } from "./repo";
import type { Copy, Fact, Settings } from "./types";

/**
 * The launch checklist on the dashboard: every client input still missing or
 * unconfirmed, computed from the live content so it can never drift from
 * reality. Severity:
 *   required  — must be resolved before a production launch
 *   review    — drafted content awaiting approval
 *   optional  — improves the site; not a blocker
 */

export type CheckItem = {
  severity: "required" | "review" | "optional";
  area: string;
  label: string;
  href: string;
};

const missing = (f: Fact) => !f.value.trim();
const unconfirmed = (f: Fact) => Boolean(f.value.trim()) && !f.confirmed;

const COPY_LABELS: Partial<Record<keyof Settings["copy"], string>> = {
  heroEyebrow: "Hero eyebrow",
  heroHeadline: "Hero headline",
  heroIntro: "Hero introduction",
  footerIntro: "Footer introduction",
  aboutIntro: "About introduction",
  whoWeAre: "Who we are",
  vision: "Vision",
  mission: "Mission",
  qualityCommitment: "Commitment to quality",
  scienceFocus: "Scientific focus",
  womensHealth: "Women’s Health description",
  generalMedicine: "General Medicine description",
  surgicals: "Surgicals description",
  manufacturingIntro: "Manufacturing introduction",
  axonIntro: "Axon Surgicals introduction",
  contactIntro: "Contact introduction",
};

export async function launchChecklist(): Promise<CheckItem[]> {
  const { settings } = await readSettings();
  const items: CheckItem[] = [];
  const add = (severity: CheckItem["severity"], area: string, label: string, href: string) => items.push({ severity, area, label, href });
  const S = "/admin/settings";

  // Brand
  if (missing(settings.brand.tagline)) add("required", "Brand", "Official tagline has not been supplied", `${S}#brand`);
  else if (unconfirmed(settings.brand.tagline)) add("required", "Brand", "Tagline is not marked as confirmed", `${S}#brand`);
  if (missing(settings.brand.legalName)) add("optional", "Brand", "Registered legal name (e.g. “… Pvt. Ltd.”) not supplied", `${S}#brand`);

  // Copy
  for (const [key, label] of Object.entries(COPY_LABELS) as [keyof Settings["copy"], string][]) {
    const c: Copy = settings.copy[key];
    if (!c.approved) add("review", "Copy", `${label} — drafted wording awaiting approval`, `${S}#copy`);
  }
  if (!settings.values.approved) add("review", "Copy", "Core values — drafted wording awaiting approval", `${S}#values`);

  // Contact
  const ct = settings.contact;
  const fact = (f: Fact, label: string, severity: CheckItem["severity"] = "required") => {
    if (missing(f)) add(severity, "Contact", `${label} not supplied`, `${S}#contact`);
    else if (unconfirmed(f)) add(severity, "Contact", `${label} not marked as confirmed`, `${S}#contact`);
  };
  fact(ct.customerServicePhone, "Customer service telephone number");
  fact(ct.email, "Business email");
  fact(ct.whatsapp, "Official WhatsApp number");
  fact(ct.gstin, "GST number");
  fact(ct.hours, "Business hours", "optional");
  if (!ct.offices.length) add("required", "Contact", "No office address", `${S}#contact`);
  for (const o of ct.offices) {
    if (!o.confirmed) add("required", "Contact", `${o.label}: address not confirmed`, `${S}#contact`);
    if (!o.mapsUrl) add("optional", "Contact", `${o.label}: Google Maps link not supplied`, `${S}#contact`);
  }

  // Social
  if (Object.values(settings.social).every(missing)) add("optional", "Social", "No official social media profiles supplied", `${S}#social`);

  // Axon
  if (missing(settings.axon.relationship)) add("required", "Axon Surgicals", "Relationship between Genesis and Axon Surgicals not confirmed", `${S}#axon`);
  else if (unconfirmed(settings.axon.relationship)) add("required", "Axon Surgicals", "Relationship statement not marked as confirmed", `${S}#axon`);

  // Media
  if (!settings.intro.videoUrl) add("optional", "Media", "Company introduction video not supplied (animated introduction is shown)", `${S}#intro`);

  // Collections
  const [partners, ...rest] = await Promise.all([readCollection("partners"), ...COLLECTIONS.filter((c) => c !== "partners").map((c) => readCollection(c))]);
  for (const p of partners.items) {
    if (!p.nameConfirmed) add("required", "Partners", `${p.name}: official name/spelling not confirmed`, "/admin/partners");
    if (!p.logo) add("optional", "Partners", `${p.name}: official logo not uploaded`, "/admin/partners");
    if (!p.description) add("optional", "Partners", `${p.name}: verified description not added`, "/admin/partners");
  }
  const names = COLLECTIONS.filter((c) => c !== "partners");
  rest.forEach((r, i) => {
    const placeholders = r.items.filter((it) => "placeholder" in it && it.placeholder).length;
    if (placeholders) add("required", "Content", `${placeholders} development placeholder${placeholders === 1 ? "" : "s"} in ${names[i]} — replace or delete`, `/admin/${names[i]}`);
  });
  const products = rest[names.indexOf("products")].items as { placeholder: boolean; status: string }[];
  if (!products.some((p) => !p.placeholder && p.status === "published")) {
    add("required", "Content", "No approved products published yet", "/admin/products");
  }

  // Legal: the policy texts are drafted wording, held in code (src/content/legal.ts).
  add("required", "Legal", "Privacy Policy, Terms and Disclaimer are drafts — have Genesis's legal adviser review them", "/privacy-policy");

  // Deployment
  if (!process.env.NEXT_PUBLIC_SITE_URL) add("required", "Deployment", "NEXT_PUBLIC_SITE_URL (production domain) is not set", "/admin");
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN)
    add("required", "Deployment", "Running on Vercel without BLOB_READ_WRITE_TOKEN — content cannot be saved", "/admin");
  if (!process.env.GOOGLE_SITE_VERIFICATION) add("optional", "Deployment", "Google Search Console verification token not set", "/admin");

  return items;
}
