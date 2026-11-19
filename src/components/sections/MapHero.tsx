import Link from "next/link";
import { CapsuleGlyph, CrossGlyph, LeafGlyph } from "@/components/brand/Motifs";
import { ArrowRight } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import type { SiteImage } from "@/content/images";
import type { ShownCopy } from "@/lib/content/public";
import { BackdropSection } from "./BackdropSection";
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
 * A page heading over a full-width dark image (a dark BackdropSection — on
 * Our Focus, the laboratory scene): the image is the section's background,
 * the heading sits over its darker side,
 * and the focus areas run along the foot as links to their sections.
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
  return (
    <BackdropSection
      image={map}
      tone="dark"
      fade="#050d1a"
      priority
      labelledBy="map-hero-heading"
      minHeight="lg:min-h-[34rem]"
      after={
        <ul className="grid gap-3 md:grid-cols-3 md:gap-4" aria-label="Focus areas" data-reveal>
          {areas.map((a) => {
            const G = GLYPH[a.motif];
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="group flex h-full items-center gap-4 rounded-2xl bg-[#050d1a]/55 p-4 ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-[#050d1a]/70 hover:ring-white/30 md:p-5"
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
      }
    >
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={crumbs} tone="light" />
        <span className="eyebrow mt-3 !text-[#9ce8e8]">{eyebrow}</span>
        <h1 id="map-hero-heading" className="t-page text-white">
          {title}
        </h1>
        {typeof intro === "string" ? (
          intro ? <p className="lead !text-white/80">{intro}</p> : null
        ) : intro ? (
          <CopyText copy={intro} className="lead !text-white/80" />
        ) : null}
      </div>
    </BackdropSection>
  );
}
