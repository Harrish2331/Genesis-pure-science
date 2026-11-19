import Image from "next/image";
import type { SiteImage } from "@/content/images";

/**
 * A section whose image is its background: the picture covers the whole
 * section and the heading, text and actions are layered over it.
 *
 * Wide screens: the image fills the section edge to edge; a soft veil on the
 * text side (white, or navy for dark artwork) keeps the copy readable while
 * the far side of the picture shows clearly.
 *
 * Phones and tablets: there is no room for text beside the subject, so the
 * image fills the top of the section and fades into the section colour; the
 * content sits in a near-opaque panel that overlaps it. Still one layer of
 * background, one layer of content.
 *
 * `children` is the overlaid text block. `after` is optional full-width
 * content (cards, lists) that follows it over the same background.
 * The image's focal point comes from its `focus` in src/content/images.ts.
 */
export function BackdropSection({
  image,
  side = "left",
  tone = "light",
  priority = false,
  caption = "Illustrative image",
  fade = "#ffffff",
  labelledBy,
  id,
  className = "",
  minHeight = "lg:min-h-[34rem]",
  contentWidth = "lg:max-w-[36rem]",
  children,
  after,
}: {
  image: SiteImage;
  /** Where the text sits on wide screens; the picture's subject shows on the other side. */
  side?: "left" | "right";
  /** "dark" for dark artwork: navy veil, white text. */
  tone?: "light" | "dark";
  /** True for the first section of a page (its largest element). */
  priority?: boolean;
  /** Small label on the picture; null for a photograph of Genesis itself. */
  caption?: string | null;
  /** The colour the image fades into on phones (the section's own colour). */
  fade?: string;
  labelledBy?: string;
  id?: string;
  className?: string;
  /** Minimum height on wide screens, as a Tailwind class. */
  minHeight?: string;
  /** Width of the text block on wide screens, as a Tailwind class (narrower keeps a central subject clear). */
  contentWidth?: string;
  children: React.ReactNode;
  after?: React.ReactNode;
}) {
  const right = side === "right";
  const dark = tone === "dark";

  const wideVeil = dark
    ? right
      ? "lg:bg-[linear-gradient(270deg,#050d1a_0%,rgb(5_13_26/0.88)_30%,rgb(5_13_26/0.42)_58%,rgb(5_13_26/0.12)_100%)]"
      : "lg:bg-[linear-gradient(90deg,#050d1a_0%,rgb(5_13_26/0.88)_30%,rgb(5_13_26/0.42)_58%,rgb(5_13_26/0.12)_100%)]"
    : right
      ? "lg:bg-[linear-gradient(270deg,rgb(255_255_255/0.97)_0%,rgb(255_255_255/0.93)_38%,rgb(255_255_255/0.55)_62%,rgb(255_255_255/0.06)_100%)]"
      : "lg:bg-[linear-gradient(90deg,rgb(255_255_255/0.97)_0%,rgb(255_255_255/0.93)_38%,rgb(255_255_255/0.55)_62%,rgb(255_255_255/0.06)_100%)]";

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundColor: fade, ["--fade" as string]: fade }}
    >
      {/* ── Background layer ─────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[17rem] sm:h-[24rem] lg:inset-y-0 lg:h-auto">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          quality={90}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
        {/* Phones/tablets: fade the picture into the section colour. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,var(--fade)_100%)] lg:hidden" />
        {/* Wide screens: the veil under the text, plus a faint brand tint in the text-side corner. */}
        <div className={`absolute inset-0 hidden lg:block ${wideVeil}`} />
        {dark ? null : (
          <div
            className={`absolute inset-0 hidden lg:block ${
              right
                ? "bg-[radial-gradient(ellipse_55%_70%_at_100%_100%,rgb(155_217_107/0.16),transparent_70%)]"
                : "bg-[radial-gradient(ellipse_55%_70%_at_0%_100%,rgb(155_217_107/0.16),transparent_70%)]"
            }`}
          />
        )}
        {dark ? <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-[#050d1a] to-transparent lg:block" /> : null}
        {caption ? (
          <p
            className={`absolute top-3 rounded-full px-3 py-1 text-[0.7rem] font-medium lg:bottom-4 lg:top-auto ${
              right ? "right-3 lg:left-4 lg:right-auto" : "right-3 lg:right-4"
            } ${dark ? "bg-white/10 text-white/70" : "bg-white/85 text-muted"}`}
          >
            {caption}
          </p>
        ) : null}
      </div>

      {/* ── Content layer ────────────────────────────────────────────── */}
      <div
        className={`container-x relative flex pt-[12.5rem] sm:pt-[19rem] lg:items-center lg:py-20 ${minHeight} ${
          right ? "lg:justify-end" : ""
        } ${after ? "" : "pb-14 lg:pb-20"}`}
      >
        <div
          className={`w-full ${contentWidth} ${
            dark
              ? ""
              : "rounded-[1.75rem] bg-white/95 p-6 shadow-[var(--shadow-ring),var(--shadow-soft)] sm:p-9 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
          }`}
          data-reveal
        >
          {children}
        </div>
      </div>
      {after ? <div className="container-x relative pb-14 pt-10 lg:pb-20 lg:pt-4">{after}</div> : null}
    </section>
  );
}
