import Image from "next/image";
import { Markdown } from "@/components/content/Markdown";
import { InsightCoverFallback } from "@/components/content/InsightCard";
import { ShareLinks } from "@/components/content/ShareLinks";
import { Breadcrumbs } from "@/components/sections/PageHero";
import { outline } from "@/lib/markdown";
import { formatDate, readingMinutes } from "@/lib/text";
import type { Insight } from "@/lib/content/types";

/**
 * The article layout, shared by the public article page and the dashboard
 * preview so a preview is exactly what will be published.
 */
export function ArticleView({ article, shareUrl, preview }: { article: Insight; shareUrl: string; preview?: boolean }) {
  const toc = outline(article.body);
  return (
    <article>
      <header className="relative isolate overflow-hidden bg-gradient-to-b from-mist via-white to-white">
        <div className="container-x pb-10 pt-10 md:pb-14">
          {!preview ? (
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "Insights", path: "/insights" },
                { name: article.title, path: `/insights/${article.slug}` },
              ]}
            />
          ) : null}
          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-5 text-center md:mt-14">
            <p className="meta flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {article.category ? <span className="font-semibold uppercase tracking-[0.12em] text-leaf-ink">{article.category}</span> : null}
              {article.category ? <span aria-hidden="true">·</span> : null}
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{readingMinutes(article.body)} min read</span>
            </p>
            <h1 className="t-page">{article.title}</h1>
            {article.excerpt ? <p className="lead mx-auto max-w-2xl">{article.excerpt}</p> : null}
            {article.author ? <p className="meta">By {article.author}</p> : null}
          </div>
        </div>
      </header>

      <div className="container-x">
        <div className="relative mx-auto aspect-[16/8] max-w-5xl overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-ring),var(--shadow-soft)]">
          {article.coverImage ? (
            <Image src={article.coverImage.url} alt={article.coverAlt} fill priority sizes="(min-width: 1080px) 1024px, 94vw" className="object-cover" />
          ) : (
            <InsightCoverFallback category={article.category} />
          )}
        </div>

        <div className="mx-auto grid max-w-5xl gap-12 py-14 md:py-20 lg:grid-cols-[1fr_15rem]">
          <Markdown source={article.body} className="prose-g max-w-[68ch]" />
          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            {toc.length > 1 ? (
              <nav aria-label="In this article">
                <h2 className="eyebrow mb-3">In this article</h2>
                <ol className="space-y-2 border-l border-line pl-4 text-sm">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                      <a href={`#${h.id}`} className="text-body hover:text-action">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            <ShareLinks url={shareUrl} title={article.title} />
          </aside>
        </div>
      </div>
    </article>
  );
}
