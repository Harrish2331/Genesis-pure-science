import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Sprout } from "@/components/brand/Motifs";
import { IMAGES } from "@/content/images";

/**
 * The "Contact Genesis" banner at the foot of every main page — one component
 * so it looks the same everywhere.
 *
 * Built from the supplied banner artwork (IMAGES.contactBanner): the gloved
 * hand with the DNA sphere sits on the right and the ribbon wave along the
 * foot, over the banner's own pale-blue wash. The heading, text and buttons
 * are live (readable, translatable, clickable) rather than part of a picture.
 *
 * Phones and tablets: the artwork fills the top of the card and fades into
 * the wash; the text and buttons follow beneath it.
 */
export function CtaBand({
  title = "Let’s talk about what you need.",
  body = "Questions about a product, distribution or partnership? Our team will be glad to help.",
  whatsappHref,
  contactHref = "/contact",
}: {
  title?: string;
  body?: string;
  whatsappHref?: string | null;
  /** Where "Contact our team" goes; the Contact page points it at its own options. */
  contactHref?: string;
}) {
  const art = IMAGES.contactBanner;
  return (
    <section className="container-x section-y" aria-labelledby="cta-heading">
      <div
        className="relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(100deg,#f3f9fd_0%,#e6f4fb_42%,#d3e8f2_100%)] shadow-[0_30px_70px_-38px_rgb(8_87_143/0.55)] ring-1 ring-[#d6e7f1]"
        data-reveal
      >
        {/* Artwork: right-hand side on wide screens, across the top on smaller ones. */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[15rem] [mask-image:linear-gradient(180deg,#000_50%,transparent)] sm:h-[19rem] lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[47%] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_32%)]">
          <Image
            src={art.src}
            alt={art.alt}
            fill
            quality={90}
            sizes="(min-width: 1024px) 47vw, 100vw"
            className="object-cover"
            style={{ objectPosition: art.focus ?? "50% 50%" }}
          />
        </div>
        {/* The ribbon wave along the foot. */}
        <div className="pointer-events-none absolute bottom-0 left-0 -z-10 aspect-[1108/160] w-full [mask-composite:intersect] [mask-image:linear-gradient(180deg,transparent_0%,#000_55%),linear-gradient(90deg,#000_70%,transparent)] lg:w-[64%]">
          <Image src={IMAGES.contactBannerWave.src} alt="" fill sizes="(min-width: 1024px) 64vw, 100vw" className="object-cover" />
        </div>

        <div className="relative px-6 pb-16 pt-[13rem] sm:px-10 sm:pt-[17rem] md:pb-20 lg:max-w-[58%] lg:py-20 lg:pl-16 lg:pr-0">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b1f5c]">
            <Sprout size={18} /> Contact Genesis
          </span>
          <h2 id="cta-heading" className="mt-4 font-display text-[clamp(1.8rem,1.3rem+1.8vw,2.8rem)] font-semibold leading-tight tracking-[-0.025em] !text-[#0b1f5c]">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-body">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={contactHref} variant="primary" arrow>
              Contact our team
            </ButtonLink>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white/90 text-[#0b1f5c] ring-1 ring-[#0b1f5c]/30 hover:bg-white hover:ring-[#0b1f5c]/50"
              >
                <WhatsAppIcon size={18} className="text-[#25d366]" /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
