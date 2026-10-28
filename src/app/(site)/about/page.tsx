import { FOCUS_AREAS } from "@/content/site";
import { CapsuleGlyph, CrossGlyph, LeafGlyph, Molecule, RibbonBackdrop, Sprout } from "@/components/brand/Motifs";
import { IllustrativeImage } from "@/components/sections/IllustrativeImage";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { CopyText } from "@/components/ui/CopyText";
import { NetworkCertifications } from "@/components/content/Certifications";
import { getPartners, getSettings, showCopy, showFact } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";
import Link from "next/link";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "About Genesis",
  description:
    "Who we are, our vision and mission, the values we work by and our commitment to quality across women’s health and general medicine.",
  path: "/about",
});

const GLYPHS = { leaf: LeafGlyph, capsule: CapsuleGlyph, cross: CrossGlyph };

export default async function AboutPage() {
  const [settings, partners] = await Promise.all([getSettings(), getPartners()]);
  const c = settings.copy;
  const wa = showFact(settings.contact.whatsapp);

  return (
    <>
      <PageHero
        eyebrow="About Genesis"
        title="About Genesis Pure Lifesciences"
        intro={showCopy(c.aboutIntro)}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      {/* Who we are */}
      <section className="section-y !pt-6" aria-labelledby="who-heading">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col gap-5" data-reveal>
            <span className="eyebrow">Who we are</span>
            <h2 id="who-heading" className="t-section">
              A pharmaceutical company with two areas of focus
            </h2>
            <CopyText copy={showCopy(c.whoWeAre)} className="lead" />
            <CopyText copy={showCopy(c.scienceFocus)} className="text-body" />
          </div>
          <div data-reveal>
            <IllustrativeImage
              src="/placeholder/who we are.png"
              width={1536}
              height={1024}
              alt="Pharmaceutical laboratory bench with capsules, glassware and a microscope, beside a DNA helix and icons for medicine, women’s health and care"
            />
          </div>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="wash-lavender relative isolate overflow-hidden section-y" aria-labelledby="vm-heading">
        <RibbonBackdrop className="pointer-events-none absolute -right-16 top-0 h-full w-1/2 opacity-80" />
        <div className="container-x relative">
          <h2 id="vm-heading" className="sr-only">
            Vision and mission
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { label: "Our vision", copy: showCopy(c.vision), Icon: Molecule },
              { label: "Our mission", copy: showCopy(c.mission), Icon: Sprout },
            ].map(({ label, copy, Icon }, i) => (
              <article
                key={label}
                className="card relative flex flex-col gap-5 overflow-hidden p-8 md:p-11"
                data-reveal
                style={{ ["--reveal-delay" as string]: i }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[image:var(--grad-line)]" aria-hidden="true" />
                <Icon size={44} />
                <h3 className="eyebrow">{label}</h3>
                <CopyText copy={copy} className="font-display text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)] font-medium leading-snug tracking-[-0.015em] text-ink" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="wash-warm relative isolate overflow-hidden section-y" aria-labelledby="values-heading">
        <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="container-x">
          <div className="flex max-w-3xl flex-col gap-4" data-reveal>
            <span className="eyebrow">Core values</span>
            <h2 id="values-heading" className="t-section">
              The values we work by
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {settings.values.items.map((v, i) => (
              <li
                key={v.title}
                className="card card-hover flex flex-col gap-3 p-6"
                data-reveal
                style={{ ["--reveal-delay" as string]: i }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint">
                  <Sprout size={24} />
                </span>
                <h3 className="t-card">{v.title}</h3>
                <p className="text-[0.95rem] leading-relaxed text-body">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quality */}
      <section className="wash-sky section-y" aria-labelledby="quality-heading">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <IllustrativeImage
              src="/placeholder/commitment to quality.png"
              width={1448}
              height={1086}
              alt="Scientist in protective gloves, mask and glasses inspecting a vial and a tray of capsules in a pharmaceutical laboratory"
            />
          </div>
          <div className="flex flex-col gap-5" data-reveal>
            <span className="eyebrow">Commitment to quality</span>
            <h2 id="quality-heading" className="t-section">
              Our commitment to quality
            </h2>
            <CopyText copy={showCopy(c.qualityCommitment)} className="text-body" />
          </div>
        </div>
        <div className="container-x mt-14">
          <NetworkCertifications partners={partners} tone="card" />
        </div>
      </section>

      {/* Scientific focus → categories */}
      <section className="wash-peach section-y" aria-labelledby="focus-heading">
        <div className="container-x">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-reveal>
            <div className="flex max-w-2xl flex-col gap-4">
              <span className="eyebrow">Scientific & pharmaceutical focus</span>
              <h2 id="focus-heading" className="t-section">
                Our areas of focus
              </h2>
            </div>
            <ButtonLink href="/products" arrow>
              Explore our products
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {FOCUS_AREAS.map((cat) => {
              const G = GLYPHS[cat.motif];
              return (
                <li key={cat.id} data-reveal>
                  <Link href={cat.focusHref} className="card card-hover flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist">
                      <G size={28} />
                    </span>
                    <span>
                      <span className="block font-display text-lg font-semibold text-ink">{cat.label}</span>
                      <span className="block text-sm text-muted">{cat.short}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand whatsappHref={wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null} />
    </>
  );
}
