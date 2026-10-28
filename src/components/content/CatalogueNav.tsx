import Link from "next/link";
import { CATEGORIES, subcategoriesOf } from "@/content/site";
import type { Product, ProductCategory, SubcategoryId } from "@/lib/content/types";

/**
 * Therapeutic-area navigation for the catalogue.
 *
 * Every focus category and every one of its subcategories is listed with a
 * live count, including subcategories that currently have no products — the
 * structure is shown in full so the catalogue can grow into it. Surgicals is
 * listed only while it has products (it is not a Genesis focus area).
 *
 * Desktop: a sticky sidebar. Mobile: two scrollable chip rows (categories,
 * then the active category's subcategories).
 */

type Href = (over: { category?: ProductCategory; sub?: SubcategoryId }) => string;

export function CatalogueNav({
  products,
  category,
  sub,
  href,
}: {
  products: Product[];
  category?: ProductCategory;
  sub?: SubcategoryId;
  href: Href;
}) {
  const cats = CATEGORIES.filter((c) => c.focus || products.some((p) => p.category === c.id) || c.id === category);
  const countCat = (id: ProductCategory) => products.filter((p) => p.category === id).length;
  const countSub = (id: SubcategoryId) => products.filter((p) => p.subcategories.includes(id)).length;

  const pill = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-action text-white shadow-[0_8px_20px_-10px_rgb(8_87_143/0.7)]" : "bg-white text-ink ring-1 ring-line hover:ring-action/40"
    }`;
  const count = (n: number, active: boolean) => (
    <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/20" : "bg-cloud text-muted"}`}>{n}</span>
  );

  return (
    <>
      {/* Mobile and tablet */}
      <nav aria-label="Therapeutic areas" className="flex min-w-0 flex-col gap-3 lg:hidden">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Link href={href({})} scroll={false} aria-current={!category ? "page" : undefined} className={pill(!category)}>
            All {count(products.length, !category)}
          </Link>
          {cats.map((c) => (
            <Link key={c.id} href={href({ category: c.id })} scroll={false} aria-current={category === c.id && !sub ? "page" : undefined} className={pill(category === c.id)}>
              {c.label} {count(countCat(c.id), category === c.id)}
            </Link>
          ))}
        </div>
        {category && subcategoriesOf(category).length ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Subcategories">
            {subcategoriesOf(category).map((s) => (
              <Link
                key={s.id}
                href={href({ category, sub: sub === s.id ? undefined : s.id })}
                scroll={false}
                aria-current={sub === s.id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition ${
                  sub === s.id ? "bg-leaf-ink text-white" : "bg-mint text-leaf-ink ring-1 ring-leaf/20"
                }`}
              >
                {s.label} <span className="tabular-nums opacity-75">{countSub(s.id)}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </nav>

      {/* Desktop sidebar */}
      <nav aria-label="Therapeutic areas" className="hidden lg:block">
        <div className="card sticky top-28 p-5">
          <p className="eyebrow mb-4">Therapeutic areas</p>
          <Link
            href={href({})}
            scroll={false}
            aria-current={!category ? "page" : undefined}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              !category ? "bg-action text-white" : "text-ink hover:bg-mist"
            }`}
          >
            All products <span className="tabular-nums">{products.length}</span>
          </Link>
          <ul className="mt-2 flex flex-col gap-1">
            {cats.map((c) => {
              const activeCat = category === c.id;
              return (
                <li key={c.id}>
                  <Link
                    href={href({ category: c.id })}
                    scroll={false}
                    aria-current={activeCat && !sub ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-[0.98rem] font-semibold transition ${
                      activeCat && !sub ? "bg-mist text-action" : "text-ink hover:bg-cloud"
                    }`}
                  >
                    {c.label} <span className="text-sm tabular-nums text-muted">{countCat(c.id)}</span>
                  </Link>
                  {subcategoriesOf(c.id).length ? (
                    <ul className="mb-2 ml-3 mt-1 flex flex-col border-l border-line pl-2">
                      {subcategoriesOf(c.id).map((s) => {
                        const active = sub === s.id;
                        const n = countSub(s.id);
                        return (
                          <li key={s.id}>
                            <Link
                              href={href({ category: c.id, sub: s.id })}
                              scroll={false}
                              aria-current={active ? "page" : undefined}
                              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[0.875rem] transition ${
                                active ? "bg-mint font-semibold text-leaf-ink" : n ? "text-body hover:text-action" : "text-muted hover:text-action"
                              }`}
                            >
                              {s.label} <span className="tabular-nums text-xs">{n}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
