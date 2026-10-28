import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ArticleView } from "@/components/content/ArticleView";
import { InsightCard } from "@/components/content/InsightCard";
import { ButtonLink } from "@/components/ui/Button";
import { getInsight, getInsights } from "@/lib/content/public";
import { absoluteUrl } from "@/lib/env";
import { articleLd, pageMetadata } from "@/lib/seo";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getInsights()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getInsight(slug);
  if (!a) return { title: "Article not found", robots: { index: false } };
  return pageMetadata({
    title: a.seoTitle || a.title,
    description: a.metaDescription || a.excerpt,
    path: `/insights/${a.slug}`,
    image: a.coverImage?.url,
    type: "article",
    publishedTime: a.publishedAt,
    modifiedTime: a.updatedAt,
    noindex: a.placeholder,
  });
}

export default async function InsightPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [article, all] = await Promise.all([getInsight(slug), getInsights()]);
  if (!article) notFound();

  const others = all.filter((a) => a.id !== article.id);
  const related = [
    ...others.filter((a) => a.category && a.category === article.category),
    ...others.filter((a) => !a.category || a.category !== article.category),
  ].slice(0, 3);

  return (
    <>
      <ArticleView article={article} shareUrl={absoluteUrl(`/insights/${article.slug}`)} />
      {related.length ? (
        <section className="bg-cloud section-y" aria-labelledby="related-heading">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-heading" className="t-section">
                Related articles
              </h2>
              <ButtonLink href="/insights" variant="ghost" arrow>
                All insights
              </ButtonLink>
            </div>
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.id}>
                  <InsightCard insight={a} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      {!article.placeholder ? <JsonLd data={articleLd(article)} /> : null}
    </>
  );
}
