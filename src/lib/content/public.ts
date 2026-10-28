import "server-only";
import { cache } from "react";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { readCollection, readSettings, type CollectionName } from "./repo";
import { PRODUCT_CATEGORIES, type Copy, type Fact, type Insight, type Notice, type Partner, type Product, type ProductCategory, type Settings } from "./types";

/**
 * What the public site is allowed to see.
 *
 * Reads go through Next's data cache (tagged per collection, five-minute
 * lifetime as a backstop for scheduled articles). Every administrative write
 * calls `invalidate()`, which expires the tag immediately, so a published
 * change is live on the next request rather than after the lifetime.
 */

export const TAG = {
  settings: "content:settings",
  products: "content:products",
  insights: "content:insights",
  notices: "content:notices",
  partners: "content:partners",
} as const;

/**
 * Bump when the shape of stored content changes, so the data cache (which on
 * Vercel survives redeploys) never hands new code an old-shaped object.
 */
const CACHE_VERSION = "v7";

const cachedCollection = <K extends CollectionName>(name: K) =>
  unstable_cache(async () => (await readCollection(name)).items, ["genesis", CACHE_VERSION, "collection", name], {
    tags: [TAG[name], "content"],
    revalidate: 300,
  });

const cached = {
  products: cachedCollection("products"),
  insights: cachedCollection("insights"),
  notices: cachedCollection("notices"),
  partners: cachedCollection("partners"),
  settings: unstable_cache(async () => (await readSettings()).settings, ["genesis", CACHE_VERSION, "settings"], {
    tags: [TAG.settings, "content"],
    revalidate: 300,
  }),
};

/** Expire cached content after a write. Call from route handlers only. */
export function invalidate(name: CollectionName | "settings") {
  revalidateTag(TAG[name], { expire: 0 });
  revalidatePath("/", "layout");
}

const isLive = (iso: string, now: number) => {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t <= now;
};

/* ── Settings ─────────────────────────────────────────────────────────── */

export const getSettings = cache(async (): Promise<Settings> => cached.settings());

/**
 * A fact Genesis has confirmed, or nothing. Unconfirmed values (for example
 * details read from artwork) never reach the public site; they are listed in
 * the dashboard's launch checklist until confirmed in Admin → Settings.
 */
export type ShownFact = { value: string } | null;
export function showFact(f: Fact | undefined): ShownFact {
  if (!f || !f.value.trim() || !f.confirmed) return null;
  return { value: f.value.trim() };
}

/** Site copy as plain text. Approval is tracked in the dashboard, not shown on the site. */
export type ShownCopy = { text: string };
export function showCopy(c: Copy): ShownCopy {
  return { text: c.text };
}

/* ── Products ─────────────────────────────────────────────────────────── */

/** Category order (Women's Health, General Medicine, Surgicals), then sort order, then name. */
const byOrder = (a: Product, b: Product) =>
  PRODUCT_CATEGORIES.indexOf(a.category) - PRODUCT_CATEGORIES.indexOf(b.category) ||
  a.sortOrder - b.sortOrder ||
  a.name.localeCompare(b.name);

export const getProducts = cache(async (): Promise<Product[]> =>
  (await cached.products())
    .filter((p) => p.status === "published" && !p.placeholder)
    .sort(byOrder),
);

export async function getProduct(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === category);
}

/* ── Insights ─────────────────────────────────────────────────────────── */

export const getInsights = cache(async (): Promise<Insight[]> => {
  const now = Date.now();
  return (await cached.insights())
    .filter((a) => a.status === "published" && isLive(a.publishedAt, now) && !a.placeholder)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

export async function getInsight(slug: string): Promise<Insight | null> {
  return (await getInsights()).find((a) => a.slug === slug) ?? null;
}

/* ── Notices ──────────────────────────────────────────────────────────── */

export const getNotices = cache(async (): Promise<Notice[]> => {
  const now = Date.now();
  return (await cached.notices())
    .filter((n) => n.status === "published" && isLive(n.publishedAt, now) && !n.placeholder)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt));
});

/* ── Partners ─────────────────────────────────────────────────────────── */

export const getPartners = cache(async (): Promise<Partner[]> =>
  (await cached.partners()).filter((p) => p.published).sort((a, b) => a.sortOrder - b.sortOrder),
);

export async function getPartner(slug: string): Promise<Partner | null> {
  return (await getPartners()).find((p) => p.slug === slug) ?? null;
}
