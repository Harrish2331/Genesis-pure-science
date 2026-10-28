import { Logo } from "@/components/brand/Logo";
import { Molecule, Sprout } from "@/components/brand/Motifs";
import { IntroVideo } from "./IntroVideo";
import type { MediaRef } from "@/lib/content/types";

/**
 * The Genesis introduction panel.
 *
 * Until Genesis supplies its company-introduction film, this is a light
 * animated composition built from the official logo and brand motifs — not a
 * video, and not presented as one. When `videoUrl` is set in the dashboard
 * the panel shows a poster with a play control instead; the film loads only
 * when the visitor asks for it, is muted by default and never autoplays sound.
 */
export function BrandIntro({ videoUrl, poster }: { videoUrl?: string; poster?: MediaRef | null }) {
  if (videoUrl) return <IntroVideo src={videoUrl} poster={poster?.url} />;

  const words = ["Women’s Health", "General Medicine", "Surgicals"];
  return (
    <figure className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br from-[#eef7fd] via-white to-[#eef9f2] shadow-[var(--shadow-ring),var(--shadow-soft)] sm:aspect-[16/11]">
      <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="bi-r" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#087ecd" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="#20a7db" stopOpacity="0.14" />
            <stop offset="1" stopColor="#9bd96b" stopOpacity="0.24" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "400px 275px", animation: "g-spin 120s linear infinite" }}>
          <path d="M120 420C80 260 190 110 360 80c120-22 240 20 320 100-120-50-250-46-350 10-100 56-160 140-210 230Z" fill="url(#bi-r)" />
          <path d="M160 470c90 70 220 90 340 50 90-30 160-90 190-170-70 70-170 110-280 110-90 0-170-10-250 10Z" fill="url(#bi-r)" opacity="0.8" />
        </g>
        <circle cx="400" cy="275" r="230" fill="none" stroke="#20a7db" strokeOpacity="0.16" strokeDasharray="2 10" />
      </svg>

      <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
        <div style={{ animation: "g-rise 1.2s var(--ease-out-soft) both" }}>
          <Logo height={168} />
        </div>
        <div className="relative h-7 w-full max-w-xs text-center" aria-hidden="true">
          {words.map((w, i) => (
            <span
              key={w}
              className="absolute inset-0 font-display text-[0.95rem] font-medium tracking-[0.04em] text-slate"
              style={{ animation: `g-word 9s var(--ease-in-out-soft) ${i * 3}s infinite both` }}
            >
              {w}
            </span>
          ))}
        </div>
        <p className="sr-only">Focus areas: {words.join(", ")}.</p>
      </div>

      <Molecule className="absolute right-6 top-6 opacity-80" size={52} />
      <Sprout className="absolute bottom-6 left-6 opacity-90" size={30} />
      <figcaption className="absolute bottom-5 right-6 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
        Brand introduction
      </figcaption>
    </figure>
  );
}
