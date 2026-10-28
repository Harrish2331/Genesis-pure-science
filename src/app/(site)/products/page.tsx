import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES, subcategoryMeta } from "@/content/site";
import { CatalogueNav } from "@/components/content/CatalogueNav";
import { CatalogueSearch } from "@/components/content/CatalogueSearch";
import { Pagination } from "@/components/content/Pagination";
import { ProductCard } from "@/components/content/ProductCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { getProducts, getSettings, showFact } from "@/lib/content/public";
import { PRODUCT_CATEGORIES, SUBCATEGORY_IDS, SUBCATEGORY_PARENT, type ProductCategory, type SubcategoryId } from "@/lib/content/types";
import { search } from "@/lib/search-core";
import { pageMetadata } from "@/lib/seo";
import { slugify } from "@/lib/text";
import { whatsappUrl } from "@/lib/whatsapp";

const PER_PAGE = 12;

type SP = Promise<{ q?: string; category?: string; sub?: string; form?: string; page?: string }>;

const asCategory = (v?: string) => ((PRODUCT_CATEGORIES as readonly string[]).includes(v ?? "") ? (v as ProductCategory) : undefined);
const asSub = (v?: string) => ((SUBCATEGORY_IDS as readonly string[]).includes(v ?? "") ? (v as SubcategoryId) : undefined);

