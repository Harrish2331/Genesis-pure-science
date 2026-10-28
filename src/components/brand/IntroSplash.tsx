"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { EMBLEM } from "@/lib/brand";

/*
 * The molecular ring: six nodes on a hexagon (a benzene-like ring, echoing
 * the emblem's own molecule), in a 200×200 box centred on the emblem. Each
 * node flies in from its own direction before the bonds draw between them.
 */
const R = 86;
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return { x: 100 + R * Math.cos(a), y: 100 + R * Math.sin(a), fx: Math.cos(a + 0.5) * 150, fy: Math.sin(a + 0.5) * 150 };
});
const HEX_PATH = `M ${HEX.map((p) => `${r1(p.x)} ${r1(p.y)}`).join(" L ")} Z`;

/* Background particles: [left %, top %, size px, delay s, duration s]. */
const PARTICLES = [
  [8, 18, 3, 0, 1.9], [18, 64, 2, 0.4, 2.3], [27, 32, 2, 0.2, 2.1], [34, 84, 3, 0.6, 1.8],
  [44, 10, 2, 0.1, 2.4], [58, 90, 2, 0.5, 2.0], [66, 22, 3, 0.3, 2.2], [74, 70, 2, 0.15, 1.9],
  [83, 40, 3, 0.45, 2.3], [92, 14, 2, 0.25, 2.0], [95, 78, 3, 0.05, 2.2], [4, 88, 2, 0.35, 2.1],
  [52, 48, 2, 0.55, 1.8], [14, 42, 2, 0.65, 2.4], [86, 58, 2, 0.7, 2.0], [40, 60, 2, 0.8, 2.2],
] as const;

/* Faint molecule clusters drifting in the background: [left %, top %, size px, rotation, delay s]. */
const CLUSTERS = [
  [9, 12, 120, -12, 0],
  [78, 64, 150, 18, 0.2],
  [70, 6, 96, 40, 0.35],
] as const;

const NAME = "GENESIS PURE LIFESCIENCES";
/* Words with the running index of their first letter, for the letter-by-letter reveal. */
const WORDS = NAME.split(" ").map((word, i, all) => ({ word, start: all.slice(0, i).join("").length }));

function r1(n: number) {
  return Math.round(n * 10) / 10;
}

function Cluster() {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <path d="M20 70 L45 45 L80 52 M45 45 L50 15" stroke="#9ce8e8" strokeOpacity="0.55" strokeWidth="1.2" />
      <circle cx="20" cy="70" r="5" fill="#e8e5f7" />
      <circle cx="45" cy="45" r="7" fill="#e8e5f7" />
      <circle cx="80" cy="52" r="5" fill="#9ce8e8" />
      <circle cx="50" cy="15" r="4" fill="#9ce8e8" />
    </svg>
  );
}

/**
 * Full-screen intro overlay. Rendered on every public page but shown only
 * while html[data-intro] is set (see src/lib/intro.ts). Purely decorative and
 * hidden from assistive technology: the real page is already in the document
 * underneath, so nothing is announced twice and focus is never trapped.
 */
export function IntroSplash() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || !root.hasAttribute("data-intro")) return;
    const finish = () => root.removeAttribute("data-intro");
    // On a slow device the intro may already have played out before hydration.
    if (getComputedStyle(el).visibility === "hidden") return finish();
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName.startsWith("intro-out")) finish();
    };
    // Any click, tap or key press skips straight to the site.
    const skip = () => {
      if (root.getAttribute("data-intro") === "play") root.setAttribute("data-intro", "skip");
    };
    el.addEventListener("animationend", onEnd);
    el.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      el.removeEventListener("animationend", onEnd);
      el.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro-glow" />
      {CLUSTERS.map(([x, y, s, rot, d], i) => (
        <div
          key={i}
          className="intro-cluster"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, rotate: `${rot}deg`, animationDelay: `${d}s, ${d}s` }}
        >
          <Cluster />
        </div>
      ))}
      {PARTICLES.map(([x, y, s, d, dur], i) => (
        <span
          key={i}
          className="intro-particle"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s`, animationDuration: `${dur}s` }}
        />
      ))}

      <div className="intro-stage">
        <div className="intro-mark">
          <span className="intro-halo" />
          <span className="intro-ripple" />
          <span className="intro-ripple intro-ripple-2" />
          <svg className="intro-ring" viewBox="0 0 200 200" fill="none">
            {/* Orbit paths; must match ORBITS in globals.css (radius × squash, tilt). */}
            <ellipse cx="100" cy="100" rx="122" ry="43.9" transform="rotate(-18 100 100)" className="intro-orbit-line" />
            <ellipse cx="100" cy="100" rx="116" ry="48.7" transform="rotate(32 100 100)" className="intro-orbit-line intro-orbit-line-b" />
            <g className="intro-hex">
              {HEX.map((p, i) => {
                const q = HEX[(i + 1) % 6];
                return (
                  <line
                    key={i}
                    x1={r1(p.x)}
                    y1={r1(p.y)}
                    x2={r1(q.x)}
                    y2={r1(q.y)}
                    pathLength={1}
                    className="intro-bond"
                    style={{ animationDelay: `${0.38 + i * 0.06}s` }}
                  />
                );
              })}
              {/* A spark of light that keeps travelling around the bonds. */}
              <path d={HEX_PATH} pathLength={1} className="intro-pulse" />
              {HEX.map((p, i) => (
                <circle
                  key={i}
                  cx={r1(p.x)}
                  cy={r1(p.y)}
                  r={4.4}
                  className="intro-node"
                  style={{ ["--fx" as string]: `${r1(p.fx)}px`, ["--fy" as string]: `${r1(p.fy)}px`, animationDelay: `${i * 0.05}s, ${0.9 + i * 0.12}s` }}
                />
              ))}
            </g>
          </svg>
          <div className="intro-orbit intro-orbit-a">
            <div className="intro-spin">
              <span className="intro-electron" />
            </div>
          </div>
          <div className="intro-orbit intro-orbit-b">
            <div className="intro-spin">
              <span className="intro-electron" />
            </div>
          </div>
          <div className="intro-emblem">
            <div className="intro-float">
              <Image src={EMBLEM.src} alt="" width={EMBLEM.width} height={EMBLEM.height} unoptimized loading="eager" />
              <span className="intro-sheen" />
            </div>
          </div>
        </div>
        <p className="intro-name">
          {WORDS.map(({ word, start }, w) => (
            <span key={word}>
              {w > 0 ? " " : null}
              <span className="intro-word">
                {[...word].map((c, i) => (
                  <span key={i} className="intro-ch" style={{ ["--i" as string]: start + i }}>
                    {c}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </p>
        <p className="intro-slogan">Excellence In Every Molecule</p>
      </div>
    </div>
  );
}
