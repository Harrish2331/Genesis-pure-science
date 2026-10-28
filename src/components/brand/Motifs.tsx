/**
 * Decorative motifs drawn for the website, separately from the logo. Each one
 * takes a cue from an element of the emblem — the flowing ribbons, the
 * molecular nodes, the sprout — without reproducing the mark itself.
 * All are aria-hidden: they carry no information.
 */

import { useId } from "react";

/** Two linked spheres, after the molecular nodes on the emblem. */
export function Molecule({ className, size = 44 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}s`} cx="0.35" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#bfe9ff" />
          <stop offset="0.35" stopColor="#20a7db" />
          <stop offset="0.8" stopColor="#087ecd" />
          <stop offset="1" stopColor="#41b183" />
        </radialGradient>
      </defs>
      <path d="M8 56c10-2 17-8 20-17 2-5 6-8 11-9" stroke="#41b183" strokeWidth="3" strokeLinecap="round" />
      <path d="M33 34c4 2 9 3 14 1" stroke="#41b183" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="17" r="11" fill={`url(#${id}s)`} />
      <circle cx="53" cy="36" r="8" fill={`url(#${id}s)`} />
      <circle cx="36.5" cy="13" r="3" fill="#fff" opacity="0.8" />
    </svg>
  );
}

/** Two leaves on a stem, after the sprout above the capsule "I". */
export function Sprout({ className, size = 28 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#41b183" />
          <stop offset="1" stopColor="#9bd96b" />
        </linearGradient>
      </defs>
      <path d="M16 30V15" stroke="#41b183" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 16C15 9 10 5 3 5c0 7 5 11 13 11Z" fill={`url(#${id}l)`} />
      <path d="M16 15c1-7 6-11 13-11 0 7-5 11-13 11Z" fill={`url(#${id}l)`} />
    </svg>
  );
}

/** A small capsule glyph in brand colours (for icons and bullets). */
export function CapsuleGlyph({ className, size = 36 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fc6f5" />
          <stop offset="1" stopColor="#087ecd" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d7e0e8" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect x="4" y="16" width="40" height="16" rx="8" />
        </clipPath>
      </defs>
      <g transform="rotate(-40 24 24)">
        <rect x="4" y="16" width="40" height="16" rx="8" fill={`url(#${id}w)`} stroke="#c9d7e1" strokeWidth="0.8" />
        <g clipPath={`url(#${id}c)`}>
          <rect x="24" y="14" width="22" height="20" fill={`url(#${id}b)`} />
        </g>
        <rect x="27" y="18.5" width="13" height="3" rx="1.5" fill="#fff" opacity="0.55" />
      </g>
    </svg>
  );
}

/** A medical cross in brand colours, for the surgical category. */
export function CrossGlyph({ className, size = 36 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}x`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#20a7db" />
          <stop offset="1" stopColor="#41b183" />
        </linearGradient>
      </defs>
      <path
        d="M19 8h10a1 1 0 0 1 1 1v9h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9v9a1 1 0 0 1-1 1H19a1 1 0 0 1-1-1v-9H9a1 1 0 0 1-1-1V19a1 1 0 0 1 1-1h9V9a1 1 0 0 1 1-1Z"
        fill={`url(#${id}x)`}
      />
      <path d="M21 11h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** A heart with a leaf vein, for Women's Wellness. */
export function HeartGlyph({ className, size = 36 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#20a7db" />
          <stop offset="0.6" stopColor="#41b183" />
          <stop offset="1" stopColor="#9bd96b" />
        </linearGradient>
      </defs>
      <path d="M24 41S7 31 7 18.5A9.5 9.5 0 0 1 24 12a9.5 9.5 0 0 1 17 6.5C41 31 24 41 24 41Z" fill={`url(#${id}h)`} />
      <path d="M17 26c4-1 8-4 10-9" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** A single leaf, for the women's health category. */
export function LeafGlyph({ className, size = 36 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#20a7db" />
          <stop offset="0.55" stopColor="#41b183" />
          <stop offset="1" stopColor="#9bd96b" />
        </linearGradient>
      </defs>
      <path d="M8 40C8 20 20 8 42 6c0 22-12 34-34 34Z" fill={`url(#${id}g)`} />
      <path d="M10 38C18 28 26 20 36 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/**
 * Soft flowing ribbon shapes for section backgrounds — the emblem's
 * blue-to-green sweep, enlarged, softened and cropped by the section edge.
 */
export function RibbonBackdrop({
  className,
  variant = "right",
}: {
  className?: string;
  variant?: "right" | "left" | "wide";
}) {
  const id = useId().replace(/:/g, "");
  const flip = variant === "left" ? "scale(-1 1) translate(-800 0)" : undefined;
  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      preserveAspectRatio={variant === "wide" ? "none" : "xMidYMid slice"}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#087ecd" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#20a7db" stopOpacity="0.12" />
          <stop offset="1" stopColor="#9bd96b" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#41b183" stopOpacity="0.14" />
          <stop offset="1" stopColor="#20a7db" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <g transform={flip}>
        <path d="M800 40C620 30 470 120 430 270c-30 115 40 220 180 300H800Z" fill={`url(#${id}a)`} />
        <path d="M800 210c-120-10-210 50-230 140-18 82 30 160 120 250h110Z" fill={`url(#${id}b)`} />
        <path d="M690 20c-90 60-140 150-130 250" stroke="#20a7db" strokeOpacity="0.18" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** A thin brand-gradient rule, like the one on the business card. */
export function GradientRule({ className }: { className?: string }) {
  return <div className={`grad-rule ${className ?? ""}`} aria-hidden="true" />;
}
