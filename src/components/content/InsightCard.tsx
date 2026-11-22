import Image from "next/image";
import Link from "next/link";
import { Molecule } from "@/components/brand/Motifs";
import { ArrowRight } from "@/components/ui/Icons";
import { formatDate, readingMinutes } from "@/lib/text";
import type { Insight } from "@/lib/content/types";

/** Cover art for an article with no image: a quiet brand composition. */
export function InsightCoverFallback({ category }: { category: string }) {
  return (
    <div className="relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br from-[#e9f5fc] via-[#f4faf7] to-[#eaf6ef] p-6">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M250-10c90 40 150 120 160 270H210C240 170 250 80 250-10Z" fill="#20a7db" opacity="0.08" />
        <path d="M-10 200c80-60 170-70 260-30" stroke="#41b183" strokeOpacity="0.25" strokeWidth="2" fill="none" />
        <path d="M-10 222c90-52 180-58 280-22" stroke="#087ecd" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
      </svg>
      <Molecule className="absolute right-6 top-6 opacity-90" size={56} />
      <span className="relative text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-action">{category || "Insights"}</span>
    </div>
  );
}

type Variant = "default" | "feature" | "wide" | "compact";

/**
 * Per-variant classes.
 *
 *   default  Image on top; used in grids (Insights, Home, related articles).
 *   feature  The lead article at the head of Insights, with articles beside it: larger image on top.
 *   wide     The lead article when nothing sits beside it: image and text side by side.
 *   compact  Beside the lead article: a small image and the headline, side by side.
 */
const STYLE: Record<Variant, { row: string; media: string; sizes: string; body: string; title: string; excerpt: string }> = {
  default: {
    row: "",
    media: "aspect-[16/10]",
    sizes: "(min-width: 1024px) 380px, 92vw",
    body: "gap-3 p-6",
    title: "t-card",
    excerpt: "line-clamp-3 text-[0.95rem] leading-relaxed",
  },
  feature: {
    row: "",
    media: "aspect-[16/9]",
    sizes: "(min-width: 1024px) 700px, 92vw",
    body: "gap-3 p-6 lg:p-8",
    title: "font-display text-[clamp(1.4rem,1.1rem+0.9vw,1.9rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink",
    excerpt: "line-clamp-3 text-[1.02rem] leading-relaxed",
  },
  wide: {
    row: "lg:flex-row",
    media: "aspect-[16/10] lg:aspect-auto lg:min-h-[22rem] lg:w-[52%] lg:shrink-0",
    sizes: "(min-width: 1024px) 620px, 92vw",
    body: "gap-3 p-7 lg:p-10",
    title: "font-display text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink",
    excerpt: "line-clamp-4 text-[1.05rem] leading-relaxed",
  },
  compact: {
    // Side by side on small phones-in-landscape and beside the lead on desktop;
    // image on top on tablets, where two of these share a row.
    row: "sm:flex-row md:flex-col lg:flex-row",
    media:
      "aspect-[16/10] sm:aspect-auto sm:min-h-[11rem] sm:w-[40%] sm:shrink-0 md:aspect-[16/10] md:min-h-0 md:w-full lg:aspect-auto lg:min-h-[11rem] lg:w-[40%]",
    sizes: "(min-width: 1024px) 220px, (min-width: 640px) 40vw, 92vw",
    body: "gap-2 p-5",
    title: "font-display text-[1.05rem] font-semibold leading-snug text-ink line-clamp-3",
    excerpt: "line-clamp-3 text-[0.92rem] leading-relaxed",
  },
};

export function InsightCard({ insight, variant = "default" }: { insight: Insight; variant?: Variant }) {
  const s = STYLE[variant];
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden" data-reveal>
      <Link href={`/insights/${insight.slug}`} className={`flex h-full flex-col ${s.row}`}>
        <div className={`relative overflow-hidden ${s.media}`}>
          {insight.coverImage ? (
            <Image
              src={insight.coverImage.url}
              alt={insight.coverAlt}
              fill
              sizes={s.sizes}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <InsightCoverFallback category={insight.category} />
          )}
        </div>
        <div className={`flex flex-1 flex-col ${s.body}`}>
          <p className={`meta flex flex-wrap items-center gap-x-2 ${variant === "compact" ? "gap-x-3 gap-y-0.5" : ""}`}>
            {insight.category ? <span className="font-semibold uppercase tracking-[0.12em] text-leaf-ink">{insight.category}</span> : null}
            {insight.category && variant !== "compact" ? <span aria-hidden="true">·</span> : null}
            <time dateTime={insight.publishedAt} className="whitespace-nowrap">
              {formatDate(insight.publishedAt)}
            </time>
            {variant === "compact" ? null : (
              <>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">{readingMinutes(insight.body)} min read</span>
              </>
            )}
          </p>
          <h3 className={s.title}>{insight.title}</h3>
          {insight.excerpt ? <p className={`text-body ${s.excerpt}`}>{insight.excerpt}</p> : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-action">
            Read article <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
