import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/content/images";
import { FOCUS_TILES, type FocusTile } from "@/content/site";
import { CapsuleGlyph, CrossGlyph, HeartGlyph, LeafGlyph, Molecule, Sprout } from "@/components/brand/Motifs";
import { ArrowRight } from "@/components/ui/Icons";
import type { Product } from "@/lib/content/types";

const ICONS: Record<FocusTile["icon"], (p: { size?: number }) => React.ReactNode> = {
  leaf: LeafGlyph,
  molecule: Molecule,
  sprout: Sprout,
  heart: HeartGlyph,
  capsule: CapsuleGlyph,
  cross: CrossGlyph,
};

/** The medallion's colour, one pastel per area from the extended palette. */
const DISC: Record<FocusTile["tint"], string> = {
  lavender: "from-[#e9e1ff] via-[#f5f1ff] to-white",
  sky: "from-[#cfe9fa] via-[#eaf5fd] to-white",
  peach: "from-[#ffdcc6] via-[#fff2ea] to-white",
  mint: "from-[#cdeedb] via-[#ecf8f1] to-white",
  blue: "from-[#d5e0fa] via-[#eef2fd] to-white",
  teal: "from-[#c5ebe7] via-[#e8f6f5] to-white",
};

/**
 * The pack that represents each area in its medallion: a real product from
 * that area, on a clean white background (blended into the disc with
 * multiply), and never a prescription medicine — this is a promotional
 * section. Areas without one show their brand glyph instead.
 */
const VISUAL: Partial<Record<string, string>> = {
  gynaecology: "femulet",
  fertility: "meta-coq",
  "womens-wellness": "d-vits-60k",
  "general-medicine": "encical",
};

/**
 * The supplied artwork sits on a lightly tinted ground, not pure white: fade
 * its outer edges so it melts into the section instead of showing as a box.
 * (A static mask, painted once.)
 */
const ART_EDGE_FADE: React.CSSProperties = {
  maskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent), linear-gradient(180deg, transparent, #000 6%, #000 94%, transparent)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent), linear-gradient(180deg, transparent, #000 6%, #000 94%, transparent)",
  WebkitMaskComposite: "source-in",
};

/**
 * Our focus areas, composed after the supplied reference: a row of circular
 * medallions with the subject rising out of the top of each circle, then a
 * two-tone heading — a repeated lead phrase over the area's name — a short
 * caption and a "Know more" link, all centred, on a light ground with soft
 * flowing lines. Three across on desktop, two on tablet, one on phones.
 *
 * Where Genesis has supplied the area's artwork (IMAGES.focus in
 * src/content/images.ts) it is shown whole — it already carries the medallion,
 * title and caption — and the same words stay in the page as text for screen
 * readers and search. Areas without artwork keep the composed medallion.
 */
