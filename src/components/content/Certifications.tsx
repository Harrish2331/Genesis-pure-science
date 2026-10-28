import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/Icons";
import { marksAcross, resolve, type CertificationMark, type RegulatorMark } from "@/lib/content/certifications";
import type { Partner } from "@/lib/content/types";

/*
 * Certification marks, shared by every page that shows them. Marks reach a
 * page only through a manufacturing partner's own claims (see
 * src/lib/content/certifications.ts); nothing here can show a mark on its own.
 */

const PLATE = { sm: 34, md: 56, lg: 76 } as const;

/**
 * One seal on a white circular plate of fixed diameter. The supplied seals
 * are circular artwork on white, so a common plate gives every mark the same
 * footprint without stretching, cropping or recolouring any of them.
 */
export function CertificationSeal({ mark, size = "md" }: { mark: CertificationMark; size?: keyof typeof PLATE }) {
  if (!mark.logo) return null;
  const d = PLATE[size];
  return (
    <span
      className="cert-seal flex shrink-0 items-center justify-center rounded-full bg-white shadow-[var(--shadow-ring)]"
      style={{ width: d, height: d, padding: Math.round(d * 0.08) }}
    >
      <Image src={mark.logo} alt={mark.alt ?? `${mark.label} mark`} width={320} height={320} sizes={`${d * 2}px`} className="h-full w-full object-contain" />
    </span>
  );
}

/** A compact row of the marks one partner claims (artwork only), e.g. on partner cards. */
export function CertificationRow({ claims, size = "sm", partnerName }: { claims: string[]; size?: keyof typeof PLATE; partnerName: string }) {
  const marks = resolve(claims).filter((m) => m.logo);
  if (!marks.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {marks.map((m) => (
        <CertificationSeal key={m.id} mark={m} size={size} />
      ))}
      <span className="sr-only">
        Certifications stated by {partnerName}: {marks.map((m) => m.label).join(", ")}
      </span>
    </div>
  );
}

/**
 * The marks held across the manufacturing network, each with how many partners
 * claim it — and, always, the statement that they are the partners' and not
 * Genesis's. Used on the home, About and Manufacturing pages.
 */
export function NetworkCertifications({
  partners,
  tone = "plain",
  link = true,
  heading = "Certifications across our manufacturing network",
}: {
  partners: Partner[];
  tone?: "plain" | "card";
  link?: boolean;
  heading?: string;
}) {
  const marks = marksAcross(partners);
  if (!marks.length) return null;
  return (
    <div className={tone === "card" ? "rounded-[1.5rem] bg-white/85 p-6 shadow-[var(--shadow-ring)] md:p-8" : ""} data-reveal>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="eyebrow">{heading}</h3>
        {link ? (
          <Link href="/manufacturing#quality" className="inline-flex items-center gap-1.5 text-sm font-semibold text-action hover:text-action-strong">
            See which partner holds what <ArrowRight size={15} />
          </Link>
        ) : null}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {marks.map(({ mark, count }) => (
          <li key={mark.id} className="cert-tile flex flex-col items-center gap-2.5 rounded-2xl bg-white px-3 py-5 text-center shadow-[var(--shadow-ring)]">
            <CertificationSeal mark={mark} size="md" />
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink">{mark.label}</span>
            <span className="text-xs text-muted">
              {count} {count === 1 ? "partner" : "partners"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted">
        These certifications are held by Genesis&rsquo;s manufacturing partners and their facilities, as stated in each partner&rsquo;s own documentation.
        They are not certifications held by Genesis Pure Lifesciences.
      </p>
    </div>
  );
}

/** A regulator's emblem beside a registration a partner states, contained in a fixed tile. */
export function RegulatorEmblem({ mark }: { mark: RegulatorMark }) {
  return (
    <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-[var(--shadow-ring)]">
      <Image src={mark.logo} alt={mark.alt} width={mark.width} height={mark.height} sizes="80px" className="h-auto max-h-full w-auto max-w-full object-contain" />
    </span>
  );
}
