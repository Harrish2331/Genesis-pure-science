import Link from "next/link";
import { FOCUS_AREAS, subcategoriesOf } from "@/content/site";
import { CapsuleGlyph, CrossGlyph, LeafGlyph } from "@/components/brand/Motifs";
import { ArrowRight } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import type { ShownCopy } from "@/lib/content/public";
import type { ProductCategory } from "@/lib/content/types";

const GLYPH = { leaf: LeafGlyph, capsule: CapsuleGlyph, cross: CrossGlyph };

/** Genesis's focus areas, as linked cards. */
export function FocusCards({
  copy,
  counts,
  linkTo = "focus",
}: {
  copy: Partial<Record<ProductCategory, ShownCopy>>;
  counts: Partial<Record<ProductCategory, number>>;
  linkTo?: "focus" | "products";
}) {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {FOCUS_AREAS.map((c, i) => {
        const Glyph = GLYPH[c.motif];
        return (
          <li key={c.id} data-reveal style={{ ["--reveal-delay" as string]: i }}>
            <Link
              href={linkTo === "focus" ? c.focusHref : c.href}
              className="card card-hover card-accent group relative flex h-full flex-col overflow-hidden p-7 md:p-8"
            >
              <span
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[image:var(--grad-brand-soft)] transition-transform duration-700 group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_12px_28px_-14px_rgb(8_87_143/0.45)] ring-1 ring-line">
                <Glyph size={36} />
              </span>
              <span className="relative mt-7 font-display text-sm font-semibold tabular-nums text-sky">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="relative mt-2 font-display text-[1.6rem] font-semibold leading-tight">{c.label}</h3>
              {copy[c.id] ? <CopyText copy={copy[c.id]!} className="relative mt-3 text-[0.97rem] leading-relaxed text-body" /> : null}
              <ul className="relative mt-5 flex flex-wrap gap-1.5" aria-label={`${c.label} areas`}>
                {subcategoriesOf(c.id).map((s) => (
                  <li key={s.id} className="chip chip-neutral !text-[0.72rem]">
                    {s.label}
                  </li>
                ))}
              </ul>
              <span className="relative mt-auto flex items-center justify-between pt-7">
                <span className="text-sm font-semibold text-action">
                  {linkTo === "focus" ? "Explore this area" : "View products"}
                </span>
                <span className="flex items-center gap-3">
                  {counts[c.id] ? (
                    <span className="meta">
                      {counts[c.id]} product{counts[c.id] === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-action transition group-hover:bg-action group-hover:text-white">
                    <ArrowRight size={16} />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