export function FocusShowcase({ products }: { products: Product[] }) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute inset-x-0 top-[18%] -z-10 h-[60%] w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M-20 260C220 140 420 330 640 220S1010 90 1220 200" stroke="#20a7db" strokeOpacity="0.14" strokeWidth="1.5" />
        <path d="M-20 300C240 190 440 360 660 260S1020 140 1220 250" stroke="#41b183" strokeOpacity="0.12" strokeWidth="1.5" />
        <path d="M-20 220C200 110 400 290 620 190S990 50 1220 160" stroke="#9bd96b" strokeOpacity="0.12" strokeWidth="1.2" />
      </svg>
      <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {FOCUS_TILES.map((t, i) => {
          const Icon = ICONS[t.icon];
          const count = products.filter((p) => p.category === t.category && (!t.sub || p.subcategories.includes(t.sub))).length;
          const art = IMAGES.focus[t.id];
          if (art) {
            return (
              <li key={t.id} className="flex flex-col items-center text-center" data-reveal style={{ ["--reveal-delay" as string]: i % 3 }}>
                <Link href={t.href} className="group block w-full max-w-[22rem]" aria-label={`${t.label} — ${count ? `${count} products` : t.brand ?? "explore"}`}>
                  <Image
                    src={art.src}
                    alt={art.alt}
                    width={art.width}
                    height={art.height}
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 45vw, 92vw"
                    quality={90}
                    className="h-auto w-full mix-blend-multiply transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-1.5"
                    style={ART_EDGE_FADE}
                  />
                </Link>
                <h3 className="sr-only">Excellence in {t.label}</h3>
                <p className="sr-only">{t.short}</p>
                {t.brand ? (
                  <p className="-mt-1 text-sm font-semibold text-slate">
                    by <span className="text-[#027d7b]">{t.brand}</span>
                  </p>
                ) : null}
                <Link
                  href={t.href}
                  className="group/k mt-3 inline-flex items-center gap-2 text-sm font-semibold text-action hover:underline"
                >
                  Know more
                  {count ? <span className="font-medium text-muted">· {count} product{count === 1 ? "" : "s"}</span> : null}
                  <ArrowRight size={15} className="transition-transform group-hover/k:translate-x-0.5" />
                </Link>
              </li>
            );
          }
          const pack = products.find((p) => p.slug === VISUAL[t.id] && p.image && !p.prescriptionOnly);
          return (
            <li key={t.id} className="flex flex-col items-center text-center" data-reveal style={{ ["--reveal-delay" as string]: i % 3 }}>
              <Link href={t.href} className="group block w-full max-w-[16.5rem]" aria-label={`${t.label} — ${count ? `${count} products` : "explore"}`}>
                {/* Stage: a disc at the bottom; above it the clip is open, so the subject rises out of the circle. */}
                <div className="relative aspect-[1/1.14] w-full">
                  <div
                    className={`absolute inset-x-0 bottom-0 aspect-square rounded-full bg-gradient-to-b ${DISC[t.tint]} shadow-[inset_0_0_0_1px_rgb(255_255_255/0.9),0_24px_48px_-28px_rgb(8_87_143/0.45)] transition-transform duration-500 group-hover:scale-[1.03]`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 overflow-hidden rounded-b-full">
                    {pack?.image ? (
                      <>
                        <span className="absolute bottom-[22%] left-1/2 h-[8%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(16_42_67/0.22),transparent)]" aria-hidden="true" />
                        <Image
                          src={pack.image.url}
                          alt=""
                          width={pack.image.width}
                          height={pack.image.height}
                          sizes="(min-width: 1024px) 264px, (min-width: 640px) 40vw, 80vw"
                          className="absolute bottom-[24%] left-1/2 h-[66%] w-[104%] max-w-none -translate-x-1/2 object-contain object-bottom mix-blend-multiply transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-2"
                        />
                      </>
                    ) : (
                      <span className="absolute inset-x-0 bottom-[18%] flex justify-center transition-transform duration-500 group-hover:-translate-y-2">
                        <span className="flex h-28 w-28 items-center justify-center rounded-full bg-white/85 shadow-[0_18px_40px_-18px_rgb(8_87_143/0.45)] ring-1 ring-white">
                          <Icon size={60} />
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <h3 className="mt-7 font-display leading-[1.08] tracking-[-0.02em]">
                <span className="block text-[1.4rem] font-semibold text-action">Excellence in</span>
                <span className="grad-text block pb-[0.08em] text-[1.85rem] font-semibold">{t.label}</span>
              </h3>
              <p className="mt-3 max-w-[17rem] text-[0.98rem] leading-relaxed text-body">{t.short}</p>
              <Link
                href={t.href}
                className="group/k mt-4 inline-flex items-center gap-2 text-sm font-semibold text-action hover:underline"
              >
                Know more
                {count ? <span className="font-medium text-muted">· {count} product{count === 1 ? "" : "s"}</span> : null}
                <ArrowRight size={15} className="transition-transform group-hover/k:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
