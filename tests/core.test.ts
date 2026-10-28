import { test } from "node:test";
import assert from "node:assert/strict";
import { search, type SearchDoc } from "../src/lib/search-core.ts";
import { parseMarkdown, safeHref } from "../src/lib/markdown.ts";
import { whatsappUrl } from "../src/lib/whatsapp.ts";
import { slugify } from "../src/lib/text.ts";
import { hashPassword, mintToken, verifyPassword, verifyToken } from "../src/lib/auth/token.ts";
import { settingsSchema } from "../src/lib/content/schemas.ts";
import { RateLimiter } from "../src/lib/rate-limit.ts";

const docs: SearchDoc[] = [
  { id: "p1", type: "product", title: "D-VITS 60K", url: "/products/d-vits-60k", label: "Women’s Health", text: "Vitamin D3 Oral Solution 60,000 IU" },
  { id: "p2", type: "product", title: "Sample General Medicine Product 1", url: "/products/x", label: "General Medicine", text: "Placeholder" },
  { id: "a1", type: "insight", title: "Understanding vitamin D", url: "/insights/d", text: "An article" },
];

test("search: case-insensitive partial matching", () => {
  assert.equal(search(docs, "d-vits")[0].id, "p1");
  assert.equal(search(docs, "VIT")[0].id, "p1");
  assert.equal(search(docs, "women")[0].id, "p1");
});

test("search: a name typed without its hyphen still matches", () => {
  assert.equal(search(docs, "dvits")[0]?.id, "p1");
});

test("search: every word must match, and no match returns nothing", () => {
  assert.deepEqual(search(docs, "vitamin general").map((h) => h.id), []);
  assert.equal(search(docs, "zzzz").length, 0);
  assert.equal(search(docs, " ").length, 0);
});

test("markdown: unsafe link schemes are rendered as text", () => {
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,x"), null);
  assert.equal(safeHref("//evil.example"), null);
  assert.equal(safeHref("https://example.com/a"), "https://example.com/a");
  assert.equal(safeHref("/products"), "/products");
  const [p] = parseMarkdown("[click](javascript:alert(1)) <script>x</script>");
  assert.equal(p.t, "p");
  assert.ok(JSON.stringify(p).includes("<script>"), "HTML stays as plain text, never markup");
  assert.ok(!JSON.stringify(p).includes('"link"'));
});

test("markdown: headings, lists and quotes parse", () => {
  const b = parseMarkdown("## Title\n\n- a\n- b\n\n1. one\n\n> quote");
  assert.deepEqual(b.map((x) => x.t), ["h2", "ul", "ol", "quote"]);
});

test("whatsapp: properly encoded click-to-chat URL, invalid numbers refused", () => {
  assert.equal(whatsappUrl("+91 81484 94549", "Hi & hello"), "https://wa.me/918148494549?text=Hi%20%26%20hello");
  assert.equal(whatsappUrl("08148494549"), null);
  assert.equal(whatsappUrl("123"), null);
});

test("slugify", () => {
  assert.equal(slugify("D-VITS 60K"), "d-vits-60k");
  assert.equal(slugify("Women’s Health & Care!"), "women-s-health-and-care");
});

test("auth: scrypt hash and signed session token", () => {
  const h = hashPassword("correct horse battery");
  assert.ok(verifyPassword("correct horse battery", h));
  assert.ok(!verifyPassword("wrong", h));
  const secret = "s".repeat(40);
  const t = mintToken("admin@genesis.test", secret, 60);
  assert.equal(verifyToken(t, secret)?.email, "admin@genesis.test");
  assert.equal(verifyToken(t, "x".repeat(40)), null, "wrong secret");
  assert.equal(verifyToken(t.slice(0, -2) + "AA", secret), null, "tampered");
  assert.equal(verifyToken(t, secret, Date.now() + 61_000), null, "expired");
});

test("rate limiter blocks after the limit", () => {
  const rl = new RateLimiter(2, 1000);
  assert.ok(rl.take("k", 0).ok);
  assert.ok(rl.take("k", 1).ok);
  assert.ok(!rl.take("k", 2).ok);
  assert.ok(rl.take("k", 1001).ok);
});

test("settings: the supplied GST number is accepted exactly as given", () => {
  const gst = settingsSchema.shape.contact.shape.gstin.safeParse({ value: "33TPUP56465D1ZV", confirmed: true });
  assert.ok(gst.success);
  assert.equal(gst.data!.value, "33TPUP56465D1ZV");
  assert.ok(!settingsSchema.shape.contact.shape.gstin.safeParse({ value: "33TPUP56465D1Z", confirmed: true }).success);
});
