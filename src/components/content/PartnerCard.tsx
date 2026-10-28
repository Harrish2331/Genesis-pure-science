import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalIcon, PinIcon } from "@/components/ui/Icons";
import { CertificationRow } from "./Certifications";
import { hasProfile, partnerPath, partnerTitle } from "@/lib/content/partners";
import type { Partner } from "@/lib/content/types";

const STAGES = ["from-[#f5f2ff] to-[#eef6fe]", "from-[#fff4ec] to-[#f5f2ff]", "from-[#eef8f2] to-[#eef6fe]"];

/**
 * A manufacturing partner. Shows the name exactly as supplied; a logo,
 * profile, capabilities and website appear only once they have been entered
 * in the dashboard. No logo is ever drawn or approximated for a partner.
 * Capabilities and certifications are always labelled as the partner's own.
 */
export function PartnerCard({ partner, index, compact }: { partner: Partner; index: number; compact?: boolean }) {
  const profile = hasProfile(partner);
  const shownCaps = partner.capabilities.slice(0, compact ? 0 : 5);
  const moreCaps = partner.capabilities.length - shownCaps.length;
  const plants = partner.sites.length;

  return (
    <article
      className="card card-hover group relative flex h-full flex-col overflow-hidden"
      data-reveal
      style={{ ["--reveal-delay" as string]: index }}
    >
      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${STAGES[index % STAGES.length]} px-8`}>
        <span className="absolute left-5 top-4 font-display text-sm font-semibold tabular-nums tracking-[0.12em] text-sky">
          {String(index + 1).padStart(2, "0")}
        </span>
        {partner.logo ? (
          <span className="rounded-2xl bg-white px-5 py-3 shadow-[var(--shadow-ring)]">
            <Image
              src={partner.logo.url}
              alt={`${partnerTitle(partner)} logo`}
              width={partner.logo.width}
              height={partner.logo.height}
              sizes="208px"
              className="h-14 w-auto max-w-[13rem] object-contain"
            />
          </span>
        ) : (
          <span className="font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{partner.name}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div>
          <h3 className="t-card">
            {profile ? (
              <Link href={partnerPath(partner)} className="after:absolute after:inset-0 hover:text-action">
                {partnerTitle(partner)}
              </Link>
            ) : (
              partnerTitle(partner)
            )}
          </h3>
          <p className="mt-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-muted">Manufacturing partner</p>
        </div>
        {partner.tagline ? <p className="text-[0.95rem] leading-relaxed text-body">{partner.tagline}</p> : null}
        {(partner.region || partner.location) && !compact ? (
          <p className="flex items-start gap-2 text-sm text-body">
            <PinIcon size={16} className="mt-0.5 shrink-0 text-action" />
            <span>{[partner.region, partner.location].filter(Boolean).join(", ")}</span>
          </p>
        ) : null}
        {shownCaps.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Capabilities stated by the partner">
            {shownCaps.map((c) => (
              <li key={c} className="chip chip-neutral">
                {c}
              </li>
            ))}
            {moreCaps > 0 ? <li className="chip chip-neutral">+{moreCaps} more</li> : null}
          </ul>
        ) : null}
        {!compact && (partner.certifications.length || plants) ? (
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            {plants ? (
              <div>
                <dt className="text-xs text-muted">Documented sites</dt>
                <dd className="font-display text-xl font-semibold text-ink">{plants}</dd>
              </div>
            ) : null}
            {partner.certifications.length ? (
              <div>
                <dt className="text-xs text-muted">Partner-stated certifications</dt>
                <dd className="mt-1">
                  <CertificationRow claims={partner.certifications} partnerName={partnerTitle(partner)} />
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          {profile ? (
            <Link href={partnerPath(partner)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-action hover:text-action-strong">
              View profile <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
          {partner.website && !compact ? (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-action"
            >
              Website <ExternalIcon size={14} />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
