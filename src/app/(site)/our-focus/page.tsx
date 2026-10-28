import { FOCUS_AREAS, SUBCATEGORIES, categoryMeta, subcategoriesOf } from "@/content/site";
import Link from "next/link";
import { CapsuleGlyph, CrossGlyph, LeafGlyph, RibbonBackdrop } from "@/components/brand/Motifs";
import { ProductCard } from "@/components/content/ProductCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { FocusExplorer, type ExplorerArea } from "@/components/sections/FocusExplorer";
import { FocusGrid } from "@/components/sections/FocusGrid";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { CopyText } from "@/components/ui/CopyText";
import { getProducts, getSettings, showCopy, showFact } from "@/lib/content/public";
import type { ProductCategory } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Our Focus",
  description:
    "Genesis Pure Lifesciences focuses on two areas: women’s health and general medicine. Explore each area and its products.",
  path: "/our-focus",
});

const GLYPH = { leaf: LeafGlyph, capsule: CapsuleGlyph, cross: CrossGlyph };

export default async function OurFocusPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const c = settings.copy;
  const copy: Partial<Record<ProductCategory, ReturnType<typeof showCopy>>> = {
    "womens-health": showCopy(c.womensHealth),
    "general-medicine": showCopy(c.generalMedicine),
    surgicals: showCopy(c.surgicals),
  };
  // Every therapeutic area with its products, for the explorer.
  const explorer: ExplorerArea[] = SUBCATEGORIES.map((s) => {
    const items = products.filter((p) => p.subcategories.includes(s.id));
    return {
      id: s.id,
      label: s.label,
      short: s.short,
      group: categoryMeta(s.parent).label,
      href: items.length ? `/products?category=${s.parent}&sub=${s.id}` : `/products?category=${s.parent}`,
      count: items.length,
      products: items.map((p) => ({ slug: p.slug, name: p.name, image: p.image?.url ?? null, alt: p.imageAlt })),
    };
  });
  const wa = showFact(settings.contact.whatsapp);

  return (
    <>
      <PageHero
        eyebrow="Our Focus"
        title="Our areas of focus"
        intro={showCopy(c.scienceFocus)}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Our Focus", path: "/our-focus" },
        ]}
        motif="sprout"
      />

      <section className="wash-warm relative isolate overflow-hidden section-y !pt-10" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          Focus areas overview
        </h2>
        <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container-x">
          <FocusGrid products={products} />
        </div>
      </section>

      <section className="wash-lavender relative isolate overflow-hidden section-y" aria-labelledby="explorer-heading">
        <div className="pattern-hex pattern-fade pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-x">
          <div className="mb-10 flex max-w-2xl flex-col gap-4" data-reveal>
            <span className="eyebrow">Therapeutic areas</span>
            <h2 id="explorer-heading" className="t-section">
              Explore by therapeutic area
            </h2>
          </div>
          <FocusExplorer areas={explorer} />
        </div>
      </section>

      {FOCUS_AREAS.map((cat, i) => {
        const items = products.filter((p) => p.category === cat.id);
        const G = GLYPH[cat.motif];
        return (
          <section
            key={cat.id}
            id={cat.id}
            className={`relative isolate scroll-mt-28 overflow-hidden section-y ${["bg-white", "wash-sky", "wash-peach"][i % 3]}`}
            aria-labelledby={`${cat.id}-heading`}
          >
            {i % 2 === 1 ? <RibbonBackdrop className="pointer-events-none absolute -right-10 top-0 h-full w-1/2" /> : null}
            <div className="container-x relative">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start" data-reveal>
                  <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_18px_40px_-20px_rgb(8_87_143/0.5)] ring-1 ring-line">
                    <G size={46} />
                  </span>
                  <span className="eyebrow">Focus area {String(i + 1).padStart(2, "0")}</span>
                  <h2 id={`${cat.id}-heading`} className="t-section">
                    {cat.label}
                  </h2>
                  {copy[cat.id] ? <CopyText copy={copy[cat.id]!} className="lead" /> : null}
                  <ul className="flex flex-col gap-1.5 pt-1" aria-label={`${cat.label} therapeutic areas`}>
                    {subcategoriesOf(cat.id).map((s) => {
                      const n = items.filter((p) => p.subcategories.includes(s.id)).length;
                      return (
                        <li key={s.id}>
                          <Link
                            href={`/products?category=${cat.id}&sub=${s.id}`}
                            className="group flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-2.5 text-[0.95rem] font-medium text-ink ring-1 ring-line transition hover:ring-action/40"
                          >
                            <span className="group-hover:text-action">{s.label}</span>
                            <span className="text-sm tabular-nums text-muted">
                              {n} product{n === 1 ? "" : "s"}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <ButtonLink href={cat.href} arrow>
                      {cat.label} products
                    </ButtonLink>
                    {cat.id === "surgicals" ? (
                      <ButtonLink href="/axon-surgicals" variant="secondary">
                        Axon Surgicals
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
                <div>
                  {items.length ? (
                    <ul className="grid gap-6 sm:grid-cols-2">
                      {items.slice(0, 6).map((p) => (
                        <li key={p.id}>
                          <ProductCard product={p} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState title={`${cat.label} products coming soon`}>
                      Approved product information for this area will be published here. Contact our team for surgical product enquiries.
                    </EmptyState>
                  )}
                  {items.length > 6 ? (
                    <div className="mt-6">
                      <ButtonLink href={cat.href} variant="ghost" arrow>
                        See all {items.length} {cat.label} products
                      </ButtonLink>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <CtaBand whatsappHref={wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null} />
    </>
  );
}
