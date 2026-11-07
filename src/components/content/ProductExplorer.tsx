"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { search, type SearchDoc } from "@/lib/search-core";
import type { ProductCategory, SubcategoryId } from "@/lib/content/types";

export type ExplorerItem = {
  id: string;
  category: ProductCategory;
  subcategories: SubcategoryId[];
  formSlug: string;
  form: string;
  doc: SearchDoc;
  /** The server-rendered product card. */
  card: ReactNode;
};

export type ExplorerOption<T extends string> = { id: T; label: string; short: string };

type Selection = { category?: ProductCategory; sub?: SubcategoryId; form?: string };

/**
 * The product catalogue.
 *
 * Laid out like the Zafieon catalogue: two labelled chip rows — focus area,
 * then therapeutic area — with search, dosage form and the result count on the
 * right, and the full-width grid beneath.
 *
 * Every card is rendered once on the server; filtering only chooses which of
 * them to show, so a click never waits on the network and can never leave the
 * grid empty while something loads. The selection lives in the URL (pushed
 * for chips, replaced while typing), so links, refresh and back/forward all
 * restore it. Only areas that hold products are offered, so no chip leads to
 * an empty grid; an empty result is only possible from a search or dosage
 * form, and then says so with a way out.
 */
export function ProductExplorer({
  items,
  categories,
  subcategories,
  subParent,
}: {
  items: ExplorerItem[];
  categories: ExplorerOption<ProductCategory>[];
  subcategories: ExplorerOption<SubcategoryId>[];
  subParent: Record<SubcategoryId, ProductCategory>;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  // ── Selection, read from the URL and made consistent ───────────────
  const known = <T extends string>(list: ExplorerOption<T>[], v: string | null) => list.find((o) => o.id === v)?.id;
  const sub = known(subcategories, params.get("sub"));
  const requested = known(categories, params.get("category"));
  // A subcategory always implies its own parent, whatever else the URL says.
  const category = sub ? subParent[sub] : requested;
  // A real area with nothing in it yet (e.g. a deep link to Surgicals).
  const emptyArea = Boolean(category && !items.some((p) => p.category === category));

  const [query, setQuery] = useState(params.get("q") ?? "");
  const q = useDeferredValue(query.trim().slice(0, 80));

  const scope = useMemo(
    () => items.filter((p) => (!category || p.category === category) && (!sub || p.subcategories.includes(sub))),
    [items, category, sub],
  );
  const forms = useMemo(
    () => Array.from(new Map(scope.filter((p) => p.formSlug).map((p) => [p.formSlug, p.form])).entries()).sort((a, b) => a[1].localeCompare(b[1])),
    [scope],
  );
  const form = forms.find(([slug]) => slug === params.get("form"))?.[0];

  const visible = useMemo(() => {
    const list = form ? scope.filter((p) => p.formSlug === form) : scope;
    if (q.length < 2) return list;
    const hits = search(list.map((p) => p.doc), q, 500);
    const order = new Map(hits.map((h, i) => [h.id, i]));
    return list.filter((p) => order.has(p.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }, [scope, form, q]);

  // ── URL updates ─────────────────────────────────────────────────────
  const urlFor = (s: Selection, text = query.trim()) => {
    const next = new URLSearchParams();
    if (text) next.set("q", text);
    if (s.category) next.set("category", s.category);
    if (s.sub) next.set("sub", s.sub);
    if (s.form) next.set("form", s.form);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  /** Chip and select changes are history entries, like any other link. */
  const select = (s: Selection) => window.history.pushState(null, "", urlFor(s));

  // Typing replaces the URL (debounced), so back does not step through letters.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => window.history.replaceState(null, "", urlFor({ category, sub, form })), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the selection is read at fire time
  }, [query]);

  // Back/forward to an entry with a different search text: follow it.
  // (Adjusted during render, React's pattern for state that follows a changing value.)
  const urlQuery = params.get("q") ?? "";
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery.trim() !== query.trim()) setQuery(urlQuery);
  }

  // ── Chip sets, with counts; only areas that hold products ───────────
  const catChips = categories
    .map((c) => ({ ...c, count: items.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count > 0);
  const subChips = subcategories
    .filter((s) => !category || subParent[s.id] === category)
    .map((s) => ({ ...s, count: items.filter((p) => p.subcategories.includes(s.id)).length }))
    .filter((s) => s.count > 0);

  const chip = (on: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-300 ${
      on
        ? "bg-action text-white shadow-[0_8px_20px_-10px_rgb(8_87_143/0.7)]"
        : "bg-white text-ink ring-1 ring-line hover:text-action hover:ring-action/40"
    }`;
  const subChip = (on: boolean) =>
    `inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.84rem] font-semibold transition duration-300 ${
      on ? "bg-leaf-ink text-white" : "bg-mint text-leaf-ink ring-1 ring-leaf/20 hover:ring-leaf/50"
    }`;
  const count = (n: number, on: boolean) => (
    <span className={`rounded-full px-1.5 text-xs tabular-nums ${on ? "bg-white/20" : "bg-cloud text-muted"}`}>{n}</span>
  );

  const filtered = Boolean(query.trim() || category || sub || form);
  const reset = () => {
    setQuery("");
    window.history.pushState(null, "", pathname);
  };

  return (
    <section className="pb-20 md:pb-28" aria-label="Catalogue">
      <div className="container-x">
        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-7 border-b border-line pb-8 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
          <div className="min-w-0 space-y-6">
            <div role="group" aria-labelledby="cat-label">
              <span id="cat-label" className="eyebrow mb-3 block">
                Focus area
              </span>
              <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                <button type="button" onClick={() => select({})} aria-pressed={!category} className={chip(!category)}>
                  All products {count(items.length, !category)}
                </button>
                {catChips.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select({ category: c.id })}
                    aria-pressed={category === c.id}
                    className={chip(category === c.id)}
                  >
                    {c.label} {count(c.count, category === c.id)}
                  </button>
                ))}
              </div>
            </div>

            {subChips.length ? (
              <div role="group" aria-labelledby="sub-label">
                <span id="sub-label" className="eyebrow mb-3 block">
                  Therapeutic area
                </span>
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => select({ category })}
                    aria-pressed={!sub}
                    className={subChip(!sub)}
                  >
                    All
                  </button>
                  {subChips.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => select(sub === s.id ? { category } : { category: subParent[s.id], sub: s.id })}
                      aria-pressed={sub === s.id}
                      className={subChip(sub === s.id)}
                    >
                      {s.label} <span className="tabular-nums opacity-75">{s.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end xl:flex-nowrap">
            <div className="min-w-0 flex-1 sm:min-w-[16rem] xl:w-72 xl:flex-none">
              <label htmlFor="catalogue-q" className="eyebrow mb-3 block">
                Search
              </label>
              <div className="relative">
                <SearchIcon size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="catalogue-q"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or composition"
                  maxLength={80}
                  autoComplete="off"
                  className="field !min-h-11 !rounded-full !py-2 !pl-11 !pr-11 text-sm"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-cloud hover:text-ink"
                    aria-label="Clear search"
                  >
                    <CloseIcon size={15} />
                  </button>
                ) : null}
              </div>
            </div>
            {forms.length > 1 ? (
              <div className="sm:w-48">
                <label htmlFor="catalogue-form" className="eyebrow mb-3 block">
                  Dosage form
                </label>
                <select
                  id="catalogue-form"
                  value={form ?? ""}
                  onChange={(e) => select({ category, sub, form: e.target.value || undefined })}
                  className="field !min-h-11 !py-2 text-sm"
                >
                  <option value="">All forms</option>
                  {forms.map(([slug, label]) => (
                    <option key={slug} value={slug}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <p className="shrink-0 pb-2.5 text-sm text-muted" aria-live="polite">
              <span className="font-display text-base font-semibold tabular-nums text-ink">{visible.length}</span> of{" "}
              <span className="tabular-nums">{items.length}</span> products
            </p>
          </div>
        </div>

        {category && !emptyArea ? (
          <p className="mt-6 text-[0.95rem] text-body">
            <span className="font-display font-semibold text-ink">
              {(sub ? subcategories.find((s) => s.id === sub) : categories.find((c) => c.id === category))?.label}
            </span>
            {" — "}
            {(sub ? subcategories.find((s) => s.id === sub) : categories.find((c) => c.id === category))?.short}
          </p>
        ) : null}

        <h2 className="sr-only">Products</h2>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        {visible.length ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, i) => (
              // Keyed by product: cards that stay keep their place and do not
              // re-animate; only cards a filter brings in fade up.
              <li key={p.id} className="catalogue-in" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                {p.card}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-[var(--radius-card)] bg-white px-6 py-16 text-center shadow-[var(--shadow-ring)]">
            <h3 className="t-card">
              {emptyArea
                ? `No ${categories.find((c) => c.id === category)?.label ?? ""} products are listed yet`
                : q.length >= 2
                  ? `No products match “${q}”`
                  : "No products match this combination"}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-body">
              {emptyArea
                ? "Products in this area will appear here as they are added to the Genesis range."
                : "Try a different spelling, a shorter search term or another area."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {filtered ? (
                <button type="button" onClick={reset} className="btn btn-secondary">
                  Show all products
                </button>
              ) : null}
              <Link href="/contact" className="btn btn-ghost">
                Ask our team
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
