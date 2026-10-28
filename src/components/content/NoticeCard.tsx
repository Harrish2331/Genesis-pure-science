import Image from "next/image";
import Link from "next/link";
import { NOTICE_KIND_LABELS } from "@/content/site";
import { ArrowRight, CalendarIcon } from "@/components/ui/Icons";
import { formatDate } from "@/lib/text";
import type { Notice } from "@/lib/content/types";

export function NoticeCard({ notice, full }: { notice: Notice; full?: boolean }) {
  const links: { href: string; label: string; external?: boolean }[] = [];
  if (notice.productSlug) links.push({ href: `/products/${notice.productSlug}`, label: "View product" });
  if (notice.insightSlug) links.push({ href: `/insights/${notice.insightSlug}`, label: "Read the article" });
  if (notice.linkUrl) links.push({ href: notice.linkUrl, label: notice.linkLabel || "Learn more", external: /^https?:/.test(notice.linkUrl) });

  return (
    <article
      id={notice.slug}
      className={`card card-accent flex h-full scroll-mt-32 flex-col overflow-hidden ${full ? "md:flex-row" : ""}`}
      data-reveal
    >
      {notice.image ? (
        <div className={`relative overflow-hidden bg-mist ${full ? "aspect-[16/10] md:aspect-auto md:w-[38%] md:shrink-0" : "aspect-[16/9]"}`}>
          <Image
            src={notice.image.url}
            alt={notice.imageAlt}
            fill
            sizes={full ? "(min-width: 768px) 40vw, 92vw" : "(min-width: 1024px) 380px, 92vw"}
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className={notice.kind === "product-launch" || notice.kind === "coming-soon" ? "chip chip-green" : "chip"}>
            {NOTICE_KIND_LABELS[notice.kind]}
          </span>
          {notice.pinned ? <span className="chip chip-neutral">Pinned</span> : null}
          </div>
        <h3 className="t-card">{notice.title}</h3>
        <p className="meta flex items-center gap-1.5">
          <CalendarIcon size={14} />
          <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
        </p>
        <p className={`text-[0.95rem] leading-relaxed text-body ${full ? "" : "line-clamp-4"}`}>{notice.summary}</p>
        {links.length ? (
          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-2">
            {links.map((l) =>
              l.external ? (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-sm">
                  {l.label} <ArrowRight size={16} className="btn-arrow" />
                </a>
              ) : (
                <Link key={l.href} href={l.href} className="btn btn-ghost text-sm">
                  {l.label} <ArrowRight size={16} className="btn-arrow" />
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
