import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { seedProducts } from "../src/content/products.ts";
import { productSchema } from "../src/lib/content/schemas.ts";
import { SUBCATEGORY_IDS, SUBCATEGORY_PARENT } from "../src/lib/content/types.ts";

const published = seedProducts.filter((p) => p.status === "published");

test("catalogue: 31 published products (16 Genesis assets + 15 shared range)", () => {
  assert.equal(published.length, 31);
  assert.equal(published.filter((p) => p.category === "womens-health").length, 21);
  assert.equal(published.filter((p) => p.category === "general-medicine").length, 10);
});

test("catalogue: no duplicate ids, slugs or names", () => {
  for (const key of ["id", "slug", "name"] as const) {
    const values = seedProducts.map((p) => p[key].toLowerCase());
    assert.equal(new Set(values).size, values.length, `duplicate ${key}`);
  }
});

test("catalogue: every record passes the admin validation schema", () => {
  for (const p of seedProducts) {
    const r = productSchema.safeParse(p);
    assert.ok(r.success, `${p.slug}: ${r.success ? "" : JSON.stringify(r.error.issues)}`);
  }
});

test("catalogue: subcategories belong to the product's category", () => {
  for (const p of seedProducts) for (const s of p.subcategories) assert.equal(SUBCATEGORY_PARENT[s], p.category, `${p.slug} → ${s}`);
});

test("catalogue: every published product has an image file that exists", () => {
  for (const p of published) {
    assert.ok(p.image, `${p.slug} has no image`);
    assert.ok(existsSync(path.join("public", p.image!.url)), `${p.slug}: missing ${p.image!.url}`);
    assert.ok(p.imageAlt.length > 10, `${p.slug}: alt text`);
  }
});

test("catalogue: every published product is assigned a subcategory", () => {
  for (const p of published) assert.ok(p.subcategories.length > 0, p.slug);
});

test("catalogue: D-VITS 60K is in Women's Health", () => {
  const d = seedProducts.find((p) => p.slug === "d-vits-60k");
  assert.equal(d?.category, "womens-health");
  assert.equal(d?.status, "published");
});

test("catalogue: required women's health areas exist", () => {
  for (const id of ["gynaecology", "reproductive-health", "fertility", "womens-wellness", "hormonal-health"]) {
    assert.ok((SUBCATEGORY_IDS as string[]).includes(id), id);
  }
});

test("catalogue: cartons bearing the Zafieon mark say so in their caption and alt text", () => {
  for (const slug of ["femi-dros-30", "femi-dros-20", "proluvia-aq"]) {
    const p = published.find((x) => x.slug === slug)!;
    assert.match(p.imageCaption, /Zafieon/, slug);
    assert.match(p.imageAlt, /Zafieon/, slug);
  }
});
