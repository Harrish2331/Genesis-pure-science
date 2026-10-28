import Image from "next/image";
import Link from "next/link";
import { hasProfile, partnerPath, partnerTitle } from "@/lib/content/partners";
import type { Partner } from "@/lib/content/types";

/**
 * Compact partner directory for the home page: every partner's own logo in a
 * uniform tile (contained, never stretched or recoloured), its name beneath,
 * linking to its profile. Partners without a logo show their name only.
 */
export function PartnerLogoWall({ partners }: { partners: Partner[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {partners.map((p, i) => {
        const body = (
          <>
            <span className="flex h-20 w-full items-center justify-center rounded-xl bg-white px-4">
              {p.logo ? (
                <Image
                  src={p.logo.url}
                  alt={`${partnerTitle(p)} logo`}
                  width={p.logo.width}
                  height={p.logo.height}
                  sizes="160px"
                  className="h-auto max-h-16 w-auto max-w-full object-contain"
                />
              ) : (
                <span className="font-display text-lg font-semibold text-ink">{p.name}</span>
              )}
            </span>
            <span className="text-center text-[0.8rem] font-semibold leading-snug text-ink">{partnerTitle(p)}</span>
          </>
        );
        const cls = "card flex h-full flex-col items-center gap-3 p-3 pb-4";
        return (
          <li key={p.id} data-reveal style={{ ["--reveal-delay" as string]: i % 5 }}>
            {hasProfile(p) ? (
              <Link href={partnerPath(p)} className={`${cls} card-hover`}>
                {body}
              </Link>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
