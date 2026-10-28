/**
 * Site search over published content.
 *
 * Pure and synchronous so it can be unit-tested directly. The index is built
 * from whatever the content store currently publishes (see src/lib/search.ts),
 * so a product or article only becomes findable once it is visible on the
 * site.
 *
 * Matching rules:
 *   · case- and accent-insensitive;
 *   · partial: "gyn" matches "Gynaecology", "lifesci" matches "Lifesciences";
 *   · every word of the query must appear somewhere in the document (AND), so
 *     adding words narrows results instead of widening them;
 *   · title matches outrank category matches, which outrank body matches.
 */

import { normalise } from "./text.ts";

export type SearchType = "product" | "insight" | "notice" | "page";

export type SearchDoc = {
  id: string;
  type: SearchType;
  title: string;
  url: string;
  /** Category or section label shown with the result. */
  label?: string;
  keywords?: string[];
  text: string;
  date?: string;
};

export type SearchHit = Omit<SearchDoc, "text" | "keywords"> & {
  snippet: string;
  score: number;
};

export const MAX_QUERY_LENGTH = 80;

export function tokenize(query: string): string[] {
  return normalise(query.slice(0, MAX_QUERY_LENGTH))
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .slice(0, 8);
}

const TYPE_BOOST: Record<SearchType, number> = {
  product: 6,
  page: 4,
  insight: 2,
  notice: 1,
};

function wordStart(hay: string, needle: string): boolean {
  let from = 0;
  for (;;) {
    const at = hay.indexOf(needle, from);
    if (at < 0) return false;
    if (at === 0 || /[\s\-–—/(.,]/.test(hay[at - 1])) return true;
    from = at + 1;
  }
}

function snippetFor(text: string, tokens: string[], radius = 90): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (!plain) return "";
  const low = normalise(plain);
  let at = -1;
  for (const t of tokens) {
    const i = low.indexOf(t);
    if (i >= 0 && (at < 0 || i < at)) at = i;
  }
  if (at < 0 || plain.length <= radius * 2) {
    return plain.length > radius * 2 ? `${plain.slice(0, radius * 2).trimEnd()}…` : plain;
  }
  const start = Math.max(0, at - radius);
  const end = Math.min(plain.length, at + radius);
  return `${start > 0 ? "…" : ""}${plain.slice(start, end).trim()}${end < plain.length ? "…" : ""}`;
}

export function search(docs: SearchDoc[], query: string, limit = 20): SearchHit[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const phrase = tokens.join(" ");

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    // Also match names written without hyphens or spaces ("dvits" → "D-VITS").
    const title = `${normalise(doc.title)} ${normalise(doc.title).replace(/[\s-]+/g, "")}`;
    const label = normalise([doc.label ?? "", ...(doc.keywords ?? [])].join(" "));
    const text = normalise(doc.text);

    let score = 0;
    let all = true;
    for (const t of tokens) {
      let s = 0;
      if (title.includes(t)) s += wordStart(title, t) ? 24 : 12;
      if (label.includes(t)) s += wordStart(label, t) ? 10 : 6;
      if (text.includes(t)) s += wordStart(text, t) ? 4 : 2;
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;

    const plainTitle = normalise(doc.title);
    if (plainTitle === phrase) score += 120;
    else if (plainTitle.startsWith(phrase)) score += 60;
    else if (title.includes(phrase)) score += 30;
    score += TYPE_BOOST[doc.type];

    hits.push({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      url: doc.url,
      label: doc.label,
      date: doc.date,
      snippet: snippetFor(doc.text, tokens),
      score,
    });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
