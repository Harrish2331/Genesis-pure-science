import "server-only";
import type { Metadata } from "next";
import { absoluteUrl, isPreviewDeployment } from "@/lib/env";
import { showFact } from "@/lib/content/public";
import type { Insight, Product, Settings } from "@/lib/content/types";

/**
 * Page metadata and structured data.
 *
 * Structured data states only what the site can stand behind: the company
 * name and official logo, and contact details or social profiles once they
 * are confirmed in the dashboard. No ratings, reviews, prices or
 * certifications are emitted anywhere — none have been supplied.
 */

export const SITE_NAME = "Genesis Pure Lifesciences";
const LOGO_URL = "/brand/genesis-logo.png";

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noindex,
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: absoluteUrl(image) }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex || isPreviewDeployment() ? { index: false, follow: !noindex } : undefined,
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: SITE_NAME,
      locale: "en_IN",
      ...(images ? { images } : {}),
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
  };
}

/* ── JSON-LD builders ─────────────────────────────────────────────────── */

export function organizationLd(settings: Settings) {
  // Structured data is for search engines: only confirmed facts.
  const confirmed = (f: { value: string; confirmed: boolean }) => (f.confirmed && f.value.trim() ? f.value.trim() : null);
  const phone = confirmed(settings.contact.customerServicePhone);
  const email = confirmed(settings.contact.email);
  const office = settings.contact.offices.find((o) => o.confirmed && o.lines.length);
  const sameAs = Object.values(settings.social)
    .map((f) => confirmed(f))
    .filter(Boolean);
  const legal = confirmed(settings.brand.legalName);
  const routes = (settings.contact.departments ?? [])
    .filter((d) => d.confirmed && d.emails.length)
    .map((d) => ({ "@type": "ContactPoint", contactType: d.label, email: d.emails[0], areaServed: "IN" }));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    ...(legal ? { legalName: legal } : {}),
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_URL), width: 455, height: 652 },
    ...(sameAs.length ? { sameAs } : {}),
    ...(phone || email || routes.length
      ? {
          contactPoint: [
            ...(phone || email
              ? [
                  {
                    "@type": "ContactPoint",
                    contactType: "customer service",
                    ...(phone ? { telephone: phone } : {}),
                    ...(email ? { email } : {}),
                    areaServed: "IN",
                  },
                ]
              : []),
            ...routes,
          ],
        }
      : {}),
    ...(office ? { address: { "@type": "PostalAddress", streetAddress: office.lines.join(" "), addressCountry: "IN" } } : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function productLd(p: Product, categoryLabel: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: absoluteUrl(`/products/${p.slug}`),
    category: categoryLabel,
    ...(p.shortDescription ? { description: p.shortDescription } : {}),
    ...(p.image ? { image: absoluteUrl(p.image.url) } : {}),
    brand: { "@type": "Brand", name: p.brand || SITE_NAME },
    ...(p.manufacturer ? { manufacturer: { "@type": "Organization", name: p.manufacturer } } : {}),
  };
}

export function articleLd(a: Insight) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.metaDescription || a.excerpt,
    url: absoluteUrl(`/insights/${a.slug}`),
    mainEntityOfPage: absoluteUrl(`/insights/${a.slug}`),
    datePublished: a.publishedAt,
    dateModified: a.updatedAt,
    ...(a.coverImage ? { image: [absoluteUrl(a.coverImage.url)] } : {}),
    author:
      !a.author || a.author === SITE_NAME
        ? { "@id": absoluteUrl("/#organization") }
        : { "@type": "Person", name: a.author },
    publisher: { "@id": absoluteUrl("/#organization") },
    ...(a.category ? { articleSection: a.category } : {}),
  };
}

/** Convenience for components that need a review-aware fact. */
export { showFact };
