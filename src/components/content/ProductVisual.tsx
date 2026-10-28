import { CapsuleGlyph, CrossGlyph, LeafGlyph } from "@/components/brand/Motifs";
import type { ProductCategory } from "@/lib/content/types";

const TINT: Record<ProductCategory, string> = {
  "womens-health": "from-[#eef8f2] via-[#f4fbf6] to-[#e6f4fb]",
  "general-medicine": "from-[#e8f4fc] via-[#f3f9fd] to-[#eef9f2]",
  surgicals: "from-[#e6f6f6] via-[#f2f9fb] to-[#e9f1fb]",
};

/**
 * Shown where a product has no approved photograph yet. It is a brand
 * graphic for the category, never an imitation of packaging, and says so.
 */
export function ProductVisual({ category, label, compact }: { category: ProductCategory; label: string; compact?: boolean }) {
  const Glyph = category === "womens-health" ? LeafGlyph : category === "surgicals" ? CrossGlyph : CapsuleGlyph;
  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${TINT[category]}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="330" cy="40" r="120" fill="#20a7db" opacity="0.07" />
        <circle cx="60" cy="270" r="110" fill="#9bd96b" opacity="0.1" />
        <path d="M-20 230C80 170 180 160 420 210" stroke="#20a7db" strokeOpacity="0.16" strokeWidth="1.5" fill="none" />
        <path d="M-20 250C110 200 220 196 420 238" stroke="#41b183" strokeOpacity="0.14" strokeWidth="1.5" fill="none" />
      </svg>
      <div className="relative flex flex-col items-center gap-3">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-[0_10px_30px_-12px_rgb(8_87_143/0.35)] ring-1 ring-white">
          <Glyph size={compact ? 38 : 44} />
        </span>
        {!compact ? (
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
        ) : null}
      </div>
      <span className="sr-only">Image not yet available</span>
    </div>
  );
}
