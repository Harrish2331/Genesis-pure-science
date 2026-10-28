import Image from "next/image";
import Link from "next/link";
import { FOCUS_AREAS, SUBCATEGORIES } from "@/content/site";
import { CapsuleScene } from "@/components/brand/CapsuleScene";
import { Molecule, RibbonBackdrop } from "@/components/brand/Motifs";
import { InsightCard } from "@/components/content/InsightCard";
import { NoticeCard } from "@/components/content/NoticeCard";
import { NetworkCertifications } from "@/components/content/Certifications";
import { PartnerLogoWall } from "@/components/content/PartnerLogoWall";
import { ProductCard } from "@/components/content/ProductCard";
import { BrandIntro } from "@/components/sections/BrandIntro";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { FocusGrid } from "@/components/sections/FocusGrid";
import { StatsBand } from "@/components/sections/StatsBand";
import { ButtonLink } from "@/components/ui/Button";
import { CopyText } from "@/components/ui/CopyText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getInsights, getNotices, getPartners, getProducts, getSettings, showCopy, showFact } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateMetadata() {
  return {
    ...pageMetadata({
      title: "Genesis Pure Lifesciences",
      description:
        "Genesis Pure Lifesciences is a pharmaceutical company focused on women’s health and general medicine. Explore our focus areas, products, manufacturing partners and latest updates.",
      path: "/",
    }),
    title: { absolute: "Genesis Pure Lifesciences — Excellence In Every Molecule" },
  };
}

