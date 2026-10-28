import "server-only";
import { CATEGORIES, SEARCHABLE_PAGES, SUBCATEGORIES, categoryMeta, subcategoryMeta, NOTICE_KIND_LABELS } from "@/content/site";
import { getInsights, getNotices, getProducts } from "@/lib/content/public";
import { search, type SearchDoc, type SearchHit } from "@/lib/search-core";
import { stripMarkdown } from "@/lib/text";

/** Builds the index from currently published content only. */
export async function buildIndex(): Promise<SearchDoc[]> {
  const [products, insights, notices] = await Promise.all([getProducts(), getInsights(), getNotices()]);

  const docs: SearchDoc[] = [];

  for (const p of products) {
    const meta = categoryMeta(p.category);
    docs.push({
      id: `product-${p.id}`,
      type: "product",
      title: p.name,
      url: `/products/${p.slug}`,
      label: p.subcategories[0] ? `${meta.label} › ${subcategoryMeta(p.subcategories[0]).label}` : meta.label,
      keywords: [meta.label, p.brand, p.dosageForm, ...p.subcategories.map((s) => subcategoryMeta(s).label), ...p.specifications.map((s) => s.value)].filter(Boolean),
      text: [p.composition, p.shortDescription, stripMarkdown(p.description)].filter(Boolean).join(" "),
    });
  }

  for (const c of CATEGORIES.filter((cat) => cat.focus || products.some((p) => p.category === cat.id))) {
    docs.push({
      id: `category-${c.id}`,
      type: "page",
      title: c.label,
      url: c.href,
      label: "Product category",
      keywords: ["category", "products"],
      text: c.short,
    });
  }

  for (const a of insights) {
    docs.push({
      id: `insight-${a.id}`,
      type: "insight",
      title: a.title,
      url: `/insights/${a.slug}`,
      label: a.category || "Insights",
      keywords: [a.category, a.author].filter(Boolean),
      text: [a.excerpt, stripMarkdown(a.body)].join(" "),
      date: a.publishedAt,
    });
  }

  for (const n of notices) {
    docs.push({
      id: `notice-${n.id}`,
      type: "notice",
      title: n.title,
      url: `/notices#${n.slug}`,
      label: NOTICE_KIND_LABELS[n.kind],
      text: n.summary,
      date: n.publishedAt,
    });
  }

  for (const s of SUBCATEGORIES) {
    docs.push({
      id: `subcategory-${s.id}`,
      type: "page",
      title: s.label,
      url: `/products?category=${s.parent}&sub=${s.id}`,
      label: `${categoryMeta(s.parent).label} · Therapeutic area`,
      keywords: ["category", "products", categoryMeta(s.parent).label],
      text: s.short,
    });
  }

  for (const p of SEARCHABLE_PAGES) {
    docs.push({ ...p, type: "page", keywords: [...p.keywords], text: "" });
  }

  return docs;
}

export async function siteSearch(query: string, limit = 20): Promise<SearchHit[]> {
  return search(await buildIndex(), query, limit);
}
