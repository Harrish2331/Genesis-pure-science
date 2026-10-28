import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { driver } from "@/lib/store/driver";
import { insightSchema, noticeSchema, partnerSchema, productSchema } from "./schemas";
import { COLLECTIONS, mutateCollection, readCollection, readSettings, type CollectionMap, type CollectionName } from "./repo";
import type { MediaRef } from "./types";

/**
 * Create / update / delete for the dashboard, shared by the API routes.
 * Validation happens here so no route can write an unvalidated record.
 */

export const SCHEMA = {
  products: productSchema,
  insights: insightSchema,
  notices: noticeSchema,
  partners: partnerSchema,
} as const;

export const isCollection = (v: string): v is CollectionName => (COLLECTIONS as string[]).includes(v);

export class OpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

type Input<K extends CollectionName> = z.infer<(typeof SCHEMA)[K]>;

function assertUniqueSlug<K extends CollectionName>(name: K, items: CollectionMap[K][], slug: string | undefined, selfId?: string) {
  if (!slug) return;
  if (items.some((it) => "slug" in it && it.slug === slug && it.id !== selfId)) {
    throw new OpError("That URL slug is already in use.", 409, { slug: "Another record already uses this slug." });
  }
}

export async function createRecord<K extends CollectionName>(name: K, input: Input<K>): Promise<CollectionMap[K]> {
  const now = new Date().toISOString();
  return mutateCollection(name, (items) => {
    assertUniqueSlug(name, items, (input as { slug?: string }).slug);
    const record = { ...input, id: randomUUID(), createdAt: now, updatedAt: now } as unknown as CollectionMap[K];
    return { items: [...items, record], result: record };
  });
}

/**
 * Replace a record. `expectedUpdatedAt` is the version the editor loaded; if
 * someone saved the record since, the save is refused rather than silently
 * overwriting their work.
 */
export async function updateRecord<K extends CollectionName>(
  name: K,
  id: string,
  input: Input<K>,
  expectedUpdatedAt?: string,
): Promise<{ record: CollectionMap[K]; replacedMedia: string[] }> {
  return mutateCollection(name, (items) => {
    const i = items.findIndex((it) => it.id === id);
    if (i < 0) throw new OpError("That record no longer exists.", 404);
    const current = items[i];
    if (expectedUpdatedAt && current.updatedAt !== expectedUpdatedAt) {
      throw new OpError("This record was changed by someone else since you opened it. Reload to see their changes.", 409);
    }
    assertUniqueSlug(name, items, (input as { slug?: string }).slug, id);
    const record = { ...current, ...input, id, createdAt: current.createdAt, updatedAt: new Date().toISOString() } as CollectionMap[K];
    const before = mediaKeys(current);
    const after = new Set(mediaKeys(record));
    const next = [...items];
    next[i] = record;
    return { items: next, result: { record, replacedMedia: before.filter((k) => !after.has(k)) } };
  });
}

export async function deleteRecord<K extends CollectionName>(name: K, id: string): Promise<string[]> {
  return mutateCollection(name, (items) => {
    const found = items.find((it) => it.id === id);
    if (!found) throw new OpError("That record no longer exists.", 404);
    return { items: items.filter((it) => it.id !== id), result: mediaKeys(found) };
  });
}

/* ── Media housekeeping ───────────────────────────────────────────────── */

function mediaKeys(record: unknown): string[] {
  const out: string[] = [];
  const visit = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(visit);
    const o = v as Partial<MediaRef> & Record<string, unknown>;
    if (typeof o.key === "string" && o.key.startsWith("media/") && typeof o.url === "string") out.push(o.key);
    else Object.values(o).forEach(visit);
  };
  visit(record);
  return out;
}

/** Delete uploaded images no record or setting refers to any more. */
export async function collectUnusedMedia(candidates: string[]): Promise<void> {
  if (!candidates.length) return;
  const inUse = new Set<string>();
  for (const name of COLLECTIONS) {
    for (const item of (await readCollection(name)).items) mediaKeys(item).forEach((k) => inUse.add(k));
  }
  mediaKeys((await readSettings()).settings).forEach((k) => inUse.add(k));
  await Promise.all(candidates.filter((k) => !inUse.has(k)).map((k) => driver().remove(k)));
}