export default async function HomePage() {
  const [settings, products, partners, notices, insights] = await Promise.all([
    getSettings(),
    getProducts(),
    getPartners(),
    getNotices(),
    getInsights(),
  ]);
  const c = settings.copy;
  const tagline = showFact(settings.brand.tagline);
  const wa = showFact(settings.contact.whatsapp);
  const waHref = wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null;
  const featured = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 6);
  const axonRelationship = showFact(settings.axon.relationship);
  // Figures for the statistics band — all computed, none typed in.
  const stats = [
    { value: products.length, label: "Products" },
    { value: SUBCATEGORIES.length, label: "Therapeutic areas" },
    { value: FOCUS_AREAS.length, label: "Focus areas" },
    { value: partners.length, label: "Manufacturing partners" },
  ];

  return (
    <>
      {/* ── 1 · Hero ───────────────────────────────────────────────── */}
      <section className="wash-hero relative isolate overflow-hidden" aria-labelledby="hero-heading">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,rgb(32_167_219/0.16),transparent)]" />
          <div className="absolute -bottom-56 -left-40 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(155_217_107/0.2),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgb(8_126_205/0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_60%_55%_at_70%_40%,#000_20%,transparent_75%)]" />
        </div>
        <div className="container-x grid items-center gap-6 pb-10 pt-6 md:pb-16 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-20 lg:pt-10">
          <div className="order-2 flex flex-col gap-6 lg:order-1">
            <CopyText copy={showCopy(c.heroEyebrow)} as="span" className="eyebrow" />
            {tagline ? (
              <>
                {/* The official slogan is the hero headline. */}
                <h1 className="t-display !text-[clamp(2.6rem,1.5rem+3.4vw,4.6rem)] !leading-[1.02] text-ink">
                  <SloganText text={tagline.value} />
                 
                </h1>
                <CopyText
                  copy={showCopy(c.heroHeadline)}
                  className="flex max-w-xl items-start gap-3 font-display text-[clamp(1.1rem,1rem+0.45vw,1.35rem)] font-medium leading-snug text-slate"
                />
                <CopyText copy={showCopy(c.heroIntro)} className="lead max-w-xl" />
              </>
            ) : (
              <>
                <CopyText copy={showCopy(c.heroHeadline)} as="h1" className="t-display max-w-[21ch] text-ink" />
                <CopyText copy={showCopy(c.heroIntro)} className="lead max-w-xl" />
              </>
            )}
            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink href="/products" arrow>
                Explore our products
              </ButtonLink>
              <ButtonLink href="/our-focus" variant="secondary">
                Our areas of focus
              </ButtonLink>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">
              {FOCUS_AREAS.map((cat) => (
                <li key={cat.id}>
                  <Link href={cat.focusHref} className="chip !py-1.5 transition hover:bg-white hover:shadow-[inset_0_0_0_1px_rgb(10_108_176/0.35)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[image:var(--grad-line)]" aria-hidden="true" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2">
            <CapsuleScene className="mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[26rem] lg:max-w-[36rem]" />
          </div>
        </div>
      </section>


      {/* ── 2 · About Genesis introduction ─────────────────────────── */}
      <section className="wash-lavender relative isolate overflow-hidden section-y" aria-labelledby="about-heading">
        <div className="pattern-hex pattern-fade pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal>
            <BrandIntro videoUrl={settings.intro.videoUrl} poster={settings.intro.poster} />
          </div>
          <div className="flex flex-col gap-5" data-reveal>
            <span className="eyebrow">About Genesis</span>
            <h2 id="about-heading" className="t-section">
              Who we are
            </h2>
            <CopyText copy={showCopy(c.aboutIntro)} className="lead" />
            <CopyText copy={showCopy(c.whoWeAre)} className="text-body" />
            {settings.values.items.length ? (
              <ul className="mt-1 flex flex-wrap gap-2" aria-label="Our values">
                {settings.values.items.map((v) => (
                  <li key={v.title} className="chip chip-green">
                    {v.title}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3">
              <ButtonLink href="/about" variant="secondary" arrow>
                Discover Genesis
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>


      {/* ── 3 · Our Focus ──────────────────────────────────────────── */}
      <section className="wash-warm relative isolate overflow-hidden section-y" aria-labelledby="focus-heading">
        <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
        <div className="container-x">
          <SectionHeader
            eyebrow="Our Focus"
            title={<span id="focus-heading">Our areas of focus</span>}
            intro={showCopy(c.scienceFocus)}
            action={<ButtonLink href="/our-focus" variant="ghost" arrow>All focus areas</ButtonLink>}
          />
          <div className="mt-12">
            <FocusGrid products={products} />
          </div>
        </div>
      </section>

      {/* ── 4 · Featured products ──────────────────────────────────── */}
      <section className="wash-sky relative isolate overflow-hidden section-y" aria-labelledby="products-heading">
        <RibbonBackdrop className="pointer-events-none absolute -left-20 top-0 h-full w-[45%] opacity-70" variant="left" />
        <div className="container-x relative">
          <SectionHeader
            eyebrow="Products"
            title={<span id="products-heading">Featured products</span>}
            intro="A selection from the Genesis catalogue. Browse the full range by category, or search for a product by name."
            action={<ButtonLink href="/products" arrow>View all products</ButtonLink>}
          />
          <div className="mt-12">
            {featured.length ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Our product catalogue is being prepared"
                action={<ButtonLink href="/contact" variant="secondary">Ask about our products</ButtonLink>}
              >
                Product information will be published here once it has been approved. In the meantime, our team can answer product enquiries directly.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* ── 5 · Manufacturing partners ─────────────────────────────── */}
      <section className="wash-peach relative isolate overflow-hidden section-y" aria-labelledby="partners-heading">
        <div className="pattern-hex pattern-fade pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-x">
          <SectionHeader
            eyebrow="Manufacturing"
            title={<span id="partners-heading">Our manufacturing partners</span>}
            intro={showCopy(c.manufacturingIntro)}
            action={<ButtonLink href="/manufacturing" variant="ghost" arrow>About manufacturing</ButtonLink>}
          />
          <div className="mt-12">
            <StatsBand stats={stats} />
          </div>
          {partners.length ? (
            <div className="mt-12">
              <PartnerLogoWall partners={partners} />
            </div>
          ) : null}
          <div className="mt-12">
            <NetworkCertifications partners={partners} tone="card" />
          </div>
        </div>
      </section>

      {/* ── 6 · Axon Surgicals ─────────────────────────────────────── */}
      <section className="bg-white section-y" aria-labelledby="axon-heading">
        <div className="container-x">
          <div className="relative isolate grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#eef6fc] via-white to-[#e9f7f6] shadow-[var(--shadow-ring),var(--shadow-soft)] lg:grid-cols-[0.9fr_1.1fr]" data-reveal>
            <div className="relative flex items-center justify-center p-10 md:p-14">
              <div className="absolute inset-6 rounded-[1.5rem] bg-white shadow-[var(--shadow-ring)]" aria-hidden="true" />
              <Image
                src="/brand/axon-surgicals-logo.png"
                alt="Axon Surgicals — Better Surgical Solutions"
                width={1400}
                height={908}
                sizes="(min-width: 1024px) 420px, 80vw"
                className="relative h-auto w-full max-w-[22rem]"
              />
            </div>
            <div className="flex flex-col justify-center gap-5 p-8 md:p-14">
              <span className="eyebrow !text-[#027d7b] before:!bg-[linear-gradient(90deg,#01458c,#029997)]">Surgical solutions</span>
              <h2 id="axon-heading" className="t-section">
                Axon Surgicals
              </h2>
              <CopyText copy={showCopy(c.axonIntro)} className="text-body" />
              {axonRelationship ? (
                <p className="text-sm text-muted">
                  {axonRelationship.value}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3">
                <ButtonLink href="/axon-surgicals" arrow>
                  Explore Axon Surgicals
                </ButtonLink>
                <ButtonLink href="/products?category=surgicals" variant="secondary">
                  Surgical products
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7 · Notices ────────────────────────────────────────────── */}
      <section className="wash-mint relative isolate overflow-hidden section-y" aria-labelledby="notices-heading">
        <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container-x">
          <SectionHeader
            eyebrow="Notice"
            title={<span id="notices-heading">Notices and announcements</span>}
            intro="Product announcements, launches and company updates from Genesis Pure Lifesciences."
            action={<ButtonLink href="/notices" variant="ghost" arrow>All notices</ButtonLink>}
          />
          <div className="mt-12">
            {notices.length ? (
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notices.slice(0, 3).map((n) => (
                  <li key={n.id}>
                    <NoticeCard notice={n} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No notices at the moment">Announcements and product updates will appear here.</EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* ── 8 · Latest Insights ────────────────────────────────────── */}
      <section className="wash-lavender relative isolate overflow-hidden section-y" aria-labelledby="insights-heading">
        <div className="container-x">
          <SectionHeader
            eyebrow="Insights"
            title={<span id="insights-heading">Latest insights</span>}
            intro="Articles, news and updates from Genesis Pure Lifesciences."
            action={<ButtonLink href="/insights" variant="ghost" arrow>All insights</ButtonLink>}
          />
          <div className="mt-12">
            {insights.length ? (
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {insights.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    <InsightCard insight={a} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Articles are on their way">
                Insights articles will be published here soon.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* ── 9 · Contact CTA ────────────────────────────────────────── */}
      <div className="relative">
        <Molecule className="pointer-events-none absolute left-[6%] top-0 hidden opacity-60 lg:block" size={60} />
        <CtaBand whatsappHref={waHref} />
      </div>
    </>
  );
}

/**
 * The slogan set as display type, its closing words in the brand gradient
 * ("Excellence In / Every Molecule"). Works for any slogan the dashboard holds.
 */
function SloganText({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const split = words.length > 2 ? words.length - 2 : words.length;
  const lead = words.slice(0, split).join(" ");
  const tail = words.slice(split).join(" ");
  return (
    <>
      <span className="block">{lead}</span>
      {tail ? <span className="grad-text block pb-[0.08em]">{tail}</span> : null}
    </>
  );
}
