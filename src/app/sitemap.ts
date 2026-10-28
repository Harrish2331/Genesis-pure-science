import type { MetadataRoute } from "next";
import { CATEGORIES, SUBCATEGORIES } from "@/content/site";
import { getInsights, getPartners, getProducts } from "@/lib/content/public";
import { hasProfile, partnerPath } from "@/lib/content/partners";
import { absoluteUrl, isPreviewDeployment } from "@/lib/env";

export const revalidate = 300;

/**
 * Canonical, indexable URLs only. Never listed: the dashboard, search
 * results, drafts, scheduled articles, development placeholders and
 * prescription-only product pages (which are noindex by design).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewDeployment()) return [];
  const [products, insights, partners] = await Promise.all([getProducts(), getInsights(), getPartners()]);

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/our-focus"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/products"), changeFrequency: "weekly", priority: 0.9 },
    ...CATEGORIES.filter((c) => c.focus || products.some((p) => p.category === c.id)).map((c) => ({
      url: absoluteUrl(`/products?category=${c.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Subcategory views that currently list products.
    ...SUBCATEGORIES.filter((s) => products.some((p) => p.subcategories.includes(s.id))).map((s) => ({
      // Next.js writes <loc> values verbatim, so the ampersand must be pre-escaped
      // for the sitemap to be well-formed XML.
      url: absoluteUrl(`/products?category=${s.parent}&amp;sub=${s.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: absoluteUrl("/manufacturing"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/axon-surgicals"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/notices"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/insights"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/disclaimer"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const productUrls: MetadataRoute.Sitemap = products
    .filter((p) => !p.placeholder && !p.prescriptionOnly)
    .map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.7 }));

  const insightUrls: MetadataRoute.Sitemap = insights
    .filter((a) => !a.placeholder)
    .map((a) => ({ url: absoluteUrl(`/insights/${a.slug}`), lastModified: a.updatedAt, changeFrequency: "monthly", priority: 0.6 }));

  const partnerUrls: MetadataRoute.Sitemap = partners
    .filter(hasProfile)
    .map((p) => ({ url: absoluteUrl(partnerPath(p)), lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.5 }));

  return [...pages, ...productUrls, ...partnerUrls, ...insightUrls];
}
