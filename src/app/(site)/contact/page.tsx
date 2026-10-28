import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ClockIcon, DocIcon, ExternalIcon, MailIcon, PhoneIcon, PinIcon, SocialIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { getSettings, showCopy, showFact } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { productEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";
import type { Settings } from "@/lib/content/types";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Contact",
    description: "Contact Genesis Pure Lifesciences by email, telephone or WhatsApp about products, distribution or partnerships.",
    path: "/contact",
  });
}

type SP = Promise<{ type?: string; product?: string }>;

function Row({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-action">{icon}</span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">{title}</h3>
        <div className="mt-1.5 text-[0.98rem] text-body">{children}</div>
      </div>
    </li>
  );
}

export default async function ContactPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const settings: Settings = await getSettings();
  const ct = settings.contact;
  const legal = showFact(settings.brand.legalName);
  const phone = showFact(ct.customerServicePhone);
  const departments = (ct.departments ?? []).filter((d) => d.emails.length && d.confirmed);
  const wa = showFact(ct.whatsapp);
  const enquiryProduct = sp.product?.slice(0, 120).trim();
  const waHref = wa ? whatsappUrl(wa.value, enquiryProduct ? productEnquiryMessage(enquiryProduct) : ct.whatsappMessage) : null;
  const gstin = showFact(ct.gstin);
  const hours = showFact(ct.hours);
  const offices = ct.offices.filter((o) => o.lines.some(Boolean) && o.confirmed);
  const socials = (Object.keys(settings.social) as (keyof Settings["social"])[])
    .map((id) => ({ id, fact: showFact(settings.social[id]) }))
    .filter((s) => s.fact);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact Genesis Pure Lifesciences"
        intro={showCopy(settings.copy.contactIntro)}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      {/* ── Enquiry routes ─────────────────────────────────────────── */}
      <section className="pb-10 md:pb-14" aria-labelledby="routes-heading">
        <div className="container-x">
          <h2 id="routes-heading" className="sr-only">
            Email and telephone
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {departments.map((d, i) => (
              <li key={d.id} className="card card-accent flex flex-col gap-4 p-6" data-reveal style={{ ["--reveal-delay" as string]: i }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-action">
                  <MailIcon size={20} />
                </span>
                <h3 className="font-display text-[1.08rem] font-semibold leading-snug text-ink">
                  {d.label}
                </h3>
                <ul className="mt-auto flex flex-col gap-1.5">
                  {d.emails.map((e) => (
                    <li key={e}>
                      <a className="text-[0.95rem] font-medium text-action underline-offset-4 [overflow-wrap:anywhere] hover:underline" href={`mailto:${e}`}>
                        {/* Allow a line break only before the "@" of a long address. */}
                        {e.split("@")[0]}
                        <wbr />@{e.split("@").slice(1).join("@")}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {phone ? (
              <li className="card card-accent flex flex-col gap-4 p-6" data-reveal style={{ ["--reveal-delay" as string]: departments.length }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-leaf-ink">
                  <PhoneIcon size={20} />
                </span>
                <h3 className="font-display text-[1.08rem] font-semibold leading-snug text-ink">
                  Customer Service
                </h3>
                <a
                  className="mt-auto text-[1.05rem] font-semibold tabular-nums text-action underline-offset-4 hover:underline"
                  href={`tel:${phone.value.replace(/[^\d+]/g, "")}`}
                >
                  {phone.value}
                </a>
              </li>
            ) : null}
          </ul>

          {waHref ? (
            <div
              className="mt-6 flex flex-col gap-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#e9f8ef] via-white to-[#eef6fe] p-6 shadow-[var(--shadow-ring)] md:flex-row md:items-center md:justify-between md:p-8"
              data-reveal
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25d366] text-white shadow-[0_10px_24px_-12px_rgb(37_211_102/0.9)]">
                  <WhatsAppIcon size={24} />
                </span>
                <div>
                  <h3 className="font-display text-[1.2rem] font-semibold text-ink">
                    {enquiryProduct ? `Ask about ${enquiryProduct} on WhatsApp` : "Prefer WhatsApp? Chat with our team"}
                  </h3>
                  <p className="mt-1 text-[0.95rem] text-body">
                    Opens WhatsApp with a ready-to-send enquiry message{phone ? ` to ${phone.value}` : ""}.
                  </p>
                </div>
              </div>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp shrink-0 self-start md:self-center">
                <WhatsAppIcon size={18} /> Chat on WhatsApp
                <span className="sr-only">(opens WhatsApp)</span>
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <section className="wash-warm pb-20 pt-12 md:pb-28 md:pt-16" aria-labelledby="details-heading">
        <div className="container-x">
          <div className="flex flex-col gap-3" data-reveal>
            <span className="eyebrow">Company details</span>
            <h2 id="details-heading" className="t-section">
              {legal?.value ?? settings.brand.name}
            </h2>
          </div>

          <div className={`mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 lg:gap-8 ${offices.length ? "lg:grid-cols-2" : "max-w-3xl"}`}>
            {offices.length ? (
              <div className="card p-6 md:p-8" data-reveal>
                <h3 className="font-display text-lg font-semibold text-ink">Office</h3>
                <ul className="mt-6 divide-y divide-line">
                  {offices.map((o) => (
                    <Row key={o.id} icon={<PinIcon size={20} />} title={o.label}>
                      <address className="not-italic">
                        {o.lines.filter(Boolean).map((l) => (
                          <span key={l} className="block">
                            {l}
                          </span>
                        ))}
                      </address>
                      {o.mapsUrl ? (
                        <a href={o.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-1 text-sm">
                          Open in Google Maps <ExternalIcon size={15} />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      ) : null}
                    </Row>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="card p-6 md:p-8" data-reveal style={{ ["--reveal-delay" as string]: 1 }}>
              <h3 className="font-display text-lg font-semibold text-ink">Business details</h3>
              <ul className="mt-6 divide-y divide-line">
                {waHref ? (
                  <Row icon={<WhatsAppIcon size={20} />} title="WhatsApp">
                    <a className="font-medium text-ink hover:text-action" href={waHref} target="_blank" rel="noopener noreferrer">
                      Chat with us on WhatsApp
                    </a>
                  </Row>
                ) : null}

                {hours ? (
                  <Row icon={<ClockIcon size={20} />} title="Business hours">
                    {hours.value}
                  </Row>
                ) : null}

                {gstin ? (
                  <Row icon={<DocIcon size={20} />} title="GST No.">
                    <span className="font-mono text-[0.95rem] tracking-wide text-ink">{gstin.value}</span>
                  </Row>
                ) : null}
              </ul>
              {socials.length ? (
                <ul className="mt-6 flex gap-2 border-t border-line pt-6" aria-label="Social media">
                  {socials.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.fact!.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-cloud text-slate ring-1 ring-line hover:text-action"
                        aria-label={`Genesis Pure Lifesciences on ${s.id === "x" ? "X" : s.id[0].toUpperCase() + s.id.slice(1)} (opens in a new tab)`}
                      >
                        <SocialIcon id={s.id} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
