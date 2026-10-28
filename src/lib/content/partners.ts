import type { Partner } from "./types.ts";

/**
 * Helpers for the Manufacturing section. Everything here is derived from the
 * partner records as entered — no figure on the page is typed in by hand.
 */

/** A partner gets its own profile page only once it has a verified description. */
export const hasProfile = (p: Partner): boolean => p.description.trim().length > 0;

export const partnerPath = (p: Partner): string => `/manufacturing/${p.slug}`;

/** Display name: the full registered name when known, else the name as supplied. */
export const partnerTitle = (p: Partner): string => p.fullName || p.name;

/** Paragraphs of a description, split on blank lines. */
export const paragraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);

/** Union of a list field across partners, in first-seen order, case-insensitive. */
export function unionOf(partners: Partner[], pick: (p: Partner) => string[]): string[] {
  const seen = new Map<string, string>();
  for (const p of partners) for (const v of pick(p)) if (!seen.has(v.toLowerCase())) seen.set(v.toLowerCase(), v);
  return [...seen.values()];
}

/** Sites whose role marks them as packaging support rather than a production plant. */
export const PACKAGING_ROLE = /bottl|print|pack/i;
