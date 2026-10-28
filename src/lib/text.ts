/**
 * Small, dependency-free text helpers shared by server and client code.
 * Pure on purpose: unit tests import this file directly under Node.
 */

/** Lower-case, strip accents, collapse whitespace. Used for search and slugs. */
export function normalise(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** URL-safe slug: a–z, 0–9 and single hyphens, at most 80 characters. */
export function slugify(input: string): string {
  return normalise(input)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(value: string): boolean {
  return value.length > 0 && value.length <= 80 && SLUG_PATTERN.test(value);
}

/** Plain-text excerpt of at most `max` characters, cut on a word boundary. */
export function excerpt(text: string, max = 160): string {
  const plain = stripMarkdown(text).replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Remove the Markdown syntax our renderer understands, leaving the words. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^---+$/gm, "");
}

/** Approximate reading time in minutes (minimum one). */
export function readingMinutes(md: string): number {
  const words = stripMarkdown(md).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "19 October 2026" — fixed format so server and client render identically. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
