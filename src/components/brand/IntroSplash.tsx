"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { EMBLEM } from "@/lib/brand";

/*
 * The molecular ring: six nodes on a hexagon (a benzene-like ring, echoing
 * the emblem's own molecule), in a 200×200 box centred on the emblem. Each
 * node flies in from its own direction before the bonds draw between them.
 * Node colours walk the logo's gradient: deep blue → sky → leaf → lime.
 */
const R = 86;
const NODE_COLOURS = ["#20a7db", "#9ce8e8", "#41b183", "#9bd96b", "#0a8fd8", "#e8e5f7"];
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return { x: 100 + R * Math.cos(a), y: 100 + R * Math.sin(a), fx: Math.cos(a + 0.5) * 170, fy: Math.sin(a + 0.5) * 170 };
});
const HEX_PATH = `M ${HEX.map((p) => `${r1(p.x)} ${r1(p.y)}`).join(" L ")} Z`;

/* Background particles: [left %, top %, size px, delay s, duration s, colour]. */
const PARTICLES = [
  [8, 18, 3, 0, 2.6, "#9ce8e8"], [18, 64, 2, 0.4, 3.1, "#e8e5f7"], [27, 32, 2, 0.2, 2.8, "#9bd96b"], [34, 84, 3, 0.6, 2.5, "#20a7db"],
  [44, 10, 2, 0.1, 3.2, "#e8e5f7"], [58, 90, 2, 0.5, 2.7, "#9ce8e8"], [66, 22, 3, 0.3, 3.0, "#41b183"], [74, 70, 2, 0.15, 2.6, "#e8e5f7"],
  [83, 40, 3, 0.45, 3.1, "#9ce8e8"], [92, 14, 2, 0.25, 2.7, "#9bd96b"], [95, 78, 3, 0.05, 3.0, "#20a7db"], [4, 88, 2, 0.35, 2.8, "#e8e5f7"],
  [52, 48, 2, 0.55, 2.5, "#9ce8e8"], [14, 42, 2, 0.65, 3.2, "#41b183"], [86, 58, 2, 0.7, 2.7, "#e8e5f7"], [40, 60, 2, 0.8, 3.0, "#9bd96b"],
] as const;

/* Glitter: four-point sparkles that flash once or twice — [left %, top %, size px, delay s, colour]. */
const SPARKLES = [
  [22, 24, 14, 0.9, "#ffffff"], [76, 30, 18, 1.3, "#9ce8e8"], [30, 72, 12, 1.7, "#9bd96b"], [68, 76, 16, 1.1, "#ffffff"],
  [12, 52, 10, 2.1, "#e8e5f7"], [88, 50, 12, 1.9, "#ffffff"], [50, 14, 10, 2.4, "#9ce8e8"], [40, 86, 10, 2.6, "#ffffff"],
  [61, 18, 9, 0.7, "#e8e5f7"], [36, 20, 8, 1.5, "#9bd96b"], [80, 86, 9, 2.2, "#9ce8e8"], [16, 80, 11, 2.8, "#ffffff"],
] as const;

