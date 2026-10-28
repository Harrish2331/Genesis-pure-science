/**
 * A deliberately small Markdown subset for Insights articles, product
 * descriptions and notices.
 *
 * It parses to a tree that React renders as elements — no HTML string is ever
 * produced or injected, so text an editor types (including "<script>") can
 * only ever appear as text. Links are restricted to http(s), mailto, tel,
 * site-relative paths and in-page anchors; anything else (javascript:,
 * data:, vbscript: …) is rendered as plain text.
 *
 * Supported:
 *   ## Heading / ### Sub-heading       (a single # is treated as ##)
 *   paragraphs separated by a blank line
 *   - bullet / * bullet,  1. numbered
 *   > quotation
 *   ---  (horizontal rule)
 *   **bold**, *italic* / _italic_, `code`, [label](url)
 */

import { slugify } from "./text.ts";

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; external: boolean; c: Inline[] };

export type Block =
  | { t: "h2" | "h3"; id: string; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "ul" | "ol"; items: Inline[][] }
  | { t: "quote"; c: Inline[] }
  | { t: "hr" };

const SAFE_URL = /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d][\d\s-]*|\/(?!\/)[^\s]*|#[\w-]+)$/i;

export function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (!SAFE_URL.test(href)) return null;
  return href;
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", v: buf });
    buf = "";
  };

  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);

    // `code`
    if (rest[0] === "`") {
      const end = rest.indexOf("`", 1);
      if (end > 1) {
        flush();
        out.push({ t: "code", v: rest.slice(1, end) });
        i += end + 1;
        continue;
      }
    }

    // [label](href)
    if (rest[0] === "[") {
      const m = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(rest);
      if (m) {
        flush();
        const href = safeHref(m[2]);
        const children = parseInline(m[1]);
        if (href) {
          out.push({ t: "link", href, external: /^https?:\/\//i.test(href), c: children });
        } else {
          out.push(...children);
        }
        i += m[0].length;
        continue;
      }
    }

    // **strong** / __strong__
    if (rest.startsWith("**") || rest.startsWith("__")) {
      const mark = rest.slice(0, 2);
      const end = rest.indexOf(mark, 2);
      if (end > 2) {
        flush();
        out.push({ t: "strong", c: parseInline(rest.slice(2, end)) });
        i += end + 2;
        continue;
      }
    }

    // *em* / _em_  (not inside a word for "_")
    if (rest[0] === "*" || (rest[0] === "_" && !/\w/.test(src[i - 1] ?? ""))) {
      const mark = rest[0];
      const end = rest.indexOf(mark, 1);
      if (end > 1 && rest[1] !== " ") {
        flush();
        out.push({ t: "em", c: parseInline(rest.slice(1, end)) });
        i += end + 1;
        continue;
      }
    }

    buf += src[i];
    i += 1;
  }
  flush();
  return out;
}

export function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  const usedIds = new Map<string, number>();
  let para: string[] = [];
  let list: { t: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];

  const uniqueId = (text: string) => {
    const base = slugify(text) || "section";
    const n = usedIds.get(base) ?? 0;
    usedIds.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  };

  const flushPara = () => {
    if (para.length) blocks.push({ t: "p", c: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ t: list.t, items: list.items.map(parseInline) });
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ t: "quote", c: parseInline(quote.join(" ")) });
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushAll();
      const level = heading[1].length <= 2 ? "h2" : "h3";
      const text = heading[2].replace(/\s+#+$/, "");
      blocks.push({ t: level, id: uniqueId(text), c: parseInline(text) });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      blocks.push({ t: "hr" });
      continue;
    }

    const bullet = /^[-*+]\s+(.+)$/.exec(trimmed);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(trimmed);
    if (bullet || numbered) {
      flushPara();
      flushQuote();
      const kind = bullet ? "ul" : "ol";
      if (!list || list.t !== kind) {
        flushList();
        list = { t: kind, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }

    const q = /^>\s?(.*)$/.exec(trimmed);
    if (q) {
      flushPara();
      flushList();
      quote.push(q[1]);
      continue;
    }

    // A non-marker line directly after a list item continues that item.
    if (list && !para.length) {
      list.items[list.items.length - 1] += ` ${trimmed}`;
      continue;
    }
    flushQuote();
    para.push(trimmed);
  }
  flushAll();
  return blocks;
}

/** Headings, for an article's table of contents. */
export function outline(md: string): { id: string; text: string; level: 2 | 3 }[] {
  return parseMarkdown(md)
    .filter((b): b is Extract<Block, { t: "h2" | "h3" }> => b.t === "h2" || b.t === "h3")
    .map((b) => ({ id: b.id, text: inlineText(b.c), level: b.t === "h2" ? 2 : 3 }));
}

export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.t === "text" || n.t === "code" ? n.v : inlineText(n.c)))
    .join("");
}
