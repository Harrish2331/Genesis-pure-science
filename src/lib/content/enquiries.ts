import "server-only";
import { driver } from "@/lib/store/driver";
import type { Enquiry } from "./types";

/**
 * Enquiries are stored one document per submission. Appending to a single
 * shared document would let two simultaneous submissions on different server
 * instances overwrite each other; separate documents cannot collide.
 *
 * The id encodes the storage location (yyyymm-timestamp-random), so the
 * dashboard can act on an enquiry without a lookup table.
 */

const ID = /^(\d{6})-(\d{8}T\d{9}Z)-([a-f0-9]{8})$/;

function keyFor(id: string): string {
  const m = ID.exec(id);
  if (!m) throw new Error("Invalid enquiry id");
  return `enquiries/${m[1]}/${id}.json`;
}

export const isEnquiryId = (id: string) => ID.test(id);

export async function listEnquiries(limit = 200): Promise<{ items: Enquiry[]; total: number }> {
  const keys = (await driver().list("enquiries/")).filter((k) => k.endsWith(".json"));
  // Ids sort chronologically, so the newest are last.
  keys.sort().reverse();
  const slice = keys.slice(0, limit);
  const docs = await Promise.all(slice.map((k) => driver().readDoc(k)));
  const items: Enquiry[] = [];
  for (const d of docs) {
    if (!d) continue;
    try {
      items.push(JSON.parse(d.text) as Enquiry);
    } catch {
      // Skip an unreadable record rather than failing the whole inbox.
    }
  }
  return { items, total: keys.length };
}

export async function updateEnquiryStatus(id: string, status: Enquiry["status"]): Promise<boolean> {
  const key = keyFor(id);
  for (let attempt = 0; attempt < 3; attempt++) {
    const doc = await driver().readDoc(key);
    if (!doc) return false;
    const record = JSON.parse(doc.text) as Enquiry;
    try {
      await driver().writeDoc(key, JSON.stringify({ ...record, status }, null, 2), doc.etag);
      return true;
    } catch {
      // conflict: re-read and retry
    }
  }
  return false;
}

export async function deleteEnquiry(id: string): Promise<void> {
  await driver().remove(keyFor(id));
}
