import { test } from "node:test";
import assert from "node:assert/strict";
import { can } from "../src/lib/auth/roles.ts";
import { publishState } from "../src/lib/content/publish.ts";
import { productEnquiryMessage, whatsappUrl } from "../src/lib/whatsapp.ts";
import { partnerSchema } from "../src/lib/content/schemas.ts";
import { seedPartners } from "../src/content/partners.ts";
import { hasProfile } from "../src/lib/content/partners.ts";

test("editors reach notices, insights and uploads only; admins reach everything", () => {
  for (const area of ["notices", "insights", "media"]) assert.equal(can("editor", area), true, area);
  for (const area of ["products", "partners", "settings", "enquiries", "export", "anything-else"]) assert.equal(can("editor", area), false, area);
  for (const area of ["notices", "products", "settings", "export"]) assert.equal(can("admin", area), true, area);
});

test("publish state: draft, scheduled and live", () => {
  const now = Date.parse("2026-10-25T12:00:00Z");
  assert.equal(publishState("draft", "2026-01-01T00:00:00Z", now), "draft");
  assert.equal(publishState("draft", "2027-01-01T00:00:00Z", now), "draft");
  assert.equal(publishState("published", "2026-10-25T11:59:59Z", now), "live");
  assert.equal(publishState("published", "2026-10-26T00:00:00Z", now), "scheduled");
  assert.equal(publishState("published", "not a date", now), "live");
});

test("WhatsApp links use 918148494549 and the agreed messages", () => {
  const general = whatsappUrl(
    "918148494549",
    "Hello Genesis Life Sciences, I would like to enquire about your pharmaceutical products and services. Please share more details.",
  );
  assert.ok(general?.startsWith("https://wa.me/918148494549?text="));
  assert.equal(
    productEnquiryMessage("D-VITS 60K"),
    "Hello Genesis Life Sciences, I would like to enquire about D-VITS 60K. Please share more details.",
  );
  const product = whatsappUrl("918148494549", productEnquiryMessage("Femi-Dros 30"));
  assert.equal(decodeURIComponent(new URL(product!).searchParams.get("text")!), productEnquiryMessage("Femi-Dros 30"));
});

test("seeded partners are valid, uniquely slugged and credit their source", () => {
  const slugs = new Set<string>();
  for (const p of seedPartners) {
    const r = partnerSchema.safeParse(p);
    assert.ok(r.success, `${p.name}: ${JSON.stringify(r.success ? "" : r.error.issues)}`);
    assert.ok(!slugs.has(p.slug), `duplicate slug ${p.slug}`);
    slugs.add(p.slug);
    // Any partner with profile details must say where they come from.
    if (hasProfile(p) || p.certifications.length) assert.ok(p.sourceNote.length > 0, `${p.name} has no source note`);
  }
});

test("published partner logos exist and no unverified website is linked", async () => {
  const { existsSync } = await import("node:fs");
  for (const p of seedPartners) {
    if (p.logo) assert.ok(existsSync(`public${p.logo.url}`), `${p.name}: missing ${p.logo.url}`);
  }
  // www.bionexy.in did not resolve when checked (25 Oct 2026); it must not be linked.
  assert.ok(seedPartners.every((p) => !p.website.includes("bionexy.in")));
});

test("the six partners Genesis named on 26 Oct 2026 are published with their own logos", () => {
  const want = ["ravenbhel-healthcare", "philanto-wellness", "eurocrit-labs", "janus-biotech-india", "heliyac-healthcare", "amagen-pharma"];
  for (const slug of want) {
    const p = seedPartners.find((x) => x.slug === slug);
    assert.ok(p, `${slug} missing`);
    assert.ok(p.published && p.logo, `${slug} not published with a logo`);
    assert.ok(p.description.length > 0 && p.sourceNote.length > 0, `${slug} lacks a credited profile`);
  }
});

test("partner text never carries the reference project's own wording", () => {
  const publicText = (p: (typeof seedPartners)[number]) =>
    [p.name, p.fullName, p.tagline, p.description, p.sourceNote, ...p.capabilities, ...p.notes, ...p.productRanges, ...p.registrations].join(" ");
  for (const p of seedPartners) assert.ok(!/zafieon/i.test(publicText(p)), `${p.name} mentions Zafieon`);
});

test("certification marks: every image exists, and marks come only from a partner's own claims", async () => {
  const { existsSync } = await import("node:fs");
  const { CERTIFICATION_MARKS, REGULATOR_MARKS, resolve, markForRegistration, marksAcross } = await import("../src/lib/content/certifications.ts");
  for (const m of [...CERTIFICATION_MARKS, ...REGULATOR_MARKS]) if (m.logo) assert.ok(existsSync(`public${m.logo}`), `missing ${m.logo}`);
  assert.deepEqual(resolve(["ISO 9001:2015", "GMP", "WHO", "PIC/S Approved"]).map((m) => m.id), ["who", "gmp", "iso", "pics"]);
  assert.deepEqual(resolve(["WHO-GMP", "GLP", "ISO 9001:2015"]).map((m) => m.id), ["who", "gmp", "glp", "iso"]);
  assert.deepEqual(resolve([]), []);
  // PIC/S has no supplied artwork and must never get an invented emblem.
  assert.equal(CERTIFICATION_MARKS.find((m) => m.id === "pics")?.logo, undefined);
  // Ravenbhel's six registrations each map to that regulator's own emblem.
  const raven = seedPartners.find((p) => p.slug === "ravenbhel-healthcare")!;
  assert.equal(raven.registrations.filter((r) => markForRegistration(r)).length, 6);
  // Network counts are derived from claims: every mark shown is held by at least one partner.
  for (const { mark, count } of marksAcross(seedPartners)) {
    assert.ok(count > 0 && seedPartners.some((p) => resolve(p.certifications).some((m) => m.id === mark.id)));
  }
  assert.equal(marksAcross([{ certifications: [] }]).length, 0);
});

test("next.config allows every public image folder the site renders", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const config = readFileSync("next.config.ts", "utf8");
  for (const dir of readdirSync("public", { withFileTypes: true }).filter((d) => d.isDirectory())) {
    assert.ok(config.includes(`pathname: "/${dir.name}/**"`), `public/${dir.name} is not in images.localPatterns — next/image would refuse it`);
  }
});

test("enquiry message never doubles the full stop after names ending in one", () => {
  assert.equal(
    productEnquiryMessage("manufacturing with Ravenbhel Healthcare Pvt. Ltd."),
    "Hello Genesis Life Sciences, I would like to enquire about manufacturing with Ravenbhel Healthcare Pvt. Ltd. Please share more details.",
  );
});
