import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RibbonBackdrop } from "@/components/brand/Motifs";
import { CertificationSeal, RegulatorEmblem } from "@/components/content/Certifications";
import { markFor, markForRegistration } from "@/lib/content/certifications";
import { CtaBand } from "@/components/sections/CtaBand";
import { Breadcrumbs } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { AlertIcon, ArrowLeft, CheckIcon, DocIcon, ExternalIcon, PinIcon, ShieldIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { getPartner, getPartners, getSettings, showFact } from "@/lib/content/public";
import { PACKAGING_ROLE, hasProfile, paragraphs, partnerTitle } from "@/lib/content/partners";
import { pageMetadata } from "@/lib/seo";
import { excerpt } from "@/lib/text";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getPartners()).filter(hasProfile).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPartner(slug);
  if (!p || !hasProfile(p)) return { title: "Partner not found", robots: { index: false } };
  return pageMetadata({
    title: `${partnerTitle(p)} — Manufacturing partner`,
    description: p.tagline || excerpt(p.description, 155),
    path: `/manufacturing/${p.slug}`,
    image: p.logo?.url,
  });
}

export default async function PartnerPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [partner, settings] = await Promise.all([getPartner(slug), getSettings()]);
  // Partners without a verified profile are listed on /manufacturing only.
  if (!partner || !hasProfile(partner)) notFound();

  const title = partnerTitle(partner);
  const plants = partner.sites.filter((s) => !PACKAGING_ROLE.test(s.role));
  const support = partner.sites.filter((s) => PACKAGING_ROLE.test(s.role));
  const wa = showFact(settings.contact.whatsapp);
  const waHref = wa ? whatsappUrl(wa.value, productEnquiryMessage(`manufacturing with ${title}`)) : null;
  const facts = [
    { label: "Country", value: partner.location },
    { label: "Region", value: partner.region },
    { label: "Documented sites", value: partner.sites.length ? String(partner.sites.length) : "" },
    { label: "Export markets", value: partner.exportMarkets.length ? String(partner.exportMarkets.length) : "" },
  ].filter((f) => f.value);

  return (
    <>
      <section className="wash-hero relative isolate overflow-hidden">
        <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <RibbonBackdrop className="pointer-events-none absolute -right-10 top-0 -z-10 h-full w-[70%] max-w-4xl" />
        <div className="container-x relative pb-14 pt-10 md:pb-20 md:pt-14">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Manufacturing", path: "/manufacturing" },
              { name: partner.name, path: `/manufacturing/${partner.slug}` },
            ]}
          />
          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="flex max-w-3xl flex-col gap-5" data-reveal>
              <span className="eyebrow">Manufacturing partner</span>
              <h1 className="t-page">{title}</h1>
              {partner.tagline ? <p className="lead max-w-2xl">{partner.tagline}</p> : null}
              <div className="flex flex-wrap gap-3 pt-2">
                {waHref ? (
                  <ButtonLink href={waHref} variant="whatsapp">
                    <WhatsAppIcon size={18} /> Enquire on WhatsApp
                  </ButtonLink>
                ) : null}
                {partner.website ? (
                  <ButtonLink href={partner.website} variant="secondary">
                    Partner website <ExternalIcon size={15} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </ButtonLink>
                ) : null}
              </div>
            </div>
            {partner.logo ? (
              <div className="flex items-center justify-center rounded-[1.75rem] bg-white p-10 shadow-[var(--shadow-ring),var(--shadow-soft)]" data-reveal>
                <Image
                  src={partner.logo.url}
                  alt={`${title} logo`}
                  width={partner.logo.width}
                  height={partner.logo.height}
                  sizes="(min-width: 1024px) 380px, 80vw"
                  className="h-auto max-h-40 w-auto max-w-full object-contain"
                  priority
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white section-y" aria-labelledby="about-heading">
        <div className="container-x grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col gap-5" data-reveal>
            <h2 id="about-heading" className="t-section">
              About {title}
            </h2>
            {paragraphs(partner.description).map((t) => (
              <p key={t.slice(0, 40)} className="text-body">
                {t}
              </p>
            ))}
            {partner.sourceNote ? (
              <p className="mt-2 flex gap-2 rounded-2xl bg-[var(--color-warm)] p-4 text-sm text-muted">
                <DocIcon size={17} className="mt-0.5 shrink-0 text-action" />
                <span>{partner.sourceNote}</span>
              </p>
            ) : null}
          </div>
          {facts.length ? (
            <aside aria-label="At a glance" data-reveal>
              <dl className="divide-y divide-line overflow-hidden rounded-2xl bg-[var(--color-lavender)] shadow-[var(--shadow-ring)]">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-6 px-5 py-4">
                    <dt className="text-sm font-semibold text-ink">{f.label}</dt>
                    <dd className="text-right text-[0.95rem] text-body">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
        </div>
      </section>

      {partner.capabilities.length || partner.certifications.length ? (
        <section className="wash-lavender section-y" aria-labelledby="caps-heading">
          <div className="container-x grid gap-8 md:grid-cols-2">
            {partner.capabilities.length ? (
              <div className="card p-7 md:p-8" data-reveal>
                <h2 id="caps-heading" className="t-card">
                  Capabilities
                </h2>
                <p className="mt-1 text-sm text-muted">As stated by {title.endsWith(".") ? title : `${title}.`}</p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {partner.capabilities.map((c) => (
                    <li key={c} className="flex items-center gap-2.5 text-[0.95rem] text-body">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-mintwash)] text-leaf">
                        <CheckIcon size={13} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {partner.certifications.length ? (
              <div className="card p-7 md:p-8" data-reveal>
                <h2 className="t-card">Certifications</h2>
                <p className="mt-1 text-sm text-muted">As stated by {title} in its company profile.</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {partner.certifications.map((c) => {
                    const mark = markFor(c);
                    return (
                      <li key={c} className="flex items-center gap-3 rounded-2xl bg-[var(--color-warm)] p-3">
                        {mark?.logo ? (
                          <CertificationSeal mark={mark} size="md" />
                        ) : (
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-action shadow-[var(--shadow-ring)]">
                            <ShieldIcon size={22} />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink">{c}</span>
                          {mark ? <span className="block text-xs text-muted">{mark.description}</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {partner.certifications.some((c) => markFor(c)?.note) ? (
                  <p className="mt-4 text-xs leading-relaxed text-muted">{partner.certifications.map((c) => markFor(c)?.note).find(Boolean)}</p>
                ) : null}
                <p className="mt-5 text-xs leading-relaxed text-muted">
                  These marks belong to the partner and its facilities; they are not certifications of Genesis Pure Lifesciences.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {partner.productRanges.length || partner.registrations.length ? (
        <section className="bg-white section-y" aria-labelledby="ranges-heading">
          <div className="container-x grid gap-8 md:grid-cols-2">
            {partner.productRanges.length ? (
              <div data-reveal>
                <h2 id="ranges-heading" className="t-card">
                  Product ranges
                </h2>
                <p className="mt-1 text-sm text-muted">Therapeutic and product ranges {title} states it manufactures.</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {partner.productRanges.map((r) => (
                    <li key={r} className="chip">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {partner.registrations.length ? (
              <div data-reveal>
                <h2 className="t-card">Regulatory registrations</h2>
                <p className="mt-1 text-sm text-muted">Market registrations {title} states it holds — not registrations of Genesis products.</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {partner.registrations.map((r) => {
                    const emblem = markForRegistration(r);
                    return (
                      <li key={r} className="flex items-center gap-3 text-[0.95rem] text-body">
                        {emblem ? (
                          <RegulatorEmblem mark={emblem} />
                        ) : (
                          <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-white text-action shadow-[var(--shadow-ring)]">
                            <ShieldIcon size={18} />
                          </span>
                        )}
                        <span className="min-w-0">{r}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {partner.sites.length ? (
        <section className="bg-white section-y" aria-labelledby="sites-heading">
          <div className="container-x">
            <h2 id="sites-heading" className="t-section" data-reveal>
              Documented sites
            </h2>
            <ul className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...plants, ...support].map((s, i) => (
                <li key={`${s.name}-${i}`} className="card flex h-full flex-col gap-2 p-5" data-reveal style={{ ["--reveal-delay" as string]: i % 3 }}>
                  {s.role ? (
                    <span className={`chip self-start ${PACKAGING_ROLE.test(s.role) ? "chip-neutral" : "chip-green"}`}>{s.role}</span>
                  ) : null}
                  <p className="font-display text-[1.05rem] font-semibold text-ink">{s.name}</p>
                  {s.location ? (
                    <p className="flex items-start gap-2 text-sm text-body">
                      <PinIcon size={15} className="mt-0.5 shrink-0 text-action" />
                      {s.location}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {partner.exportMarkets.length ? (
        <section className="wash-mint section-y" aria-labelledby="markets-heading">
          <div className="container-x">
            <h2 id="markets-heading" className="t-section" data-reveal>
              Export markets
            </h2>
            <p className="mt-3 max-w-2xl text-body">
              Markets {title} states it exports to. These are the partner&rsquo;s own markets, not countries where Genesis products are sold.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" data-reveal>
              {partner.exportMarkets.map((m) => (
                <li key={m} className="chip chip-neutral">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {partner.notes.length ? (
        <section className="container-x pt-12" aria-labelledby="notes-heading">
          <div className="rounded-[1.5rem] bg-[var(--color-peach)] p-6 shadow-[var(--shadow-ring)] md:p-8" data-reveal>
            <h2 id="notes-heading" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <AlertIcon size={18} className="text-action" /> Notes on this profile
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {partner.notes.map((n) => (
                <li key={n.slice(0, 48)} className="text-[0.95rem] leading-relaxed text-body">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="container-x pt-10">
        <Link href="/manufacturing" className="inline-flex items-center gap-2 text-sm font-semibold text-action hover:text-action-strong">
          <ArrowLeft size={16} /> All manufacturing partners
        </Link>
      </div>
      <CtaBand title="Talk to us about manufacturing and partnerships." whatsappHref={waHref} />
    </>
  );
}
