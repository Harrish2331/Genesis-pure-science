import Image from "next/image";
import Link from "next/link";
import { AVAILABILITY_LABELS, categoryMeta, subcategoryMeta } from "@/content/site";
import { ArrowRight, WhatsAppIcon } from "@/components/ui/Icons";
import { getSettings, showFact } from "@/lib/content/public";
import type { Product } from "@/lib/content/types";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";
import { ProductVisual } from "./ProductVisual";

export function AvailabilityChip({ value }: { value: Product["availability"] }) {
  const label = AVAILABILITY_LABELS[value];
  if (!label) return null;
  const cls =
    value === "available" ? "chip chip-green" : value === "coming-soon" ? "chip" : value === "discontinued" ? "chip chip-neutral" : "chip chip-warn";
  return (
    <span className={cls}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${value === "available" ? "bg-leaf" : value === "coming-soon" ? "bg-sky" : value === "discontinued" ? "bg-muted" : "bg-[#c27a00]"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/** Soft image-stage tints, so a grid of white cartons reads as a set, not a wall. */
const STAGE: Record<Product["category"], string> = {
  "womens-health": "from-[#f6f2fe] via-white to-[#fdf3ee]",
  "general-medicine": "from-[#eef6fe] via-white to-[#eef9f2]",
  surgicals: "from-[#ebf7f6] via-white to-[#eef3fc]",
};

/**
 * A product in the catalogue grid. Fixed 4:3 image stage and clamped text keep
 * every card the same shape whatever the data. The card body links to the
 * product page; the footer holds the details link and a WhatsApp enquiry that
 * names the product (links cannot nest, so they are siblings).
 */
export async function ProductCard({
  product,
  headingLevel = "h3",
  eager = false,
}: {
  product: Product;
  headingLevel?: "h2" | "h3";
  /** Load at once: for the first cards of a listing, which are above the fold. */
  eager?: boolean;
}) {
  const meta = categoryMeta(product.category);
  const H = headingLevel;
  const settings = await getSettings();
  const wa = showFact(settings.contact.whatsapp);
  const waHref = wa ? whatsappUrl(wa.value, productEnquiryMessage(product.name)) : null;
  const href = `/products/${product.slug}`;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[0_0_0_1px_rgb(201_215_225/0.75),0_1px_2px_rgb(16_42_67/0.04),0_14px_34px_-18px_rgb(16_42_67/0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(32_167_219/0.45),0_24px_48px_-22px_rgb(8_87_143/0.38)]"
      data-reveal
    >
      <span
        className="absolute inset-x-6 top-0 z-10 h-[3px] origin-center scale-x-0 rounded-b-full bg-[image:var(--grad-line)] transition-transform duration-500 group-hover:scale-x-100"
        aria-hidden="true"
      />
      <Link href={href} className="flex flex-1 flex-col" aria-label={`${product.name} — view product details`}>
        <div className={`relative aspect-[4/3] overflow-hidden border-b border-line bg-gradient-to-br ${STAGE[product.category]}`}>
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 92vw"
              loading={eager ? "eager" : undefined}
              fetchPriority={eager ? "high" : undefined}
              className="object-contain p-5 drop-shadow-[0_10px_14px_rgb(16_42_67/0.12)] transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <ProductVisual category={product.category} label={meta.label} />
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.prescriptionOnly ? (
              <span className="chip !bg-white/90 !text-ink" title="Prescription medicine — information for healthcare professionals">
                Rx
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-5 md:p-6">
          <p className="flex flex-wrap items-center gap-x-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-leaf-ink">
            <span>{meta.label}</span>
            {product.subcategories[0] ? (
              <>
                <span aria-hidden="true" className="text-line-strong">›</span>
                <span>{subcategoryMeta(product.subcategories[0]).label}</span>
              </>
            ) : null}
          </p>
          <H className="t-card line-clamp-2">{product.name}</H>
          {product.composition ? (
            <p className="line-clamp-3 text-[0.88rem] leading-relaxed text-body">{product.composition}</p>
          ) : product.shortDescription ? (
            <p className="line-clamp-3 text-[0.9rem] leading-relaxed text-body">{product.shortDescription}</p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            {product.dosageForm ? <span className="chip chip-neutral">{product.dosageForm}</span> : null}
            <AvailabilityChip value={product.availability} />
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-line bg-cloud/60 px-5 py-3 md:px-6">
        <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-action hover:underline" tabIndex={-1} aria-hidden="true">
          Details <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f8ef] px-3 py-1.5 text-xs font-semibold text-[#12704a] ring-1 ring-[#1fa855]/30 transition hover:bg-[#d8f3e2]"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
          >
            <WhatsAppIcon size={15} /> Enquire
          </a>
        ) : null}
      </div>
    </article>
  );
}
