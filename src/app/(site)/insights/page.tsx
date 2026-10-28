import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogueSearch } from "@/components/content/CatalogueSearch";
import { InsightCard } from "@/components/content/InsightCard";
import { Pagination } from "@/components/content/Pagination";
import { EmptyState } from "@/components/sections/EmptyState";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { getInsights } from "@/lib/content/public";
import { search } from "@/lib/search-core";
import { pageMetadata } from "@/lib/seo";
import { slugify } from "@/lib/text";

const PER_PAGE = 9;
type SP = Promise<{ q?: string; category?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  return pageMetadata({
    title: "Insights",
    description: "Articles, news and company updates from Genesis Pure Lifesciences.",
    path: "/insights",
    noindex: Boolean(sp.q || sp.category || (sp.page && sp.page !== "1")),
  });
}

export default async function InsightsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await getInsights();
  const q = (sp.q ?? "").slice(0, 80);

  const categories = Array.from(new Map(all.filter((a) => a.category).map((a) => [slugify(a.category), a.category])).entries());
  const activeCat = categories.find(([slug]) => slug === sp.category)?.[1];

  let list = all;
  if (activeCat) list = list.filter((a) => a.category === activeCat);
  if (q.trim()) {
    const hits = search(
      list.map((a) => ({ id: a.id, type: "insight" as const, title: a.title, url: "", label: a.category, text: `${a.excerpt} ${a.body}` })),
      q,
      500,
    );
    const order = new Map(hits.map((h, i) => [h.id, i]));
    list = list.filter((a) => order.has(a.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }

  const filtered = Boolean(q || activeCat);
  const lead = !filtered ? (all.find((a) => a.featured) ?? all[0]) : undefined;
  const rest = lead ? list.filter((a) => a.id !== lead.id) : list;
  const pages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1));
  const shown = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: q || undefined, category: sp.category && activeCat ? sp.category : undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/insights?${s}` : "/insights";
  };

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Insights"
        intro="Articles, news and company updates from Genesis Pure Lifesciences."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ]}
      />

      <section className="wash-warm pb-20 pt-12 md:pb-28 md:pt-16" aria-label="Articles">
        <div className="container-x">
          {all.length ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <nav aria-label="Article categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {[[undefined, "All"] as const, ...categories].map(([slug, label]) => {
                    const active = (slug ?? undefined) === (activeCat ? sp.category : undefined);
                    return (
                      <Link
                        key={label}
                        href={href({ category: slug, page: undefined })}
                        aria-current={active ? "page" : undefined}
                        scroll={false}
                        className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                          active ? "bg-action text-white" : "bg-cloud text-ink ring-1 ring-line hover:ring-action/40"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="lg:w-80">
                  <Suspense>
                    <CatalogueSearch initial={q} placeholder="Search articles…" />
                  </Suspense>
                </div>
              </div>

              {lead && page === 1 ? (
                <div className="mt-10">
                  <InsightCard insight={lead} large />
                </div>
              ) : null}

              {shown.length ? (
                <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {shown.map((a) => (
                    <li key={a.id}>
                      <InsightCard insight={a} />
                    </li>
                  ))}
                </ul>
              ) : filtered ? (
                <div className="mt-10">
                  <EmptyState title="No articles match" action={<ButtonLink href="/insights" variant="secondary">Show all articles</ButtonLink>}>
                    Try another search term or category.
                  </EmptyState>
                </div>
              ) : null}
              <Pagination page={page} pages={pages} hrefFor={(n) => href({ page: n > 1 ? String(n) : undefined })} />
            </>
          ) : (
            <EmptyState as="h2" title="Articles are on their way">Insights articles from Genesis Pure Lifesciences will be published here soon.</EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