/** Resolve the URL into a consistent selection (a subcategory implies its category). */
function selection(sp: Awaited<SP>) {
  const sub = asSub(sp.sub);
  const category = sub ? SUBCATEGORY_PARENT[sub] : asCategory(sp.category);
  return { category, sub };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const { category, sub } = selection(sp);
  const cat = category ? CATEGORIES.find((c) => c.id === category)! : null;
  const subMeta = sub ? subcategoryMeta(sub) : null;
  const title = subMeta ? `${subMeta.label} — ${cat!.label} Products` : cat ? `${cat.label} Products` : "Products";
  const path = subMeta ? `/products?category=${category}&sub=${sub}` : cat ? `/products?category=${cat.id}` : "/products";
  return pageMetadata({
    title,
    description: subMeta
      ? `${subMeta.label} products from Genesis Pure Lifesciences. ${subMeta.short}`
      : cat
        ? `${cat.label} products from Genesis Pure Lifesciences. ${cat.short}`
        : "The Genesis Pure Lifesciences product catalogue — women’s health and general medicine, by therapeutic area.",
    path,
    // Search, form-filter and paging permutations are not separate pages for indexing.
    noindex: Boolean(sp.q || sp.form || (sp.page && sp.page !== "1")),
  });
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [all, settings] = await Promise.all([getProducts(), getSettings()]);
  const { category, sub } = selection(sp);
  const q = (sp.q ?? "").slice(0, 80);

  // Dosage forms present in the current area, for the form filter.
  const scope = all.filter((p) => (!category || p.category === category) && (!sub || p.subcategories.includes(sub)));
  const forms = Array.from(new Map(scope.filter((p) => p.dosageForm).map((p) => [slugify(p.dosageForm), p.dosageForm])).entries()).sort((a, b) =>
    a[1].localeCompare(b[1]),
  );
  const form = forms.find(([slug]) => slug === sp.form)?.[0];

  let list = scope;
  if (form) list = list.filter((p) => slugify(p.dosageForm) === form);
  if (q.trim()) {
    const hits = search(
      list.map((p) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        url: "",
        label: CATEGORIES.find((c) => c.id === p.category)!.label,
        keywords: [p.brand, p.dosageForm, ...p.subcategories.map((s) => subcategoryMeta(s).label), ...p.specifications.map((s) => s.value)],
        text: `${p.composition} ${p.shortDescription} ${p.description}`,
      })),
      q,
      500,
    );
    const order = new Map(hits.map((h, i) => [h.id, i]));
    list = list.filter((p) => order.has(p.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  type Over = { category?: ProductCategory; sub?: SubcategoryId; q?: string; form?: string; page?: string };
  const href = (over: Over) => {
    const merged: Over = { q: q || undefined, category, sub, form, ...over };
    // Changing the therapeutic area resets the form filter (forms differ by area).
    if ("category" in over || "sub" in over) merged.form = over.form;
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/products?${s}` : "/products";
  };

  const catMeta = category ? CATEGORIES.find((c) => c.id === category)! : null;
  const subMeta = sub ? subcategoryMeta(sub) : null;
  const wa = showFact(settings.contact.whatsapp);
  const filtered = Boolean(q || category || sub || form);

  return (
    <>
      <PageHero
        eyebrow="Products"
        title={subMeta ? subMeta.label : catMeta ? `${catMeta.label} products` : "Product catalogue"}
        intro={
          subMeta
            ? subMeta.short
            : catMeta
              ? catMeta.short
              : `${all.length} products across women’s health and general medicine. Browse by therapeutic area, or search by name or composition.`
        }
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          ...(catMeta ? [{ name: catMeta.label, path: `/products?category=${catMeta.id}` }] : []),
          ...(subMeta ? [{ name: subMeta.label, path: `/products?category=${category}&sub=${sub}` }] : []),
        ]}
      />

      <section className="pb-20 md:pb-28" aria-label="Catalogue">
        <div className="container-x grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
          <CatalogueNav products={all} category={category} sub={sub} href={(o) => href({ ...o, page: undefined })} />

          <div className="min-w-0">
            <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Suspense>
                  <CatalogueSearch initial={q} />
                </Suspense>
              </div>
              {forms.length > 1 ? (
                <form action="/products" className="flex flex-wrap items-center gap-2">
                  {q ? <input type="hidden" name="q" value={q} /> : null}
                  {category ? <input type="hidden" name="category" value={category} /> : null}
                  {sub ? <input type="hidden" name="sub" value={sub} /> : null}
                  <label htmlFor="form" className="whitespace-nowrap text-sm font-medium text-muted">
                    Dosage form
                  </label>
                  <select id="form" name="form" defaultValue={form ?? ""} className="field !min-h-10 min-w-0 flex-1 !py-2 text-sm sm:!w-auto sm:max-w-[11rem] sm:flex-none">
                    <option value="">All forms</option>
                    {forms.map(([slug, label]) => (
                      <option key={slug} value={slug}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-secondary btn-sm">
                    Apply
                  </button>
                </form>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2" aria-live="polite">
              <p className="mr-2 text-sm text-muted">
                {list.length === 0
                  ? "No products match"
                  : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, list.length)} of ${list.length} product${list.length === 1 ? "" : "s"}`}
              </p>
              {catMeta ? (
                <Link href={href({ category: undefined, sub: undefined })} scroll={false} className="chip !py-1.5 hover:bg-white">
                  {catMeta.label} <CloseIcon size={12} />
                  <span className="sr-only">Remove category filter</span>
                </Link>
              ) : null}
              {subMeta ? (
                <Link href={href({ category, sub: undefined })} scroll={false} className="chip chip-green !py-1.5 hover:bg-white">
                  {subMeta.label} <CloseIcon size={12} />
                  <span className="sr-only">Remove subcategory filter</span>
                </Link>
              ) : null}
              {form ? (
                <Link href={href({ form: undefined })} scroll={false} className="chip chip-neutral !py-1.5 hover:bg-white">
                  {forms.find(([s]) => s === form)?.[1]} <CloseIcon size={12} />
                  <span className="sr-only">Remove dosage form filter</span>
                </Link>
              ) : null}
              {q ? (
                <Link href={href({ q: undefined })} scroll={false} className="chip chip-neutral !py-1.5 hover:bg-white">
                  “{q}” <CloseIcon size={12} />
                  <span className="sr-only">Clear search</span>
                </Link>
              ) : null}
              {filtered ? (
                <Link href="/products" className="ml-auto text-sm font-semibold text-action hover:underline">
                  Show all products
                </Link>
              ) : null}
            </div>

            <div className="mt-5">
              {shown.length ? (
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {shown.map((p, i) => (
                    <li key={p.id}>
                      <ProductCard product={p} headingLevel="h2" eager={i < 3} />
                    </li>
                  ))}
                </ul>
              ) : all.length === 0 ? (
                <EmptyState
                  title="Our product catalogue is being prepared"
                  action={<ButtonLink href="/contact?type=product" variant="secondary">Ask about our products</ButtonLink>}
                >
                  Approved product information will be published here.
                </EmptyState>
              ) : sub && !q && !form ? (
                <EmptyState
                  title={`No ${subMeta!.label} products yet`}
                  action={<ButtonLink href={href({ category, sub: undefined })} variant="secondary">See all {catMeta!.label} products</ButtonLink>}
                >
                  Products in this area will appear here as they are added to the Genesis range.
                </EmptyState>
              ) : (
                <EmptyState title="No products match your search" action={<ButtonLink href="/products" variant="secondary">Show all products</ButtonLink>}>
                  Try a different spelling, a shorter search term or another therapeutic area.
                </EmptyState>
              )}
            </div>

            <Pagination page={page} pages={pages} hrefFor={(n) => href({ page: n > 1 ? String(n) : undefined })} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Looking for a specific product?"
        body="Tell us what you need and our team will help with product information and availability."
        whatsappHref={wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null}
      />
    </>
  );
}
