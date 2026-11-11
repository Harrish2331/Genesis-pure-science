import Image from "next/image";
import { AXON_SURGICALS, FOCUS_AREAS, SUBCATEGORIES, categoryMeta, subcategoriesOf } from "@/content/site";
import Link from "next/link";
import { CapsuleGlyph, CrossGlyph, LeafGlyph, RibbonBackdrop } from "@/components/brand/Motifs";
import { ProductCard } from "@/components/content/ProductCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { FocusExplorer, type ExplorerArea } from "@/components/sections/FocusExplorer";
import { FocusShowcase } from "@/components/sections/FocusShowcase";
import { PageHero } from "@/components/sections/PageHero";
import { IMAGES } from "@/content/images";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import { getProducts, getSettings, showCopy, showFact } from "@/lib/content/public";
import type { ProductCategory } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Our Focus",
  description:
    "Genesis Pure Lifesciences focuses on women’s health, general medicine and surgicals, through Axon Surgicals. Explore each area and its products.",
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
  const axonRelationship = showFact(settings.axon.relationship);

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
        image={IMAGES.focusHero}
      />

      <section className="wash-warm relative isolate overflow-hidden section-y !pt-10" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          Focus areas overview
        </h2>
        <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container-x">
          <FocusShowcase products={products} />
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
                  {cat.id === "surgicals" ? (
                    <p className="lead">
                      Surgical products for clinical and hospital settings, presented through{" "}
                      <span className="font-semibold text-[#01458c]">{AXON_SURGICALS.name}</span>.
                    </p>
                  ) : copy[cat.id] ? (
                    <CopyText copy={copy[cat.id]!} className="lead" />
                  ) : null}
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
                    {cat.id === "surgicals" ? (
                      <ButtonLink href={`/contact?type=product&product=${encodeURIComponent(AXON_SURGICALS.name)}`} arrow>
                        Enquire about Axon Surgicals
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={cat.href} arrow>
                        {cat.label} products
                      </ButtonLink>
                    )}
                    {cat.id === "surgicals" && items.length ? (
                      <ButtonLink href={cat.href} variant="secondary">
                        Surgical products
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  {cat.id === "surgicals" ? (
                    <AxonPanel
                      relationship={axonRelationship?.value}
                      whatsappHref={wa ? whatsappUrl(wa.value, productEnquiryMessage(`${AXON_SURGICALS.name} products`)) : null}
                    />
                  ) : null}
                  {items.length ? (
                    <ul className="grid gap-6 sm:grid-cols-2">
                      {items.slice(0, 6).map((p) => (
                        <li key={p.id}>
                          <ProductCard product={p} />
                        </li>
                      ))}
                    </ul>
                  ) : cat.id === "surgicals" ? null : (
                    <EmptyState title={`${cat.label} products coming soon`}>
                      Approved product information for this area will be published here. Contact our team for product enquiries.
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

/**
 * Axon Surgicals within the Surgicals focus area: its logo, what the range
 * stands for, and the routes to the team. Accents use Axon's own navy
 * (#01458C) and teal (#029997) from the supplied logo.
 */
function AxonPanel({ relationship, whatsappHref }: { relationship?: string; whatsappHref: string | null }) {
  return (
    <article
      className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#eef6fc] via-white to-[#e9f7f6] shadow-[var(--shadow-ring),var(--shadow-soft)]"
      aria-labelledby="axon-heading"
      data-reveal
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#01458c,#029997)]" aria-hidden="true" />
      <div className="grid gap-8 p-7 md:grid-cols-[0.8fr_1.2fr] md:items-center md:p-10">
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),transparent)]" aria-hidden="true" />
          <Image
            src={AXON_SURGICALS.logo.src}
            alt={AXON_SURGICALS.logo.alt}
            width={AXON_SURGICALS.logo.width}
            height={AXON_SURGICALS.logo.height}
            sizes="(min-width: 768px) 260px, 70vw"
            className="relative h-auto w-full max-w-[16rem]"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="eyebrow !text-[#027d7b] before:!bg-[linear-gradient(90deg,#01458c,#029997)]">{AXON_SURGICALS.tagline}</span>
          <h3 id="axon-heading" className="font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {AXON_SURGICALS.name}
          </h3>
          {AXON_SURGICALS.description.map((para) => (
            <p key={para.slice(0, 24)} className="text-[0.98rem] leading-relaxed text-body">
              {para}
            </p>
          ))}
          {relationship ? <p className="text-sm text-muted">{relationship}</p> : null}
        </div>
      </div>
      <ul className="grid gap-px border-t border-line bg-line sm:grid-cols-2" aria-label="What Axon Surgicals stands for">
        {AXON_SURGICALS.points.map((pt) => (
          <li key={pt} className="flex items-center gap-3 bg-white px-7 py-4 text-[0.95rem] font-medium text-ink md:px-10">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f5f4] text-[#027d7b]">
              <CheckIcon size={15} />
            </span>
            {pt}
          </li>
        ))}
      </ul>
      {whatsappHref ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-7 py-5 md:px-10">
          <p className="text-[0.95rem] text-body">Questions about the surgical range? Our team can help.</p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
            Ask on WhatsApp <span className="sr-only">(opens WhatsApp)</span>
          </a>
        </div>
      ) : null}
    </article>
  );
}
