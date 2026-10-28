import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { categoryMeta, subcategoryMeta } from "@/content/site";
import { JsonLd } from "@/components/JsonLd";
import { RibbonBackdrop } from "@/components/brand/Motifs";
import { HcpGate } from "@/components/content/HcpGate";
import { Markdown } from "@/components/content/Markdown";
import { AvailabilityChip, ProductCard } from "@/components/content/ProductCard";
import { ProductVisual } from "@/components/content/ProductVisual";
import { Breadcrumbs } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLeft, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { getProduct, getProducts, getSettings, showFact } from "@/lib/content/public";
import { excerpt } from "@/lib/text";
import { pageMetadata, productLd } from "@/lib/seo";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found", robots: { index: false } };
  return pageMetadata({
    title: p.seoTitle || `${p.name} — ${categoryMeta(p.category).label}`,
    description: p.metaDescription || p.shortDescription || excerpt(p.description, 155) || `${p.name} from Genesis Pure Lifesciences.`,
    path: `/products/${p.slug}`,
    image: p.image?.url,
    // Prescription medicines are not promoted to the public, so their pages
    // stay out of search indexes; placeholders are never indexable.
    noindex: p.prescriptionOnly || p.placeholder,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, all, settings] = await Promise.all([getProduct(slug), getProducts(), getSettings()]);
  if (!product) notFound();

  const meta = categoryMeta(product.category);
  // Related: same subcategory first, then the rest of the category.
  const others = all.filter((p) => p.category === product.category && p.id !== product.id);
  const related = [
    ...others.filter((p) => p.subcategories.some((s) => product.subcategories.includes(s))),
    ...others.filter((p) => !p.subcategories.some((s) => product.subcategories.includes(s))),
  ].slice(0, 3);
  const firstSub = product.subcategories[0] ? subcategoryMeta(product.subcategories[0]) : null;
  const facts = [
    { label: "Category", value: meta.label },
    { label: "Therapeutic area", value: product.subcategories.map((s) => subcategoryMeta(s).label).join(", ") },
    { label: "Composition", value: product.composition },
    { label: "Dosage form", value: product.dosageForm },
    { label: "Pack size", value: product.packSize },
    ...product.specifications,
  ].filter((f) => f.value);
  const wa = showFact(settings.contact.whatsapp);
  const waHref = wa ? whatsappUrl(wa.value, productEnquiryMessage(product.name)) : null;
  const enquiryHref = `/contact?type=product&product=${encodeURIComponent(product.name)}`;

  const details = (
    <div className="flex flex-col gap-8">
      {product.description ? <Markdown source={product.description} /> : null}
      {facts.length ? (
        <div>
          <h2 className="eyebrow mb-4">Product information</h2>
          <dl className="divide-y divide-line overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-ring)]">
            {facts.map((s) => (
              <div key={s.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-ink">{s.label}</dt>
                <dd className="text-[0.95rem] text-body">{s.value}</dd>
              </div>
            ))}
            {product.manufacturer ? (
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-ink">Manufactured by</dt>
                <dd className="text-[0.95rem] text-body">{product.manufacturer}</dd>
              </div>
            ) : null}
            {product.marketedBy ? (
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-ink">Marketed by</dt>
                <dd className="text-[0.95rem] text-body">{product.marketedBy}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted">
            The information above is taken from the product pack and is provided for identification and reference. It is not a
            substitute for the approved product information or for professional medical advice, diagnosis or treatment.{" "}
            <Link href="/disclaimer" className="font-semibold text-action hover:underline">
              Disclaimer
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-mist via-white to-white">
        <RibbonBackdrop className="pointer-events-none absolute -right-10 top-0 -z-10 h-full w-[60%]" />
        <div className="container-x pb-16 pt-10 md:pb-24">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: meta.label, path: `/products?category=${meta.id}` },
              ...(firstSub ? [{ name: firstSub.label, path: `/products?category=${meta.id}&sub=${firstSub.id}` }] : []),
              { name: product.name, path: `/products/${product.slug}` },
            ]}
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start" data-reveal>
              <div className="card relative aspect-square overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image.url}
                    alt={product.imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 560px, 92vw"
                    className="object-contain p-8"
                  />
                ) : (
                  <ProductVisual category={product.category} label={meta.label} />
                )}
              </div>
              {product.image ? (
                <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {product.imageCaption || "Pack shown for identification. Artwork may vary."}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-6" data-reveal>
              <Link href="/products" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-action hover:underline">
                <ArrowLeft size={16} /> Back to all products
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={meta.href} className="chip chip-green hover:bg-white">
                  {meta.label}
                </Link>
                {product.subcategories.map((s) => (
                  <Link key={s} href={`/products?category=${meta.id}&sub=${s}`} className="chip hover:bg-white">
                    {subcategoryMeta(s).label}
                  </Link>
                ))}
                {product.brand ? <span className="chip chip-neutral">{product.brand}</span> : null}
                {product.prescriptionOnly ? <span className="chip chip-neutral">Rx · Prescription only</span> : null}
                <AvailabilityChip value={product.availability} />
              </div>
              <h1 className="t-page">{product.name}</h1>
              {product.shortDescription ? <p className="lead">{product.shortDescription}</p> : null}

              {product.prescriptionOnly ? <HcpGate productName={product.name}>{details}</HcpGate> : details}

              <div className="card flex flex-col gap-4 p-6">
                <h2 className="t-card">Enquire about {product.name}</h2>
                <p className="text-[0.95rem] text-body">
                  For product information, availability or trade enquiries, contact our team.
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={enquiryHref} arrow>
                    <MailIcon size={18} /> Send an enquiry
                  </ButtonLink>
                  {waHref ? (
                    <ButtonLink href={waHref} variant="whatsapp" external>
                      <WhatsAppIcon size={18} /> Ask on WhatsApp
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="wash-lavender section-y" aria-labelledby="related-heading">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-heading" className="t-section">
                More in {meta.label}
              </h2>
              <ButtonLink href={meta.href} variant="ghost" arrow>
                View all
              </ButtonLink>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {!product.prescriptionOnly && !product.placeholder ? <JsonLd data={productLd(product, meta.label)} /> : null}
    </>
  );
}
