import Link from "next/link";
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

/** One pastel per tile, each drawn from the extended palette. */
const TINTS: Record<FocusTile["tint"], { card: string; bubble: string; glow: string }> = {
  lavender: { card: "from-[#f5f1ff] to-white", bubble: "bg-[#ece5ff]", glow: "bg-[#c9b8ff]/35" },
  sky: { card: "from-[#eaf5fd] to-white", bubble: "bg-[#dbeefb]", glow: "bg-[#8fd0f2]/35" },
  peach: { card: "from-[#fff2ea] to-white", bubble: "bg-[#ffe6d6]", glow: "bg-[#ffc7a3]/40" },
  mint: { card: "from-[#ecf8f1] to-white", bubble: "bg-[#d9f2e4]", glow: "bg-[#a6e2bf]/40" },
  blue: { card: "from-[#eef2fd] to-white", bubble: "bg-[#dfe7fb]", glow: "bg-[#9fb6f2]/35" },
  teal: { card: "from-[#e8f6f5] to-white", bubble: "bg-[#d3efec]", glow: "bg-[#86d3cb]/40" },
};

/**
 * Genesis's six focus areas as a balanced grid (3 × 2 on desktop, 2 × 3 on
 * tablet, a single column on phones). Counts are computed from the live
 * catalogue, so a new product appears in its area automatically.
 */
export function FocusGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FOCUS_TILES.map((t, i) => {
        const Icon = ICONS[t.icon];
        const tint = TINTS[t.tint];
        const count = products.filter((p) => p.category === t.category && (!t.sub || p.subcategories.includes(t.sub))).length;
        return (
          <li key={t.id} data-reveal style={{ ["--reveal-delay" as string]: i % 3 }}>
            <Link
              href={t.href}
              className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br ${tint.card} p-6 shadow-[0_0_0_1px_rgb(201_215_225/0.7),0_14px_34px_-22px_rgb(16_42_67/0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(32_167_219/0.4),0_24px_44px_-22px_rgb(8_87_143/0.35)] md:p-7`}
            >
              <span className={`pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full ${tint.glow} blur-2xl transition-transform duration-700 group-hover:scale-125`} aria-hidden="true" />
              <div className="relative flex items-start justify-between">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tint.bubble} ring-1 ring-white`}>
                  <Icon size={32} />
                </span>
                <span className="font-display text-sm font-semibold tabular-nums text-ink/35">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="relative mt-6 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.015em] text-ink">{t.label}</h3>
              <p className="relative mt-2 text-[0.95rem] leading-relaxed text-body">{t.short}</p>
              <span className="relative mt-auto flex items-center justify-between pt-6 text-sm">
                <span className="font-semibold text-action">{count ? `${count} product${count === 1 ? "" : "s"}` : "Explore"}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-action shadow-sm ring-1 ring-line transition group-hover:bg-action group-hover:text-white">
                  <ArrowRight size={16} />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
