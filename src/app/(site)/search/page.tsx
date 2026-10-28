import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { EmptyState } from "@/components/sections/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, SearchIcon } from "@/components/ui/Icons";
import { siteSearch } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const LABEL = { product: "Product", insight: "Insight", notice: "Notice", page: "Page" } as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 80).trim();
  const results = q.length >= 2 ? await siteSearch(q, 50) : [];

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search the site"}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ]}
        motif="none"
      >
        <form role="search" action="/search" className="relative mt-2 max-w-xl">
          <label htmlFor="search-page-q" className="sr-only">
            Search
          </label>
          <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input id="search-page-q" name="q" type="search" defaultValue={q} maxLength={80} placeholder="Products, insights, notices…" className="field !rounded-full !pl-12 !pr-28" />
          <button type="submit" className="btn btn-primary btn-sm absolute right-1.5 top-1/2 -translate-y-1/2">
            Search
          </button>
        </form>
      </PageHero>

      <section className="pb-20 md:pb-28">
        <div className="container-x max-w-4xl">
          {q.length >= 2 ? (
            results.length ? (
              <>
                <p className="mb-6 text-sm text-muted" aria-live="polite">
                  {results.length} result{results.length === 1 ? "" : "s"}
                </p>
                <ol className="flex flex-col gap-3">
                  {results.map((r) => (
                    <li key={r.id}>
                      <Link href={r.url} className="card card-hover group flex items-start gap-5 p-5 md:p-6">
                        <span className="mt-1 w-16 shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-action">{LABEL[r.type]}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg font-semibold text-ink">{r.title}</span>
                          {r.label ? <span className="block text-xs text-muted">{r.label}</span> : null}
                          {r.snippet ? <span className="mt-2 block text-[0.95rem] text-body">{r.snippet}</span> : null}
                        </span>
                        <ArrowRight size={18} className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-action" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <EmptyState title={`No results for “${q}”`} action={<ButtonLink href="/products" variant="secondary">Browse products</ButtonLink>}>
                Check the spelling, or try a shorter or more general word.
              </EmptyState>
            )
          ) : (
            <p className="text-body">Enter at least two characters to search products, insights, notices and pages.</p>
          )}
        </div>
      </section>
    </>
  );
}
