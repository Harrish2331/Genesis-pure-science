import { SceneMotion } from "./SceneMotion";

/**
 * The hero centrepiece: the capsule from the Genesis emblem, lifted out and
 * set in motion.
 *
 * Everything is inline SVG animated with CSS transforms and opacity only (no
 * filters, no canvas, no WebGL, no library), so it composites on the GPU and
 * costs almost nothing on a phone. Layer structure — each concern gets its
 * own <g> so transforms never fight:
 *
 *   intro    one-off entrance (rise / fade), fill-mode both
 *   loop     the idle motion (float, orbit, sway, trail)
 *   parallax pointer offset from SceneMotion (desktop pointers only)
 *
 * Under prefers-reduced-motion every animation resolves instantly to its end
 * state, which is a complete, balanced still composition. The scene is
 * decorative and hidden from assistive technology; the hero text carries the
 * message.
 */

const C = { x: 320, y: 320 };

export function CapsuleScene({ className }: { className?: string }) {
  return (
    <SceneMotion className={className}>
      <svg viewBox="0 0 640 640" className="h-full w-full overflow-visible" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="cs-glow-sky" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#20a7db" stopOpacity="0.32" />
            <stop offset="1" stopColor="#20a7db" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cs-glow-lime" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#9bd96b" stopOpacity="0.34" />
            <stop offset="1" stopColor="#9bd96b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cs-ribbon-a" x1="0.05" y1="0.95" x2="0.95" y2="0.05">
            <stop offset="0" stopColor="#087ecd" />
            <stop offset="0.45" stopColor="#20a7db" />
            <stop offset="0.8" stopColor="#7ccfb0" />
            <stop offset="1" stopColor="#c6ea95" />
          </linearGradient>
          <linearGradient id="cs-ribbon-b" x1="0" y1="0.2" x2="1" y2="0.8">
            <stop offset="0" stopColor="#41b183" />
            <stop offset="0.45" stopColor="#3cb6e3" />
            <stop offset="1" stopColor="#087ecd" />
          </linearGradient>
          <linearGradient id="cs-leaf" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#41b183" />
            <stop offset="0.6" stopColor="#8fd16e" />
            <stop offset="1" stopColor="#cdeea0" />
          </linearGradient>
          <linearGradient id="cs-cap-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cd6fb" />
            <stop offset="0.38" stopColor="#2c9fe9" />
            <stop offset="1" stopColor="#0a63c4" />
          </linearGradient>
          <linearGradient id="cs-cap-white" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#f3f6f9" />
            <stop offset="1" stopColor="#cfd9e3" />
          </linearGradient>
          <linearGradient id="cs-cap-tint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="#9bd96b" stopOpacity="0" />
            <stop offset="1" stopColor="#41b183" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="cs-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#20a7db" stopOpacity="0" />
            <stop offset="0.6" stopColor="#20a7db" stopOpacity="0.55" />
            <stop offset="1" stopColor="#9bd96b" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="cs-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="cs-node" cx="0.34" cy="0.3" r="0.78">
            <stop offset="0" stopColor="#d4f1ff" />
            <stop offset="0.3" stopColor="#4cbcef" />
            <stop offset="0.72" stopColor="#0b7fd0" />
            <stop offset="1" stopColor="#4cb87a" />
          </radialGradient>
          <radialGradient id="cs-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#08578f" stopOpacity="0.22" />
            <stop offset="1" stopColor="#08578f" stopOpacity="0" />
          </radialGradient>
          <clipPath id="cs-capsule-clip">
            <rect x="-150" y="-62" width="300" height="124" rx="62" />
          </clipPath>
        </defs>

        {/* ── Atmosphere ───────────────────────────────────────────── */}
        <circle cx="420" cy="230" r="270" fill="url(#cs-glow-sky)" />
        <circle cx="210" cy="450" r="230" fill="url(#cs-glow-lime)" />

        {/* Orbit hairlines */}
        <g style={{ transformOrigin: `${C.x}px ${C.y}px`, animation: "g-fade 1.6s var(--ease-out-soft) both" }}>
          <g style={{ transformOrigin: `${C.x}px ${C.y}px`, animation: "g-spin 140s linear infinite" }}>
            <ellipse cx={C.x} cy={C.y} rx="286" ry="286" stroke="#20a7db" strokeOpacity="0.22" strokeWidth="1.2" strokeDasharray="2 9" fill="none" />
            <circle cx={C.x + 286} cy={C.y} r="4" fill="#20a7db" opacity="0.5" />
          </g>
          <g style={{ transformOrigin: `${C.x}px ${C.y}px`, animation: "g-spin-rev 110s linear infinite" }}>
            <circle cx={C.x} cy={C.y} r="232" stroke="#41b183" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            <circle cx={C.x - 164} cy={C.y + 164} r="3.5" fill="#41b183" opacity="0.55" />
          </g>
        </g>

        {/* ── Flowing ribbons (after the emblem's sweep) ───────────── */}
        <g data-depth="0.35">
          <g style={{ animation: "g-rise 1.4s var(--ease-out-soft) 0.1s both" }}>
            <g style={{ transformOrigin: `${C.x}px ${C.y}px`, animation: "g-spin 90s linear infinite" }}>
              <path
                d="M96 392C72 252 160 120 300 82c74-20 152-10 214 26-70-6-150 6-214 46-82 52-142 140-204 238Z"
                fill="url(#cs-ribbon-a)"
                opacity="0.92"
              />
              <path
                d="M132 430c40 104 150 166 266 152 70-8 132-44 172-100-58 32-130 46-200 36-96-14-174-42-238-88Z"
                fill="url(#cs-ribbon-b)"
                opacity="0.85"
              />
              <path d="M548 150c46 64 60 150 30 228" stroke="url(#cs-ribbon-a)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          </g>
        </g>

        {/* Leaf sweeping up the right-hand side, behind the capsule */}
        <g data-depth="0.5">
          <g style={{ animation: "g-rise 1.4s var(--ease-out-soft) 0.35s both" }}>
            <g style={{ transformOrigin: "470px 470px", animation: "g-sway 9s var(--ease-in-out-soft) infinite" }}>
              <path d="M470 470c-6-92 26-176 104-232 22 92-6 188-104 232Z" fill="url(#cs-leaf)" opacity="0.9" />
              <path d="M474 462c18-62 46-118 92-164" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </g>

        {/* ── Light trails, behind the capsule's travel ────────────── */}
        <g data-depth="0.8">
          <g transform="translate(330 300) rotate(-38)">
            <g style={{ animation: "g-fade 1s ease 0.9s both" }}>
              {[
                { y: -34, w: 7, d: "0s", len: 250 },
                { y: 6, w: 10, d: "1.1s", len: 300 },
                { y: 42, w: 5, d: "2.2s", len: 220 },
              ].map((t) => (
                <path
                  key={t.y}
                  d={`M${-150 - t.len} ${t.y}H-120`}
                  stroke="url(#cs-trail)"
                  strokeWidth={t.w}
                  strokeLinecap="round"
                  strokeDasharray="140 280"
                  style={{ animation: `g-trail 3.6s linear ${t.d} infinite` }}
                />
              ))}
            </g>
          </g>
        </g>

        {/* ── Shadow, breathing with the float ─────────────────────── */}
        <g style={{ transformOrigin: "330px 520px", animation: "g-pulse 7s var(--ease-in-out-soft) infinite" }}>
          <ellipse cx="330" cy="520" rx="120" ry="16" fill="url(#cs-shadow)" />
        </g>

        {/* ── The capsule ──────────────────────────────────────────── */}
        <g data-depth="1">
          <g style={{ transformOrigin: "330px 300px", animation: "g-rise 1.3s var(--ease-out-soft) 0.5s both" }}>
            <g style={{ transformOrigin: "330px 300px", animation: "g-float 7s var(--ease-in-out-soft) infinite alternate" }}>
              <g transform="translate(330 300) rotate(-38)">
                {/* Body (white half) */}
                <rect x="-150" y="-62" width="300" height="124" rx="62" fill="url(#cs-cap-white)" />
                <rect x="-150" y="-62" width="300" height="124" rx="62" fill="url(#cs-cap-tint)" />
                <g clipPath="url(#cs-capsule-clip)">
                  {/* Cap (blue half) — clipped to the capsule outline for a clean seam */}
                  <rect x="2" y="-70" width="160" height="140" fill="url(#cs-cap-blue)" />
                  <rect x="-2" y="-70" width="6" height="140" fill="#0a5aa8" opacity="0.28" />
                  <rect x="4" y="-70" width="3" height="140" fill="#fff" opacity="0.35" />
                  {/* Specular highlights */}
                  <rect x="22" y="-44" width="104" height="16" rx="8" fill="#fff" opacity="0.5" />
                  <rect x="-126" y="-44" width="104" height="14" rx="7" fill="#fff" opacity="0.95" />
                  <rect x="-130" y="30" width="118" height="10" rx="5" fill="#9bb4c9" opacity="0.22" />
                  {/* Passing sheen */}
                  <g style={{ animation: "g-sheen 7s var(--ease-in-out-soft) 2.4s infinite" }}>
                    <rect x="-150" y="-90" width="60" height="180" fill="url(#cs-shine)" opacity="0.7" transform="skewX(-18)" />
                  </g>
                </g>
                <rect x="-150" y="-62" width="300" height="124" rx="62" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.5" />
                <rect x="-150" y="-62" width="300" height="124" rx="62" fill="none" stroke="#0a63c4" strokeOpacity="0.1" strokeWidth="1" />
              </g>
            </g>
          </g>
        </g>

        {/* ── Molecular nodes, orbiting ─────────────────────────────── */}
        <g data-depth="0.6">
          <g style={{ animation: "g-fade 1.2s ease 1s both" }}>
            <g style={{ transformOrigin: `${C.x}px ${C.y}px`, animation: "g-spin 48s linear infinite" }}>
              <g transform="translate(486 112)">
                <g style={{ transformOrigin: "0px 0px", animation: "g-spin-rev 48s linear infinite" }}>
                  <path d="M-58 52c22-4 36-16 44-34 4-9 10-14 18-16" stroke="#41b183" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <path d="M-6 16c10 6 22 8 34 4" stroke="#41b183" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <circle cx="0" cy="-8" r="22" fill="url(#cs-node)" />
                  <circle cx="38" cy="22" r="16" fill="url(#cs-node)" />
                  <circle cx="-7" cy="-16" r="5.5" fill="#fff" opacity="0.85" />
                  <circle cx="33" cy="16" r="4" fill="#fff" opacity="0.85" />
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* Sprout leaves, lower left */}
        <g data-depth="0.45">
          <g style={{ animation: "g-rise 1.2s var(--ease-out-soft) 0.8s both" }}>
            <g transform="translate(150 500)">
              <g style={{ transformOrigin: "0px 0px", animation: "g-sway 7s var(--ease-in-out-soft) 0.6s infinite" }}>
                <path d="M0 0v-34" stroke="#41b183" strokeWidth="3" strokeLinecap="round" />
                <path d="M0-30c-2-18-14-28-32-28 0 18 12 28 32 28Z" fill="url(#cs-leaf)" />
                <path d="M0-33c2-18 14-28 32-28 0 18-12 28-32 28Z" fill="url(#cs-leaf)" />
              </g>
            </g>
          </g>
        </g>

        {/* Faint molecular network */}
        <g data-depth="0.25" opacity="0.7">
          <g style={{ animation: "g-drift 14s var(--ease-in-out-soft) infinite" }}>
            <path d="M84 170l46-26 40 22M130 144l-6-44" stroke="#087ecd" strokeOpacity="0.28" strokeWidth="1.2" fill="none" />
            <circle cx="84" cy="170" r="4.5" fill="#20a7db" opacity="0.55" />
            <circle cx="130" cy="144" r="6" fill="#087ecd" opacity="0.45" />
            <circle cx="170" cy="166" r="3.5" fill="#41b183" opacity="0.6" />
            <circle cx="124" cy="100" r="3" fill="#9bd96b" opacity="0.8" />
          </g>
          <g style={{ animation: "g-drift 17s var(--ease-in-out-soft) 2s infinite reverse" }}>
            <path d="M520 560l38-20 34 18M558 540l4-36" stroke="#41b183" strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
            <circle cx="520" cy="560" r="4" fill="#41b183" opacity="0.6" />
            <circle cx="558" cy="540" r="5.5" fill="#20a7db" opacity="0.5" />
            <circle cx="592" cy="558" r="3" fill="#9bd96b" opacity="0.8" />
            <circle cx="562" cy="504" r="3" fill="#087ecd" opacity="0.5" />
          </g>
        </g>

        {/* Particles */}
        {[
          { x: 228, y: 120, r: 3, d: "0s" },
          { x: 560, y: 300, r: 2.5, d: "1.2s" },
          { x: 104, y: 300, r: 2, d: "2.1s" },
          { x: 420, y: 560, r: 3, d: "0.7s" },
          { x: 600, y: 140, r: 2, d: "2.8s" },
        ].map((p) => (
          <circle
            key={`${p.x}-${p.y}`}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="#20a7db"
            style={{ transformOrigin: `${p.x}px ${p.y}px`, animation: `g-pulse 4.5s ease-in-out ${p.d} infinite` }}
          />
        ))}
      </svg>
    </SceneMotion>
  );
}
