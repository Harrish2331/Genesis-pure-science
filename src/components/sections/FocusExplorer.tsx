"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { ArrowRight } from "@/components/ui/Icons";

export type ExplorerArea = {
  id: string;
  label: string;
  short: string;
  group: string;
  href: string;
  count: number;
  products: { slug: string; name: string; image: string | null; alt: string }[];
};

/**
 * Therapeutic-area explorer: a numbered list of areas drives a detail panel,
 * after the interaction on the reference site, populated only with Genesis's
 * own areas and products.
 *
 * Implemented as an ARIA tab set — arrow keys, Home and End move between
 * areas; every area is also a plain link target in the panel, so nothing is
 * reachable only by script.
 */
export function FocusExplorer({ areas }: { areas: ExplorerArea[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const area = areas[active];

  const focusTab = (i: number) => {
    const n = (i + areas.length) % areas.length;
    setActive(n);
    tabs.current[n]?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div role="tablist" aria-label="Therapeutic areas" aria-orientation="vertical" className="flex flex-col">
        {areas.map((a, i) => {
          const header = i === 0 || areas[i - 1].group !== a.group ? a.group : null;
          const selected = i === active;
          return (
            <div key={a.id}>
              {header ? (
                <p className={`eyebrow ${i ? "mt-6" : ""} mb-2`} aria-hidden="true">
                  {header}
                </p>
              ) : null}
              <button
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onKeyDown={(e) => {
                  const to =
                    e.key === "ArrowDown" || e.key === "ArrowRight" ? i + 1
                    : e.key === "ArrowUp" || e.key === "ArrowLeft" ? i - 1
                    : e.key === "Home" ? 0
                    : e.key === "End" ? areas.length - 1
                    : null;
                  if (to === null) return;
                  e.preventDefault();
                  focusTab(to);
                }}
                className={`group flex w-full items-baseline gap-4 border-t border-line py-3 text-left transition-colors ${
                  selected ? "text-ink" : "text-ink/45 hover:text-ink/80"
                }`}
              >
                <span className={`w-7 shrink-0 font-display text-xs font-semibold tabular-nums ${selected ? "text-sky" : ""}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-display text-[clamp(1.15rem,1rem+0.6vw,1.55rem)] font-semibold leading-tight tracking-[-0.02em]">
                  {a.label}
                </span>
                <span className="text-xs tabular-nums text-muted">{a.count}</span>
                <span
                  aria-hidden="true"
                  className={`h-[2px] w-6 self-center rounded-full bg-[image:var(--grad-line)] transition-transform duration-300 ${selected ? "scale-x-100" : "scale-x-0"}`}
                />
              </button>
              {/* Small screens: the panel opens directly under the chosen area. */}
              {selected ? (
                <div className="mb-4 rounded-[var(--radius-card)] bg-gradient-to-br from-[#eef7fd] via-white to-[#eef9f2] p-5 shadow-[var(--shadow-ring)] lg:hidden">
                  <PanelBody area={a} index={i} compact />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        className="relative isolate hidden overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br from-[#eef7fd] via-white to-[#eef9f2] p-7 shadow-[var(--shadow-ring),var(--shadow-soft)] md:p-10 lg:sticky lg:top-28 lg:block lg:self-start"
      >
        <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M600 40C470 30 360 110 330 230c-24 96 26 186 130 270h140Z" fill="#20a7db" opacity="0.07" />
          <path d="M600 260c-90-8-160 40-176 110-12 56 12 100 66 130h110Z" fill="#9bd96b" opacity="0.12" />
        </svg>
        <PanelBody key={area.id} area={area} index={active} />
      </div>
    </div>
  );
}

function PanelBody({ area, index, compact }: { area: ExplorerArea; index: number; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-5" style={{ animation: "g-rise 520ms var(--ease-out-soft) both" }}>
      {compact ? null : <p className="eyebrow">
        {area.group} · {String(index + 1).padStart(2, "0")}
      </p>}
      {compact ? null : <h3 className="t-section">{area.label}</h3>}
      <p className={compact ? "text-[0.95rem] text-body" : "lead max-w-lg"}>{area.short}</p>

      {area.products.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {area.products.slice(0, 4).map((p) => (
            <li key={p.slug}>
              <Link
                href={`/products/${p.slug}`}
                className="group/p flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-ring)] transition hover:shadow-[0_0_0_1px_rgb(32_167_219/0.4),var(--shadow-soft)]"
              >
                <span className="relative block aspect-[4/3] bg-white">
                  {p.image ? (
                    <Image src={p.image} alt={p.alt} fill sizes="160px" className="object-contain p-2 transition-transform duration-500 group-hover/p:scale-105" />
                  ) : null}
                </span>
                <span className="border-t border-line px-3 py-2 text-[0.8rem] font-semibold text-ink">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-muted ring-1 ring-line">
          No products in this area yet — they will appear here as the Genesis range grows.
        </p>
      )}

      <div>
        <Link href={area.href} className="btn btn-primary btn-sm">
          {area.count ? `View ${area.count} product${area.count === 1 ? "" : "s"}` : `Browse ${area.group}`}
          <ArrowRight size={16} className="btn-arrow" />
        </Link>
      </div>
    </div>
  );
}
