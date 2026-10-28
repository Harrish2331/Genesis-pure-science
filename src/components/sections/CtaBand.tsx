import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Molecule, Sprout } from "@/components/brand/Motifs";

/** Closing call to action used at the foot of most pages. */
export function CtaBand({
  title = "Let’s talk about what you need.",
  body = "Questions about a product, distribution or partnership? Our team will be glad to help.",
  whatsappHref,
}: {
  title?: string;
  body?: string;
  whatsappHref?: string | null;
}) {
  return (
    <section className="container-x section-y" aria-labelledby="cta-heading">
      <div
        className="relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#084f8c_0%,#0a68ab_40%,#0e7d8b_75%,#2a8756_100%)] px-7 py-14 text-white shadow-[0_30px_70px_-35px_rgb(8_87_143/0.7)] md:px-14 md:py-20"
        data-reveal
      >
        <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M820-40c180 60 300 200 320 420H700c70-130 110-280 120-420Z" fill="#fff" opacity="0.07" />
          <path d="M-40 360c200-120 420-150 640-80" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" fill="none" />
          <path d="M-40 392c220-110 450-130 690-62" stroke="#c6ea95" strokeOpacity="0.28" strokeWidth="1.5" fill="none" />
          <circle cx="1040" cy="90" r="160" fill="#9bd96b" opacity="0.12" />
        </svg>
        <Molecule className="absolute right-8 top-8 hidden opacity-90 md:block" size={72} />
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
            <Sprout size={18} /> Contact Genesis
          </span>
          <h2 id="cta-heading" className="mt-4 font-display text-[clamp(1.8rem,1.3rem+1.8vw,2.8rem)] font-semibold leading-tight tracking-[-0.025em] !text-white">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/95">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="secondary" arrow className="!text-action-strong">
              Contact our team
            </ButtonLink>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white/12 text-white ring-1 ring-white/45 hover:bg-white/20"
              >
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
