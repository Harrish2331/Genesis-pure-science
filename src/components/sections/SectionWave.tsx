import { useId } from "react";

/**
 * A soft curved transition between two section backgrounds, edged with a
 * brand-gradient line — the emblem's ribbon, stretched to the page width.
 */
export function SectionWave({
  from = "#ffffff",
  to = "var(--color-mist)",
  flip,
}: {
  from?: string;
  to?: string;
  flip?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const d = flip ? "M0 42C320 4 760 116 1440 46" : "M0 70C360 128 760 4 1440 58";
  return (
    <div aria-hidden="true" className="relative h-14 w-full md:h-20" style={{ background: from }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#087ecd" stopOpacity="0" />
            <stop offset="0.25" stopColor="#20a7db" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#41b183" stopOpacity="0.5" />
            <stop offset="1" stopColor="#9bd96b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d}V120H0Z`} style={{ fill: to }} />
        <path d={d} fill="none" stroke={`url(#${id}w)`} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
