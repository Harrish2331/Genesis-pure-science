import Image from "next/image";

/**
 * The official Genesis Pure Lifesciences logo.
 *
 * Source: the approved artwork (grey/slate wordmark variation), trimmed of its
 * white margin by tools/brand_assets.py and otherwise untouched — never
 * redrawn, recoloured, stretched or rearranged. Width is always derived from
 * height so the proportions are fixed.
 *
 * The file has a white backdrop. `mix-blend-mode: multiply` lets it sit on
 * the site's near-white tints without a visible box while leaving every
 * pixel of the artwork exactly as supplied on pure white.
 */

const FULL = { src: "/brand/genesis-logo.png", w: 455, h: 652 };
const EMBLEM = { src: "/brand/genesis-emblem-white.png", w: 427, h: 494 };

type Props = { height: number; priority?: boolean; className?: string };

export function Logo({ height, priority, className }: Props) {
  const width = Math.round((FULL.w / FULL.h) * height);
  return (
    <Image
      src={FULL.src}
      alt="Genesis Pure Lifesciences"
      width={width}
      height={height}
      priority={priority}
      quality={90}
      sizes={`${width}px`}
      className={className}
      style={{ mixBlendMode: "multiply", width, height }}
    />
  );
}

/** Symbol only — the approved variation for limited space. */
export function Emblem({ height, priority, className, decorative }: Props & { decorative?: boolean }) {
  const width = Math.round((EMBLEM.w / EMBLEM.h) * height);
  return (
    <Image
      src={EMBLEM.src}
      alt={decorative ? "" : "Genesis Pure Lifesciences"}
      width={width}
      height={height}
      priority={priority}
      quality={90}
      sizes={`${width}px`}
      className={className}
      style={{ mixBlendMode: "multiply", width, height }}
    />
  );
}

export const LOGO_ASPECT = FULL.w / FULL.h;
