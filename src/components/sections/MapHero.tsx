import Image from "next/image";
import Link from "next/link";
import { CapsuleGlyph, CrossGlyph, LeafGlyph } from "@/components/brand/Motifs";
import { ArrowRight } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import type { SiteImage } from "@/content/images";
import type { ShownCopy } from "@/lib/content/public";
import { Breadcrumbs, type Crumb } from "./PageHero";

const GLYPH = { leaf: LeafGlyph, capsule: CapsuleGlyph, cross: CrossGlyph };

export type MapHeroArea = {
  id: string;
  label: string;
  /** Short line under the label, e.g. "16 products". */
  note: string;
  href: string;
  motif: keyof typeof GLYPH;
};

/**
 * A page heading built around a full-width world map.
 *
 * Wide screens: the map spans the whole section behind the heading, which
 * sits over its darker (Atlantic) side, with the focus areas along the foot.
 * Phones and tablets: there is no room to set text over the map without
 * hiding it, so the map runs edge to edge as its own band between the
 * introduction and the focus areas.
 *
 * Both map images use identical image props, so the browser downloads the
 * file once. No animation beyond the site's usual reveal.
 */
export function MapHero({
  eyebrow,
  title,
  intro,
  crumbs,
  map,
  areas,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: ShownCopy | string;
  crumbs: Crumb[];
  map: SiteImage;
  areas: MapHeroArea[];
}) {
  const mapImage = (className: string) => (
    <Image src={map.src} alt={map.alt} fill priority quality={85} sizes="100vw" className={className} />
  );
  const caption = "Illustrative image";

  return (
    <section
      className="relative isolate overflow-hidden bg-[#050d1a] lg:flex lg:min-h-[46rem] lg:flex-col"
      aria-labelledby="map-hero-heading"
    >
      {/* Wide screens: the map behind everything, with a shade under the text. */}
      {/* Only one of the two maps is ever displayed, so screen readers meet its description once. */}
      <div className="absolute inset-0 -z-10 hidden lg:block">
        {mapImage("object-cover object-center")}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050d1a_0%,rgb(5_13_26/0.9)_28%,rgb(5_13_26/0.4)_56%,rgb(5_13_26/0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050d1a] to-transparent" />
      </div>

      <div className="container-x relative pt-10 md:pt-14">
        <Breadcrumbs items={crumbs} tone="light" />
        <div className="mt-10 flex max-w-xl flex-col gap-5 md:mt-14" data-reveal>
          <span className="eyebrow !text-[#9ce8e8]">{eyebrow}</span>
          <h1 id="map-hero-heading" className="t-page text-white">
            {title}
          </h1>
          {typeof intro === "string" ? (
            intro ? <p className="lead !text-white/80">{intro}</p> : null
          ) : intro ? (
            <CopyText copy={intro} className="lead !text-white/80" />
          ) : null}
        </div>
      </div>

      {/* Phones and tablets: the map as a full-width band, faded into the section. */}
      <figure className="relative mt-8 aspect-[4/3] w-full sm:aspect-[2/1] lg:hidden">
        {mapImage(
          "object-cover object-[72%_50%] sm:object-center [mask-image:linear-gradient(180deg,transparent,#000_16%,#000_84%,transparent)]",
        )}
        <figcaption className="absolute bottom-3 right-4 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/55">
          {caption}
        </figcaption>
      </figure>

      <div className="container-x relative pb-12 pt-4 lg:mt-auto lg:pt-14">
        <ul className="grid gap-3 md:grid-cols-3 md:gap-4" aria-label="Focus areas" data-reveal>
          {areas.map((a) => {
            const G = GLYPH[a.motif];
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="group flex h-full items-center gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 transition-colors hover:bg-white/[0.12] hover:ring-white/30 md:p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_-14px_rgb(0_0_0/0.6)]">
                    <G size={28} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.05rem] font-semibold leading-snug text-white">{a.label}</span>
                    <span className="block text-sm text-white/65">{a.note}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-white/55 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 hidden text-right text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/45 lg:block">{caption}</p>
      </div>
    </section>
  );
}
