import "server-only";
import { ConflictError, driver } from "@/lib/store/driver";
import { seedInsights, seedNotices, seedPartners, seedProducts, seedSettings } from "@/content/seed";
import type { Insight, Notice, Partner, Product, Settings } from "./types";

/**
 * Read and write access to the stored content documents.
 *
 * Each collection is one JSON document ({ version, items }). Until an
 * administrator first saves a collection, reads fall back to src/content/seed.
 * This module never caches — the dashboard always reads the live document.
 * Public pages read through src/lib/content/public.ts, which does.
 */

export type CollectionMap = {
  products: Product;
  insights: Insight;
  notices: Notice;
  partners: Partner;
};
export type CollectionName = keyof CollectionMap;

export const COLLECTIONS: CollectionName[] = ["products", "insights", "notices", "partners"];

const KEY: Record<CollectionName | "settings", string> = {
  products: "content/products.json",
  insights: "content/insights.json",
  notices: "content/notices.json",
  partners: "content/partners.json",
  settings: "content/settings.json",
};

const SEED: { [K in CollectionName]: CollectionMap[K][] } = {
  products: seedProducts,
  insights: seedInsights,
  notices: seedNotices,
  partners: seedPartners,
};

type CollectionDoc<T> = { version: 1; items: T[]; updatedAt: string };
type SettingsDoc = { version: 1; settings: Settings };

function parse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/* ── Collections ──────────────────────────────────────────────────────── */

export async function readCollection<K extends CollectionName>(
  name: K,
): Promise<{ items: CollectionMap[K][]; etag: string | null; seeded: boolean }> {
  const doc = await driver().readDoc(KEY[name]);
  if (!doc) return { items: structuredClone(SEED[name]), etag: null, seeded: true };
  const parsed = parse<CollectionDoc<CollectionMap[K]>>(doc.text);
  if (!parsed || !Array.isArray(parsed.items)) {
    // A corrupt document must never be silently replaced by the seed: that
    // would look like data loss on the next save. Fail loudly instead.
    throw new Error(`Stored ${name} document is unreadable`);
  }
  return { items: parsed.items.map((it) => upgrade(name, it)), etag: doc.etag, seeded: false };
}

/** Fill fields added after a record was stored, so older documents keep working. */
function upgrade<K extends CollectionName>(name: K, item: CollectionMap[K]): CollectionMap[K] {
  if (name === "partners") {
    const p = item as unknown as Record<string, unknown>;
    const defaults = {
      slug: String(p.id ?? "").replace(/^partner-/, ""),
      fullName: "",
      tagline: "",
      region: "",
      capabilities: [],
      certifications: [],
      sites: [],
      exportMarkets: [],
      productRanges: [],
      registrations: [],
      notes: [],
      sourceNote: "",
    };
    return { ...defaults, ...item };
  }
  if (name !== "products") return item;
  return { subcategories: [], composition: "", dosageForm: "", packSize: "", imageCaption: "", ...item };
}

/** In-process queue so read-modify-write cycles never interleave here. */
let chain: Promise<unknown> = Promise.resolve();
function serialise<T>(work: () => Promise<T>): Promise<T> {
  const run = chain.then(work, work);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Apply `change` to a collection and persist it. Retries when another writer
 * (another instance, another tab) saved in between — each retry re-reads, so
 * the change is applied on top of theirs rather than overwriting it.
 */
export function mutateCollection<K extends CollectionName, R>(
  name: K,
  change: (items: CollectionMap[K][]) => { items: CollectionMap[K][]; result: R },
): Promise<R> {
  return serialise(async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { items, etag } = await readCollection(name);
      const { items: next, result } = change(items);
      const doc: CollectionDoc<CollectionMap[K]> = {
        version: 1,
        items: next,
        updatedAt: new Date().toISOString(),
      };
      try {
        await driver().writeDoc(KEY[name], JSON.stringify(doc, null, 2), etag);
        return result;
      } catch (e) {
        if (e instanceof ConflictError && attempt < 3) continue;
        throw e;
      }
    }
    throw new Error("Could not save after repeated conflicts");
  });
}

/* ── Settings ─────────────────────────────────────────────────────────── */

/** Stored values over seed defaults, so fields added later get defaults. */
function mergeDeep<T>(base: T, over: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (base && typeof base === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    if (over && typeof over === "object" && !Array.isArray(over)) {
      for (const [k, v] of Object.entries(over)) {
        out[k] = k in out ? mergeDeep(out[k], v) : v;
      }
    }
    return out as T;
  }
  return (over === undefined || over === null ? base : over) as T;
}

export async function readSettings(): Promise<{ settings: Settings; etag: string | null; seeded: boolean }> {
  const doc = await driver().readDoc(KEY.settings);
  if (!doc) return { settings: structuredClone(seedSettings), etag: null, seeded: true };
  const parsed = parse<SettingsDoc>(doc.text);
  if (!parsed?.settings) throw new Error("Stored settings document is unreadable");
  return { settings: mergeDeep(seedSettings, parsed.settings), etag: doc.etag, seeded: false };
}

export function writeSettings(change: (s: Settings) => Settings): Promise<Settings> {
  return serialise(async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { settings, etag } = await readSettings();
      const next = { ...change(settings), updatedAt: new Date().toISOString() };
      try {
        await driver().writeDoc(KEY.settings, JSON.stringify({ version: 1, settings: next }, null, 2), etag);
        return next;
      } catch (e) {
        if (e instanceof ConflictError && attempt < 3) continue;
        throw e;
      }
    }
    throw new Error("Could not save settings after repeated conflicts");
  });
}

export const storageDriverName = () => driver().name;
