import Image from "next/image";
import { CrossGlyph } from "@/components/brand/Motifs";
import { ProductCard } from "@/components/content/ProductCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { Breadcrumbs } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { ExternalIcon } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import { getProducts, getSettings, showCopy, showFact } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Axon Surgicals",
  description: "Axon Surgicals — surgical products for clinical and hospital settings.",
  path: "/axon-surgicals",
  image: "/brand/axon-surgicals-logo.png",
});

/**
 * Axon Surgicals.
 *
 * The relationship between Genesis Pure Lifesciences and Axon Surgicals has
 * not been confirmed, so this page states none: the relationship line comes
 * from Settings → Axon Surgicals and appears only once it is confirmed there.
 * Products appear here when their "Brand" field is set to "Axon Surgicals".
 *
 * Accents use Axon's own navy (#01458C) and teal (#029997), taken from the
 * supplied logo package, so the page is distinguishable while remaining part
 * of the Genesis site.
 */
export default async function AxonPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  const relationship = showFact(settings.axon.relationship);
  const website = showFact(settings.axon.website);
  const axonProducts = products.filter((p) => p.brand.trim().toLowerCase() === "axon surgicals");
  const surgicalCount = products.filter((p) => p.category === "surgicals").length;
  const wa = showFact(settings.contact.whatsapp);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#edf4fb] via-white to-white">
        <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M1440 80c-260-40-520 40-640 230-90 140-60 260 30 330h610Z" fill="#029997" opacity="0.06" />
          <path d="M1440 260c-200-10-330 80-360 200-20 80 10 140 70 180h290Z" fill="#01458c" opacity="0.05" />
          <path d="M-20 560c300-120 620-150 980-60" stroke="#029997" strokeOpacity="0.2" strokeWidth="2" fill="none" />
        </svg>
        <div className="container-x pb-16 pt-10 md:pb-24">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Axon Surgicals", path: "/axon-surgicals" },
            ]}
          />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-5" data-reveal>
              <span className="eyebrow !text-[#027d7b] before:!bg-[linear-gradient(90deg,#01458c,#029997)]">Surgical solutions</span>
              <h1 className="t-page">Axon Surgicals</h1>
              <CopyText copy={showCopy(settings.copy.axonIntro)} className="lead" />
              {relationship ? (
                <p className="text-body">
                  {relationship.value}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href="/contact?type=product&product=Axon%20Surgicals" arrow className="!bg-[#01458c] hover:!bg-[#013670]">
                  Enquire about Axon Surgicals
                </ButtonLink>
                {website ? (
                  <ButtonLink href={website.value} variant="secondary" external>
                    Visit website <ExternalIcon size={16} />
                  </ButtonLink>
                ) : null}
              </div>
            </div>
            <div className="card flex items-center justify-center p-10 md:p-14" data-reveal>
              <Image
                src="/brand/axon-surgicals-logo.png"
                alt="Axon Surgicals — Better Surgical Solutions"
                width={1400}
                height={908}
                priority
                sizes="(min-width: 1024px) 460px, 86vw"
                className="h-auto w-full max-w-[26rem]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="wash-sky section-y" aria-labelledby="axon-products">
        <div className="container-x">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-reveal>
            <div className="flex max-w-2xl flex-col gap-4">
              <span className="eyebrow !text-[#027d7b] before:!bg-[linear-gradient(90deg,#01458c,#029997)]">Products</span>
              <h2 id="axon-products" className="t-section">
                Axon Surgicals products
              </h2>
            </div>
            {surgicalCount ? (
              <ButtonLink href="/products?category=surgicals" variant="ghost" arrow>
                All surgical products
              </ButtonLink>
            ) : null}
          </div>
          <div className="mt-10">
            {axonProducts.length ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {axonProducts.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Axon Surgicals products will be listed here"
                action={
                  surgicalCount ? (
                    <ButtonLink href="/products?category=surgicals" variant="secondary">
                      Browse the surgical category
                    </ButtonLink>
                  ) : undefined
                }
              >
                <span className="inline-flex items-center gap-2">
                  <CrossGlyph size={20} /> Product information will appear once it has been approved.
                </span>
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      <CtaBand
        title="Surgical product enquiries"
        body="Contact our team for information about surgical products and availability."
        whatsappHref={wa ? whatsappUrl(wa.value, productEnquiryMessage("Axon Surgicals products")) : null}
      />
    </>
  );
}
