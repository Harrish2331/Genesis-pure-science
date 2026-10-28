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

export function InsightCard({ insight, large }: { insight: Insight; large?: boolean }) {
  return (
    <article className={`card card-hover group flex h-full flex-col overflow-hidden ${large ? "lg:flex-row" : ""}`} data-reveal>
      <Link href={`/insights/${insight.slug}`} className={`flex h-full flex-col ${large ? "lg:flex-row" : ""}`}>
        <div className={`relative overflow-hidden ${large ? "aspect-[16/10] lg:aspect-auto lg:w-[55%] lg:shrink-0" : "aspect-[16/10]"}`}>
          {insight.coverImage ? (
            <Image
              src={insight.coverImage.url}
              alt={insight.coverAlt}
              fill
              sizes={large ? "(min-width: 1024px) 640px, 92vw" : "(min-width: 1024px) 380px, 92vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <InsightCoverFallback category={insight.category} />
          )}
        </div>
        <div className={`flex flex-1 flex-col gap-3 ${large ? "p-7 lg:p-10" : "p-6"}`}>
          <p className="meta flex flex-wrap items-center gap-x-2">
            {insight.category ? <span className="font-semibold uppercase tracking-[0.12em] text-leaf-ink">{insight.category}</span> : null}
            {insight.category ? <span aria-hidden="true">·</span> : null}
            <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(insight.body)} min read</span>
          </p>
          <h3 className={large ? "t-section !text-[clamp(1.5rem,1.2rem+1.2vw,2.2rem)]" : "t-card"}>{insight.title}</h3>
          {insight.excerpt ? (
            <p className={`text-body ${large ? "lead" : "line-clamp-3 text-[0.95rem] leading-relaxed"}`}>{insight.excerpt}</p>
          ) : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-action">
            Read article <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