/* Faint molecule clusters drifting in the background: [left %, top %, size px, rotation, delay s]. */
const CLUSTERS = [
  [9, 12, 120, -12, 0],
  [78, 64, 150, 18, 0.2],
  [70, 6, 96, 40, 0.35],
  [6, 66, 110, 28, 0.5],
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
      <path d="M20 70 L45 45 L80 52 M45 45 L50 15" stroke="#9ce8e8" strokeOpacity="0.6" strokeWidth="1.2" />
      <circle cx="20" cy="70" r="5" fill="#20a7db" />
      <circle cx="45" cy="45" r="7" fill="#e8e5f7" />
      <circle cx="80" cy="52" r="5" fill="#9bd96b" />
      <circle cx="50" cy="15" r="4" fill="#9ce8e8" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 0 C12.9 7.4 16.6 11.1 24 12 C16.6 12.9 12.9 16.6 12 24 C11.1 16.6 7.4 12.9 0 12 C7.4 11.1 11.1 7.4 12 0 Z" fill="currentColor" />
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
      <div className="intro-aurora">
        <span className="intro-aurora-a" />
        <span className="intro-aurora-b" />
        <span className="intro-aurora-c" />
      </div>
      <div className="intro-glow" />
      <span className="intro-beam" />
      {CLUSTERS.map(([x, y, s, rot, d], i) => (
        <div
          key={i}
          className="intro-cluster"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, rotate: `${rot}deg`, animationDelay: `${d}s, ${d}s` }}
        >
          <Cluster />
        </div>
      ))}
      {PARTICLES.map(([x, y, s, d, dur, c], i) => (
        <span
          key={i}
          className="intro-particle"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, color: c, animationDelay: `${d}s`, animationDuration: `${dur}s` }}
        />
      ))}
      {SPARKLES.map(([x, y, s, d, c], i) => (
        <span key={i} className="intro-sparkle" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, color: c, animationDelay: `${d}s` }}>
          <Sparkle />
        </span>
      ))}

      <div className="intro-stage">
        <div className="intro-mark">
          <span className="intro-halo" />
          <span className="intro-ripple" />
          <span className="intro-ripple intro-ripple-2" />
          <svg className="intro-ring" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="intro-bond-grad" gradientUnits="userSpaceOnUse" x1="14" y1="14" x2="186" y2="186">
                <stop offset="0" stopColor="#20a7db" />
                <stop offset="0.45" stopColor="#9ce8e8" />
                <stop offset="0.75" stopColor="#41b183" />
                <stop offset="1" stopColor="#9bd96b" />
              </linearGradient>
            </defs>
            {/* Orbit paths; must match ORBITS in globals.css (radius × squash, tilt). */}
            <ellipse cx="100" cy="100" rx="122" ry="43.9" transform="rotate(-18 100 100)" className="intro-orbit-line" />
            <ellipse cx="100" cy="100" rx="116" ry="48.7" transform="rotate(32 100 100)" className="intro-orbit-line intro-orbit-line-b" />
            <g className="intro-hex">
              {/* Each bond twice: a wide, faint stroke under a fine one reads as a glow, without a filter. */}
              {["intro-bond intro-bond-glow", "intro-bond"].map((cls) =>
                HEX.map((p, i) => {
                  const q = HEX[(i + 1) % 6];
                  return (
                    <line
                      key={`${cls}-${i}`}
                      x1={r1(p.x)}
                      y1={r1(p.y)}
                      x2={r1(q.x)}
                      y2={r1(q.y)}
                      pathLength={1}
                      className={cls}
                      style={{ animationDelay: `${0.62 + i * 0.09}s` }}
                    />
                  );
                }),
              )}
              {/* A spark of light that keeps travelling around the bonds. */}
              <path d={HEX_PATH} pathLength={1} className="intro-pulse" />
              {HEX.map((p, i) => (
                <g key={i}>
                  <circle cx={r1(p.x)} cy={r1(p.y)} r={9} className="intro-node-glow" style={{ fill: NODE_COLOURS[i], animationDelay: `${0.85 + i * 0.07}s` }} />
                  <circle
                    cx={r1(p.x)}
                    cy={r1(p.y)}
                    r={4.6}
                    className="intro-node"
                    style={{
                      fill: NODE_COLOURS[i],
                      ["--fx" as string]: `${r1(p.fx)}px`,
                      ["--fy" as string]: `${r1(p.fy)}px`,
                      animationDelay: `${i * 0.08}s, ${1.4 + i * 0.14}s`,
                    }}
                  />
                </g>
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
          <span className="intro-flare" />
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
        <p className="intro-slogan">
          <span>Excellence In Every Molecule</span>
        </p>
      </div>
    </div>
  );
}
