import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";

/** Numbered pagination built from links, so every page is crawlable. */
export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const items: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) items.push("gap");
    items.push(n);
  });

  const base = "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`${base} text-ink ring-1 ring-line-strong hover:text-action`} aria-label="Previous page">
          <ArrowLeft size={16} />
        </Link>
      ) : null}
      {items.map((it, i) =>
        it === "gap" ? (
          <span key={`g${i}`} className="px-1 text-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={hrefFor(it)}
            aria-current={it === page ? "page" : undefined}
            className={`${base} ${it === page ? "bg-action text-white" : "text-ink ring-1 ring-line-strong hover:text-action"}`}
          >
            <span className="sr-only">Page </span>
            {it}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`${base} text-ink ring-1 ring-line-strong hover:text-action`} aria-label="Next page">
          <ArrowRight size={16} />
        </Link>
      ) : null}
    </nav>
  );
}
