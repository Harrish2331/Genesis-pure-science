import Link from "next/link";
import { FOCUS_AREAS } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { RibbonBackdrop } from "@/components/brand/Motifs";
import { MailIcon, PhoneIcon, PinIcon, SocialIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { CopyText } from "@/components/ui/CopyText";
import { showCopy, showFact } from "@/lib/content/public";
import type { Settings } from "@/lib/content/types";

const COMPANY = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Focus", href: "/our-focus" },
  { label: "Manufacturing", href: "/manufacturing" },
  { label: "Axon Surgicals", href: "/axon-surgicals" },
];
const UPDATES = [
  { label: "Notices", href: "/notices" },
  { label: "Insights", href: "/insights" },
  { label: "Contact Us", href: "/contact" },
];

export function Footer({ settings, whatsappHref }: { settings: Settings; whatsappHref: string | null }) {
  const phone = showFact(settings.contact.customerServicePhone);
  const email = showFact(settings.contact.email);
  const legal = showFact(settings.brand.legalName);
  const gstin = showFact(settings.contact.gstin);
  const office = settings.contact.offices.find((o) => o.lines.length && o.confirmed);
  const socials = (Object.keys(settings.social) as (keyof Settings["social"])[])
    .map((id) => ({ id, fact: showFact(settings.social[id]) }))
    .filter((s) => s.fact);
  const year = new Date().getFullYear();

  return (
    <footer className="wash-lavender relative isolate mt-auto overflow-hidden border-t border-line" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <RibbonBackdrop className="pointer-events-none absolute -right-24 top-0 h-full w-[60%] opacity-70" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Link href="/" aria-label="Genesis Pure Lifesciences — home" className="inline-block rounded-md">
            <Logo height={150} />
          </Link>
          <CopyText copy={showCopy(settings.copy.footerIntro)} className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-body" />
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-5" aria-label="Footer">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Company</h3>
            <ul className="mt-4 space-y-2.5 text-[0.95rem]">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link className="text-body transition-colors hover:text-action" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Products</h3>
            <ul className="mt-4 space-y-2.5 text-[0.95rem]">
              <li>
                <Link className="text-body transition-colors hover:text-action" href="/products">
                  All products
                </Link>
              </li>
              {FOCUS_AREAS.map((c) => (
                <li key={c.id}>
                  <Link className="text-body transition-colors hover:text-action" href={c.href}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Updates</h3>
            <ul className="mt-4 space-y-2.5 text-[0.95rem]">
              {UPDATES.map((l) => (
                <li key={l.href}>
                  <Link className="text-body transition-colors hover:text-action" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="md:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Get in touch</h3>
          <ul className="mt-4 space-y-3.5 text-[0.95rem]">
            {office ? (
              <li className="flex gap-3">
                <PinIcon size={18} className="mt-1 shrink-0 text-action" />
                <span>
                  <span className="block font-medium text-ink">{office.label}</span>
                  {office.lines.map((l) => (
                    <span key={l} className="block text-body">
                      {l}
                    </span>
                  ))}
                </span>
              </li>
            ) : null}
            {phone ? (
              <li className="flex items-center gap-3">
                <PhoneIcon size={18} className="shrink-0 text-action" />
                <a className="text-body hover:text-action" href={`tel:${phone.value.replace(/[^\d+]/g, "")}`}>
                  {phone.value}
                </a>
               
              </li>
            ) : null}
            {email ? (
              <li className="flex items-center gap-3">
                <MailIcon size={18} className="shrink-0 text-action" />
                <a className="break-all text-body hover:text-action" href={`mailto:${email.value}`}>
                  {email.value}
                </a>
               
              </li>
            ) : null}
            {whatsappHref ? (
              <li className="flex items-center gap-3">
                <WhatsAppIcon size={18} className="shrink-0 text-[#1c9c5a]" />
                <a className="text-body hover:text-action" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/contact" className="btn btn-secondary btn-sm mt-1">
                Send an enquiry
              </Link>
            </li>
          </ul>
          {socials.length ? (
            <ul className="mt-6 flex gap-2" aria-label="Social media">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.fact!.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate ring-1 ring-line-strong transition hover:text-action hover:ring-action/40"
                    aria-label={`Genesis Pure Lifesciences on ${s.id === "x" ? "X" : s.id[0].toUpperCase() + s.id.slice(1)}`}
                  >
                    <SocialIcon id={s.id} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="relative border-t border-line">
        <p className="container-x pt-5 text-xs leading-relaxed text-muted">
          Information relating to prescription medicines on this site is intended for registered medical practitioners and healthcare or
          trade professionals. Nothing on this site is a substitute for professional medical advice.
        </p>
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            <p>
              © {year} {legal?.value ?? settings.brand.name}. All rights reserved.
            </p>
            {gstin ? (
              <p>
                GST No.: <span className="font-mono tracking-wide text-ink">{gstin.value}</span>
              </p>
            ) : null}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link className="hover:text-action" href="/privacy-policy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className="hover:text-action" href="/terms">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link className="hover:text-action" href="/disclaimer">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
