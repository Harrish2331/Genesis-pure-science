import type { Metadata } from "next";
import { CATEGORIES, SUBCATEGORIES, subcategoryMeta } from "@/content/site";
import { ProductCard } from "@/components/content/ProductCard";
import { ProductExplorer, type ExplorerItem } from "@/components/content/ProductExplorer";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { PageHero } from "@/components/sections/PageHero";
import { IMAGES } from "@/content/images";
import { ButtonLink } from "@/components/ui/Button";
import { getProducts, getSettings, showFact } from "@/lib/content/public";
import { PRODUCT_CATEGORIES, SUBCATEGORY_IDS, SUBCATEGORY_PARENT, type ProductCategory, type SubcategoryId } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo";
import { slugify } from "@/lib/text";
import { whatsappUrl } from "@/lib/whatsapp";

type SP = Promise<{ q?: string; category?: string; sub?: string; form?: string }>;

const asCategory = (v?: string) => ((PRODUCT_CATEGORIES as readonly string[]).includes(v ?? "") ? (v as ProductCategory) : undefined);
const asSub = (v?: string) => ((SUBCATEGORY_IDS as readonly string[]).includes(v ?? "") ? (v as SubcategoryId) : undefined);

/** Resolve the URL into a consistent selection (a subcategory implies its category). */
function selection(sp: Awaited<SP>) {
  const sub = asSub(sp.sub);
  const category = sub ? SUBCATEGORY_PARENT[sub] : asCategory(sp.category);
  return { category, sub };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const { category, sub } = selection(sp);
  const cat = category ? CATEGORIES.find((c) => c.id === category)! : null;
  const subMeta = sub ? subcategoryMeta(sub) : null;
  const title = subMeta ? `${subMeta.label} — ${cat!.label} Products` : cat ? `${cat.label} Products` : "Products";
  const path = subMeta ? `/products?category=${category}&sub=${sub}` : cat ? `/products?category=${cat.id}` : "/products";
  return pageMetadata({
    title,
    description: subMeta
      ? `${subMeta.label} products from Genesis Pure Lifesciences. ${subMeta.short}`
      : cat
        ? `${cat.label} products from Genesis Pure Lifesciences. ${cat.short}`
        : "The Genesis Pure Lifesciences product catalogue — women’s health and general medicine, by therapeutic area.",
    path,
    // Search and form-filter permutations are not separate pages for indexing.
    noindex: Boolean(sp.q || sp.form),
  });
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  // Rendered per request: the explorer reads the selection from the URL during
  // server rendering too, so a deep link arrives already filtered.
  await searchParams;
  const [all, settings] = await Promise.all([getProducts(), getSettings()]);
  const wa = showFact(settings.contact.whatsapp);

  // Every card is rendered here once; the explorer only chooses which to show.
  const items: ExplorerItem[] = all.map((p, i) => ({
    id: p.id,
    category: p.category,
    subcategories: p.subcategories,
    form: p.dosageForm,
    formSlug: p.dosageForm ? slugify(p.dosageForm) : "",
    doc: {
      id: p.id,
      type: "product",
      title: p.name,
      url: "",
      label: CATEGORIES.find((c) => c.id === p.category)!.label,
      keywords: [p.brand, p.dosageForm, ...p.subcategories.map((s) => subcategoryMeta(s).label), ...p.specifications.map((s) => s.value)],
      text: `${p.composition} ${p.shortDescription} ${p.description}`,
    },
    card: <ProductCard product={p} headingLevel="h3" eager={i < 3} reveal={false} />,
  }));

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Product catalogue"
        intro={`${all.length} products across women’s health and general medicine. Browse by focus and therapeutic area, or search by name or composition.`}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ]}
        image={IMAGES.productsHero}
      />

      {all.length ? (
        <ProductExplorer
          items={items}
          categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label, short: c.short }))}
          subcategories={SUBCATEGORIES.map((s) => ({ id: s.id, label: s.label, short: s.short }))}
          subParent={SUBCATEGORY_PARENT}
        />
      ) : (
        <section className="pb-20 md:pb-28">
          <div className="container-x">
            <EmptyState
              title="Our product catalogue is being prepared"
              action={<ButtonLink href="/contact" variant="secondary">Ask about our products</ButtonLink>}
            >
              Approved product information will be published here.
            </EmptyState>
          </div>
        </section>
      )}

      <CtaBand
        title="Looking for a specific product?"
        body="Tell us what you need and our team will help with product information and availability."
        whatsappHref={wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null}
      />
    </>
  );
}
