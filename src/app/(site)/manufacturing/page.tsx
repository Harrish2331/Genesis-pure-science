import Image from "next/image";
import Link from "next/link";
import { Molecule } from "@/components/brand/Motifs";
import { PartnerCard } from "@/components/content/PartnerCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { CertificationRow } from "@/components/content/Certifications";
import { EmptyState } from "@/components/sections/EmptyState";
import { PageHero } from "@/components/sections/PageHero";
import { StatsBand } from "@/components/sections/StatsBand";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon, ShieldIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getPartners,
  getProducts,
  getSettings,
  showCopy,
  showFact,
} from "@/lib/content/public";
import {
  PACKAGING_ROLE,
  hasProfile,
  partnerPath,
  partnerTitle,
  unionOf,
} from "@/lib/content/partners";
import { pageMetadata } from "@/lib/seo";
import { slugify } from "@/lib/text";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Manufacturing & Quality",
  description:
    "The manufacturing partners Genesis Pure Lifesciences works with, their stated capabilities and certifications, and the dosage forms in the Genesis range.",
  path: "/manufacturing",
});

const ENQUIRY_TOPIC = "manufacturing and partnership opportunities";

export default async function ManufacturingPage() {
  const [settings, partners, products] = await Promise.all([
    getSettings(),
    getPartners(),
    getProducts(),
  ]);
  const c = settings.copy;
  const wa = showFact(settings.contact.whatsapp);
  const waTopic = wa
    ? whatsappUrl(wa.value, productEnquiryMessage(ENQUIRY_TOPIC))
    : null;

  const profiled = partners.filter(hasProfile);
  const capabilities = unionOf(partners, (p) => p.capabilities);
  const withCaps = partners.filter((p) => p.capabilities.length);
  const sites = partners.reduce((n, p) => n + p.sites.length, 0);
  const packagingSites = partners.flatMap((p) =>
    p.sites
      .filter((s) => PACKAGING_ROLE.test(s.role))
      .map((s) => ({ ...s, partner: p })),
  );
  const exporters = partners.filter((p) => p.exportMarkets.length);
  const certified = partners.filter((p) => p.certifications.length);

  // Dosage forms actually present in the published Genesis range.
  const forms = Array.from(
    products
      .filter((p) => p.dosageForm)
      .reduce((m, p) => {
        const key = slugify(p.dosageForm);
        const cur = m.get(key) ?? { label: p.dosageForm, count: 0 };
        m.set(key, { ...cur, count: cur.count + 1 });
        return m;
      }, new Map<string, { label: string; count: number }>()),
  ).sort(
    (a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label),
  );

  const stats = [
    { value: partners.length, label: "Manufacturing partners" },
    ...(sites ? [{ value: sites, label: "Documented partner sites" }] : []),
    ...(capabilities.length
      ? [{ value: capabilities.length, label: "Partner capability areas" }]
      : []),
    ...(forms.length
      ? [{ value: forms.length, label: "Dosage forms in our range" }]
      : []),
  ];

  return (
    <>
      <PageHero
        eyebrow="Manufacturing"
        title="Manufacturing & quality"
        intro={showCopy(c.manufacturingIntro)}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Manufacturing", path: "/manufacturing" },
        ]}
      >
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="#partners" arrow>
            Our partners
          </ButtonLink>
          {waTopic ? (
            <ButtonLink href={waTopic} variant="whatsapp">
              <WhatsAppIcon size={18} /> Enquire on WhatsApp
            </ButtonLink>
          ) : null}
        </div>
      </PageHero>

      {/* ── How we work ─────────────────────────────────────────────── */}
      <section className="bg-white section-y" aria-labelledby="model-heading">
        <div className="container-x grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <figure
            className="relative overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-ring),var(--shadow-soft)]"
            data-reveal
          >
            <Image
              src="/images/manufacturing/manufacturing-network.webp"
              alt="Illustration of a pharmaceutical manufacturing and distribution network"
              width={1774}
              height={887}
              sizes="(min-width: 1024px) 560px, 100vw"
              loading="eager"
              className="h-auto w-full"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.72rem] font-medium text-muted">
              Illustrative image
            </figcaption>
          </figure>
          <div className="flex flex-col gap-5" data-reveal>
            <span className="eyebrow">Our model</span>
            <h2 id="model-heading" className="t-section">
              Made by specialist partners, brought to market by Genesis
            </h2>
            <p className="text-body">
              Genesis Pure Lifesciences works with dedicated manufacturing
              partners. The capabilities, sites and certifications shown on this
              page are taken from each partner&rsquo;s own company profile and
              are credited to that partner.
            </p>
            <ul className="grid gap-3 text-[0.95rem] text-body">
              {[
                `${partners.length} manufacturing partner${partners.length === 1 ? "" : "s"}${profiled.length ? `, ${profiled.length} with a published profile` : ""}`,
                forms.length
                  ? `${forms.length} dosage forms across the ${products.length} products in the Genesis range`
                  : "",
                certified.length
                  ? "Certification marks shown exactly as each partner states them"
                  : "",
              ]
                .filter(Boolean)
                .map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-mintwash)] text-leaf">
                      <CheckIcon size={14} />
                    </span>
                    {t}
                  </li>
                ))}
            </ul>
          </div>
        </div>
        {stats.length > 1 ? (
          <div className="container-x mt-16">
            <StatsBand stats={stats} />
          </div>
        ) : null}
      </section>

      {/* ── Partners ────────────────────────────────────────────────── */}
      <section
        id="partners"
        className="wash-lavender relative isolate scroll-mt-24 overflow-hidden section-y"
        aria-labelledby="partners-heading"
      >
        <div
          className="pattern-hex pattern-fade pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />
        <div className="container-x">
          <SectionHeader
            eyebrow="Partners"
            title={
              <span id="partners-heading">Our manufacturing partners</span>
            }
          />
          {partners.length ? (
            <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {partners.map((p, i) => (
                <li key={p.id}>
                  <PartnerCard partner={p} index={i} />
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-12">
              <EmptyState title="Partner information is being prepared" />
            </div>
          )}
        </div>
      </section>

      {/* ── Capabilities by partner ──────────────────────────────────── */}
      {withCaps.length ? (
        <section
          className="bg-white section-y"
          aria-labelledby="capabilities-heading"
        >
          <div className="container-x">
            <SectionHeader
              eyebrow="Capabilities"
              title={
                <span id="capabilities-heading">
                  Manufacturing capabilities
                </span>
              }
              intro="What each partner states it manufactures, from its own company profile."
            />
            <ul className="mt-10 divide-y divide-line overflow-hidden rounded-[1.5rem] bg-white shadow-[var(--shadow-ring)]">
              {withCaps.map((p, i) => (
                <li
                  key={p.id}
                  className={`grid gap-4 px-5 py-5 md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-8 md:px-7 ${i % 2 ? "bg-[var(--color-warm)]" : ""}`}
                  data-reveal
                >
                  <div className="flex items-center gap-3">
                    {p.logo ? (
                      <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-[var(--shadow-ring)]">
                        <Image
                          src={p.logo.url}
                          alt=""
                          width={p.logo.width}
                          height={p.logo.height}
                          sizes="80px"
                          className="h-auto max-h-full w-auto max-w-full object-contain"
                        />
                      </span>
                    ) : null}
                    <span className="font-display text-[0.98rem] font-semibold leading-snug text-ink">
                      {hasProfile(p) ? (
                        <Link
                          href={partnerPath(p)}
                          className="hover:text-action"
                        >
                          {partnerTitle(p)}
                        </Link>
                      ) : (
                        partnerTitle(p)
                      )}
                    </span>
                  </div>
                  <ul
                    className="flex flex-wrap gap-1.5"
                    aria-label={`Capabilities stated by ${partnerTitle(p)}`}
                  >
                    {p.capabilities.map((c) => (
                      <li key={c} className="chip chip-neutral">
                        {c}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ── Dosage forms in the Genesis range ───────────────────────── */}
      {forms.length ? (
        <section
          className="wash-sky relative isolate overflow-hidden section-y"
          aria-labelledby="forms-heading"
        >
          <div
            className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-70"
            aria-hidden="true"
          />
          <div className="container-x">
            <SectionHeader
              eyebrow="Dosage forms"
              title={<span id="forms-heading">Dosage forms in our range</span>}
              intro={`The forms in which the ${products.length} products in the Genesis catalogue are presented.`}
              action={
                <ButtonLink href="/products" variant="ghost" arrow>
                  Browse all products
                </ButtonLink>
              }
            />
            <ul className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {forms.map(([slug, f], i) => (
                <li
                  key={slug}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: i % 4 }}
                >
                  <Link
                    href={`/products?form=${slug}`}
                    className="card card-hover flex h-full items-center justify-between gap-4 p-5"
                  >
                    <span className="font-medium text-ink">{f.label}</span>
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--color-skywash)] px-2 font-display text-sm font-semibold tabular-nums text-action">
                      {f.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ── Quality ─────────────────────────────────────────────────── */}
      <section
        id="quality"
        className="wash-peach relative isolate scroll-mt-24 overflow-hidden section-y"
        aria-labelledby="quality-heading"
      >
        <div
          className="pattern-hex pattern-fade pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />
        <div className="container-x grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="flex flex-col gap-5 lg:order-2" data-reveal>
            <span className="eyebrow">Quality</span>
            <h2 id="quality-heading" className="t-section">
              Quality assurance &amp; control
            </h2>
            <CopyText
              copy={showCopy(c.qualityCommitment)}
              className="text-body"
            />
            {certified.length ? (
              <div className="flex flex-col gap-4 pt-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  {certified.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-white/85 p-4 shadow-[var(--shadow-ring)]"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <ShieldIcon size={17} className="text-action" />{" "}
                        {partnerTitle(p)}
                      </p>
                      <div className="mt-3">
                        <CertificationRow claims={p.certifications} partnerName={partnerTitle(p)} size="md" />
                      </div>
                      <ul
                        className="mt-3 flex flex-wrap gap-1.5"
                        aria-label={`Certifications stated by ${partnerTitle(p)}`}
                      >
                        {p.certifications.map((cert) => (
                          <li key={cert} className="chip chip-green">
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  Certification marks are as stated by each partner in its
                  company profile. They belong to the partner and its facilities
                  and are not claimed as certifications of Genesis Pure
                  Lifesciences.
                </p>
              </div>
            ) : null}
          </div>
          <figure
            className="relative overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-ring),var(--shadow-soft)] lg:order-1"
            data-reveal
          >
            <Image
              src="/images/manufacturing/quality-check.webp"
              alt="Illustration of a quality-control check in a pharmaceutical laboratory"
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.72rem] font-medium text-muted">
              Illustrative image
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Packaging & support units ───────────────────────────────── */}
      {packagingSites.length ? (
        <section
          className="bg-white section-y"
          aria-labelledby="packaging-heading"
        >
          <div className="container-x">
            <SectionHeader
              eyebrow="Packaging"
              title={
                <span id="packaging-heading">
                  Packaging &amp; printing support
                </span>
              }
              intro="Bottling and printing units documented in partners’ company profiles."
            />
            <ul className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-3">
              {packagingSites.map((s, i) => (
                <li
                  key={`${s.partner.id}-${s.name}`}
                  className="card flex h-full flex-col gap-2 p-6"
                  data-reveal
                  style={{ ["--reveal-delay" as string]: i }}
                >
                  <span className="chip chip-neutral self-start">{s.role}</span>
                  <p className="mt-1 font-display text-lg font-semibold text-ink">
                    {s.name}
                  </p>
                  {s.location ? (
                    <p className="text-sm text-body">{s.location}</p>
                  ) : null}
                  <p className="mt-auto pt-2 text-xs text-muted">
                    Part of {partnerTitle(s.partner)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ── Partner export reach ────────────────────────────────────── */}
      {exporters.length ? (
        <section
          className="wash-mint relative isolate overflow-hidden section-y"
          aria-labelledby="reach-heading"
        >
          <Molecule
            className="absolute right-[6%] top-12 hidden opacity-70 md:block"
            size={84}
          />
          <div className="container-x">
            <SectionHeader
              eyebrow="Reach"
              title={<span id="reach-heading">Partner export reach</span>}
              intro="Markets that partners state they export to. These are the partners’ own markets, not a list of countries where Genesis products are sold."
            />
            <div className="mt-10 flex flex-col gap-8">
              {exporters.map((p) => (
                <div
                  key={p.id}
                  className="rounded-[1.5rem] bg-white/85 p-6 shadow-[var(--shadow-ring)] md:p-8"
                  data-reveal
                >
                  <p className="font-display text-lg font-semibold text-ink">
                    {partnerTitle(p)}{" "}
                    <span className="text-sm font-medium text-muted">
                      · {p.exportMarkets.length} markets
                    </span>
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.exportMarkets.map((m) => (
                      <li key={m} className="chip chip-neutral">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        title="Talk to us about manufacturing and partnerships."
        body="For business, distribution or partnership enquiries, our team will be glad to help."
        whatsappHref={waTopic}
      />
    </>
  );
}
