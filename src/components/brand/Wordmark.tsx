import { useId } from "react";

/**
 * The GENESIS wordmark, set as live text in the manner of the approved logo
 * lettering (public/brand/genesis-logo.png):
 *
 *   - wide, bold geometric capitals in the logo's warm charcoal (Montserrat,
 *     the closest available match), widely spaced;
 *   - the G carries the logo's green → teal → blue sweep through its lower
 *     curve;
 *   - the I is the capsule — white cap, sky-blue body — with two green
 *     leaves sprouting from its top;
 *   - PURE LIFESCIENCES beneath, small uppercase, spread letter by letter to
 *     exactly the width of the name, as in the logo.
 *
 * Screen readers get the name once, as plain text.
 */
const CHARCOAL = "#55595e";
const TAGLINE = "#4a4f55";
/** Space between letters, as in the logo's open setting. */
const TRACK = 0.3;

export function Wordmark({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className="sr-only">Genesis Pure Lifesciences</span>
      <span
        aria-hidden="true"
        className="flex items-baseline font-[family-name:var(--font-brand)] text-[1.3rem] font-bold leading-none sm:text-[1.45rem] xl:text-[1.6rem]"
        // The last letter's spacing would leave a gap on the right; pull it back so the edges are true.
        style={{ color: CHARCOAL, letterSpacing: `${TRACK}em`, marginRight: `-${TRACK}em` }}
      >
        <span
          style={{
            backgroundImage: `linear-gradient(220deg, ${CHARCOAL} 0%, ${CHARCOAL} 46%, #9bd96b 55%, #41b183 68%, #20a7db 84%, #087ecd 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          G
        </span>
        <span>ENES</span>
        <CapsuleI id={id} />
        <span>S</span>
      </span>
      <span
        aria-hidden="true"
        className="mt-[0.5rem] flex justify-between font-[family-name:var(--font-brand)] text-[0.5rem] font-medium leading-none xl:text-[0.56rem]"
        style={{ color: TAGLINE }}
      >
        {"PURE LIFESCIENCES".split("").map((ch, i) => (
          <span key={i} className={ch === " " ? "w-[0.4em]" : ""}>
            {ch === " " ? "" : ch}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * The capsule standing in for the I, with its two leaves.
 *
 * Drawn on a 64 × 102 grid at a height of 1.02em, so the capsule body
 * (70 units) is exactly Montserrat's cap height (0.70em) and sits on the
 * baseline, while the leaves spread wider than the capsule above it, as in
 * the logo. Only the capsule's width (23 units) counts for spacing: the
 * side margins pull the overhanging leaf area back in.
 */
function CapsuleI({ id }: { id: string }) {
  const unit = 1.02 / 102; // em per grid unit
  const overhang = 20.5 * unit; // grid units either side of the capsule
  return (
    <svg
      viewBox="0 0 64 102"
      style={{
        height: "1.02em",
        width: `${64 * unit}em`,
        marginLeft: `-${overhang}em`,
        marginRight: `${TRACK - overhang}em`,
        overflow: "visible",
        alignSelf: "baseline",
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd6ff" />
          <stop offset="1" stopColor="#2a8fe0" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f1f4f7" />
          <stop offset="1" stopColor="#d6e0e8" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5db53c" />
          <stop offset="1" stopColor="#c4ec95" />
        </linearGradient>
        <clipPath id={`${id}-pill`}>
          <rect x="20.5" y="31" width="23" height="71" rx="11.5" />
        </clipPath>
      </defs>
      {/* Leaves: a short stem from the capsule's top, one leaf to each side. */}
      <path d="M32 32 C32 28 32 25 32 21" stroke="#5db53c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M31.5 24 C24 25 10 21 5 6 C17 5 29 11 31.5 24 Z" fill={`url(#${id}-leaf)`} />
      <path d="M32.5 23 C34 12 44 3 60 1 C59 14 47 23 32.5 23 Z" fill={`url(#${id}-leaf)`} />
      <path d="M31 23 C24 20 15 14 9 8" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" fill="none" />
      <path d="M33.5 22 C40 17 48 9 56 4" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" fill="none" />
      {/* Capsule: white cap over a sky-blue body. */}
      <g clipPath={`url(#${id}-pill)`}>
        <rect x="20.5" y="31" width="23" height="38" fill={`url(#${id}-cap)`} />
        <rect x="20.5" y="69" width="23" height="33" fill={`url(#${id}-body)`} />
        <rect x="24" y="73" width="4" height="23" rx="2" fill="#ffffff" opacity="0.45" />
      </g>
      <rect x="21" y="31.5" width="22" height="70" rx="11" fill="none" stroke="#c3cfd8" strokeWidth="1" />
    </svg>
  );
}
