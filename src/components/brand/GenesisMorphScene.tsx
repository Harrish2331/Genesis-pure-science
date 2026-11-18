"use client";

import { useEffect, useRef } from "react";

/**
 * The hero centrepiece: "from molecule to medicine", told by one cloud of
 * particles in the logo's gradient.
 *
 *   dust → DNA double helix → living cell (membrane + nucleus) → the Genesis G
 *   (with the emblem's two molecule dots) → back to the helix, on a loop.
 *
 * Every particle keeps its place in the logo gradient (by height) through
 * every form, so each change reads as one material re-forming: particles
 * leave top-first in a ripple and swirl through a brief vortex on the way.
 * The scene turns one full revolution between helix and G, and comes to rest
 * facing the viewer as the G forms, so the brand mark is always legible.
 *
 * Drawn as a true 3D projection on one <canvas>, depth-sorted, with
 * pre-rendered glossy sprites (no per-frame gradients or allocation).
 *
 * Cost control: ~1000 particles on wide screens, ~560 on phones; device
 * pixel ratio capped at 2 (1.5 on phones); the loop stops while the scene is off-screen or
 * the tab is hidden; time is held (the particles wait as dust) while the
 * intro splash is showing; under prefers-reduced-motion a single still frame
 * of the helix is drawn. Pointer parallax only on fine pointers. Decorative:
 * hidden from assistive technology.
 */

type V3 = [number, number, number];

/** Small seeded PRNG, so the forms are identical on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly spread points on a sphere surface. */
function fibSphere(n: number, r: number, c: V3 = [0, 0, 0]): V3[] {
  const out: V3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const rr = Math.sqrt(1 - y * y);
    const a = i * golden;
    out.push([c[0] + Math.cos(a) * rr * r, c[1] + y * r, c[2] + Math.sin(a) * rr * r]);
  }
  return out;
}

/** A random direction (uniform on the sphere). */
function dir(rand: () => number): V3 {
  const y = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - y * y);
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}

/** DNA double helix: two backbones and the base-pair rungs between them. */
function helixForm(n: number, rand: () => number) {
  const RUNGS = 20;
  const perRung = Math.max(4, Math.round((n * 0.22) / RUNGS));
  const strandEach = Math.floor((n - RUNGS * perRung) / 2);
  const H = 1.1;
  const radius = 0.5;
  const turns = 1.25;
  const at = (strand: number, t: number): V3 => {
    const a = t * Math.PI * turns + strand * Math.PI;
    return [Math.cos(a) * radius, t * H, Math.sin(a) * radius];
  };
  const pts: V3[] = [];
  const rungs: [number, number][] = [];
  for (let s = 0; s < 2; s++) {
    const count = s === 0 ? n - RUNGS * perRung - strandEach : strandEach;
    for (let k = 0; k < count; k++) {
      const p = at(s, -1 + (2 * k) / (count - 1));
      const j = 0.035;
      pts.push([p[0] + (rand() - 0.5) * j, p[1] + (rand() - 0.5) * j, p[2] + (rand() - 0.5) * j]);
    }
  }
  for (let r = 0; r < RUNGS; r++) {
    const t = -1 + (2 * (r + 0.5)) / RUNGS;
    const a = at(0, t);
    const b = at(1, t);
    const first = pts.length;
    for (let q = 0; q < perRung; q++) {
      const f = (q + 0.5) / perRung;
      pts.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
    }
    rungs.push([first, pts.length - 1]);
  }
  return { pts, rungs };
}

/** A living cell: membrane, nucleus, and scattered contents between. */
function cellForm(n: number, rand: () => number): V3[] {
  const membrane = Math.round(n * 0.58);
  const nucleus = Math.round(n * 0.2);
  const pts = [...fibSphere(membrane, 1), ...fibSphere(nucleus, 0.34, [0.06, 0.04, 0])];
  while (pts.length < n) {
    const d = dir(rand);
    const r = 0.5 + rand() * 0.36;
    pts.push([d[0] * r, d[1] * r, d[2] * r]);
  }
  return pts.map(([x, y, z]) => [x, y * 0.94, z]);
}

/** The Genesis G: an open ring with its crossbar, and the emblem's two molecule dots. */
function gForm(n: number, rand: () => number): V3[] {
  const pts: V3[] = [];
  const Rm = 0.8;
  const dotsN = Math.round(n * 0.15);
  const barN = Math.round(n * 0.11);
  const stemN = Math.round(n * 0.05);
  const arcN = n - dotsN - barN - stemN;
  const tube = (cx: number, cy: number, r: number): V3 => {
    const phi = rand() * Math.PI * 2;
    const rt = r * Math.sqrt(rand());
    return [cx + Math.cos(phi) * rt * 0.6, cy + Math.sin(phi) * rt * 0.6, Math.sin(phi * 1.7) * rt];
  };
  // The ring: from the opening at upper right, round over the top, left and
  // bottom, to the right-hand side where the crossbar turns inward.
  const th0 = Math.PI * 0.27;
  const th1 = Math.PI * 2;
  for (let k = 0; k < arcN; k++) {
    const th = th0 + ((th1 - th0) * (k + rand() * 0.6)) / arcN;
    const phi = rand() * Math.PI * 2;
    const rt = 0.11 * Math.sqrt(rand());
    const rr = Rm + Math.cos(phi) * rt;
    pts.push([Math.cos(th) * rr, Math.sin(th) * rr, Math.sin(phi) * rt]);
  }
  for (let k = 0; k < barN; k++) {
    const x = Rm - 0.02 - (0.46 * (k + rand())) / barN;
    pts.push(tube(x, -0.02, 0.09));
  }
  // Two molecule dots above the opening, joined to the ring by a short stem.
  const d1: V3 = [0.66, 1.0, 0];
  const d2: V3 = [0.98, 0.78, 0];
  const big = Math.round(dotsN * 0.58);
  pts.push(...fibSphere(big, 0.13, d1), ...fibSphere(dotsN - big, 0.1, d2));
  const s0: V3 = [Math.cos(th0) * Rm, Math.sin(th0) * Rm, 0];
  for (let k = 0; k < stemN; k++) {
    const f = (k + 0.5) / stemN;
    const [a, b] = f < 0.55 ? [s0, d1] : [d1, d2];
    const g = f < 0.55 ? f / 0.55 : (f - 0.55) / 0.45;
    pts.push([a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g, (rand() - 0.5) * 0.04]);
  }
  // Centre the mark.
  return pts.map(([x, y, z]) => [(x - 0.1) * 0.98, (y - 0.08) * 0.98, z]);
}

/** Dust: where the particles wait before the first helix assembles. */
function dustForm(n: number, rand: () => number): V3[] {
  return Array.from({ length: n }, () => {
    const d = dir(rand);
    // Kept inside the canvas: wider than the forms, never past its edge.
    const r = 0.8 + rand() * 0.38;
    return [d[0] * r, d[1] * r * 0.95, d[2] * r * 0.7] as V3;
  });
}

/** The logo's gradient, top to bottom: deep blue, sky, teal, leaf, lime. */
const STOPS = ["#087ecd", "#20a7db", "#3cc0c4", "#41b183", "#9bd96b"];
const SHADES = 10;

function hexRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function gradientColour(f: number) {
  const x = Math.max(0, Math.min(1, f)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const a = hexRgb(STOPS[i]);
  const b = hexRgb(STOPS[i + 1]);
  const t = x - i;
  return a.map((v, k) => Math.round(v + (b[k] - v) * t));
}

/**
 * A glossy particle: a shaded body with a specular point, filling the sprite
 * (no halo: a halo would quadruple the pixels painted per particle).
 */
function sprite([r, g, b]: number[], size = 32) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const s = size / 2;
  const body = x.createRadialGradient(s * 0.64, s * 0.56, s * 0.08, s, s, s);
  body.addColorStop(0, `rgb(${Math.min(255, r + 120)},${Math.min(255, g + 110)},${Math.min(255, b + 90)})`);
  body.addColorStop(0.55, `rgb(${r},${g},${b})`);
  body.addColorStop(1, `rgb(${Math.round(r * 0.55)},${Math.round(g * 0.55)},${Math.round(b * 0.65)})`);
  x.fillStyle = body;
  x.beginPath();
  x.arc(s, s, s * 0.96, 0, Math.PI * 2);
  x.fill();
  return c;
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeSine = (p: number) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, p)))) / 2;

/** Timeline, in seconds. */
const INTRO = 2.4; // dust → helix
const HOLD = 4.6;
const MORPH = 2.4;
const STEP = HOLD + MORPH;
const CYCLE = 3 * STEP; // helix, cell, G
/** The scene spins one revolution from the start of the helix to the moment the G has formed. */
const SPIN_WINDOW = 2 * STEP; // helix hold → end of the cell→G morph
const STAGGER = 0.42;

export function GenesisMorphScene({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const N = window.innerWidth < 640 ? 560 : 1000;

    // ── Forms, each in the same particle order (ranked by height) ────────
    const rand = rng(20261113);
    const helix = helixForm(N, rand);
    const raw = [helix.pts, cellForm(N, rand), gForm(N, rand)];
    const forms: Float32Array[] = [];
    let helixRank: number[] = [];
    raw.forEach((pts, f) => {
      const idx = pts.map((_, i) => i).sort((a, b) => pts[b][1] - pts[a][1]);
      const arr = new Float32Array(N * 3);
      idx.forEach((src, rank) => arr.set(pts[src], rank * 3));
      forms.push(arr);
      if (f === 0) {
        helixRank = new Array(N);
        idx.forEach((src, rank) => (helixRank[src] = rank));
      }
    });
    const dust = new Float32Array(N * 3);
    dustForm(N, rand).forEach((p, i) => dust.set(p, i * 3));
    const rungs = helix.rungs.map(([a, b]) => [helixRank[a], helixRank[b]] as const);

    // Per-particle character: colour by rank, size, morph delay, twinkle phase.
    const sprites = Array.from({ length: SHADES }, (_, i) => sprite(gradientColour(i / (SHADES - 1))));
    const shade = new Uint8Array(N);
    const size = new Float32Array(N);
    const delay = new Float32Array(N);
    const phase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      shade[i] = Math.min(SHADES - 1, Math.floor((i / N) * SHADES));
      size[i] = 0.75 + rand() * 0.6;
      delay[i] = (i / N) * STAGGER + rand() * 0.12;
      phase[i] = rand() * Math.PI * 2;
    }

    let w = 0;
    let h = 0;
    const resize = () => {
      const r = el.getBoundingClientRect();
      // Small particles stay crisp at 1.5x; phones rarely need more.
      const dpr = Math.min(N < 1000 ? 1.5 : 2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(reduce ? INTRO + 2.2 : clock);
    };

    // Pointer parallax, eased toward its target each frame.
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const proj = new Float32Array(N * 3);
    const order = new Uint16Array(N);
    for (let i = 0; i < N; i++) order[i] = i;
    const byDepth = (a: number, b: number) => proj[a * 3 + 2] - proj[b * 3 + 2];

    /** Which forms are blending at time t, and how far. */
    function state(t: number) {
      // The rungs only appear once the backbones have nearly formed.
      if (t < INTRO) return { from: dust, to: forms[0], p: t / INTRO, wHelix: Math.max(0, (t / INTRO - 0.75) / 0.25), wG: 0, spin: 0 };
      const tau = (t - INTRO) % CYCLE;
      const seg = Math.floor(tau / STEP);
      const local = tau - seg * STEP;
      const p = local < HOLD ? 0 : (local - HOLD) / MORPH;
      const e = ease(p);
      const next = (seg + 1) % 3;
      const weight = (k: number) => (seg === k ? 1 - e : 0) + (next === k ? e : 0);
      return {
        from: forms[seg],
        to: forms[next],
        p,
        wHelix: weight(0),
        wG: weight(2),
        spin: Math.PI * 2 * easeSine(tau / SPIN_WINDOW),
      };
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const s0 = Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2;
      const R = s0 * 0.35;
      const fov = 3.4;
      const { from, to, p, wHelix, wG, spin } = state(t);

      // Rotation: the cycle's revolution plus a gentle sway; the tilt eases
      // to face-on while the G is shown. Pointer adds a little parallax.
      const ay = spin + Math.sin(t * 0.5) * 0.16 + px * 0.3;
      const ax = -0.3 * (1 - wG) + Math.sin(t * 0.31) * 0.05 + py * 0.2;
      const cyA = Math.cos(ay);
      const syA = Math.sin(ay);
      const cxA = Math.cos(ax);
      const sxA = Math.sin(ax);
      const span = 1 + STAGGER + 0.12;

      for (let i = 0; i < N; i++) {
        const k = i * 3;
        let x: number;
        let y: number;
        let z: number;
        if (p <= 0) {
          x = from[k];
          y = from[k + 1];
          z = from[k + 2];
        } else {
          const l = ease(Math.max(0, Math.min(1, p * span - delay[i])));
          x = from[k] + (to[k] - from[k]) * l;
          y = from[k + 1] + (to[k + 1] - from[k + 1]) * l;
          z = from[k + 2] + (to[k + 2] - from[k + 2]) * l;
          // Mid-flight: a brief vortex — swing round the axis and breathe out.
          const b = Math.sin(Math.PI * l);
          if (b > 0.001) {
            const sw = b * 0.9;
            const c = Math.cos(sw);
            const s = Math.sin(sw);
            const out = 1 + b * 0.16;
            const nx = (x * c - z * s) * out;
            z = (x * s + z * c) * out;
            x = nx;
          }
        }
        const x1 = x * cyA + z * syA;
        const z1 = -x * syA + z * cyA;
        const y2 = y * cxA - z1 * sxA;
        const z2 = y * sxA + z1 * cxA;
        const sc = fov / (fov - z2);
        proj[k] = cx + x1 * R * sc;
        proj[k + 1] = cy - y2 * R * sc;
        proj[k + 2] = z2;
      }

      // Base-pair rungs while the helix is (becoming) visible.
      if (wHelix > 0.02) {
        ctx!.lineCap = "round";
        for (const [a, b] of rungs) {
          const z = (proj[a * 3 + 2] + proj[b * 3 + 2]) / 2;
          const depth = Math.max(0, Math.min(1, (z + 1) / 2));
          ctx!.strokeStyle = `rgba(32,167,219,${(0.12 + depth * 0.3) * wHelix})`;
          ctx!.lineWidth = 0.8 + depth * 1.4;
          ctx!.beginPath();
          ctx!.moveTo(proj[a * 3], proj[a * 3 + 1]);
          ctx!.lineTo(proj[b * 3], proj[b * 3 + 1]);
          ctx!.stroke();
        }
      }

      order.sort(byDepth);
      for (let n = 0; n < N; n++) {
        const i = order[n];
        const z = proj[i * 3 + 2];
        const depth = Math.max(0, Math.min(1, (z + 1.2) / 2.4));
        // Particle radius (half the drawn size).
        const r = R * (0.013 + depth * 0.012) * size[i] * Math.min(1.35, fov / (fov - z));
        ctx!.globalAlpha = (0.3 + depth * 0.7) * (0.82 + 0.18 * Math.sin(t * 2.2 + phase[i]));
        ctx!.drawImage(sprites[shade[i]], proj[i * 3] - r, proj[i * 3 + 1] - r, r * 2, r * 2);
      }
      ctx!.globalAlpha = 1;
    }

    // ── Loop: only while visible on screen and the tab is shown ─────────
    let raf = 0;
    let running = false;
    let visible = false;
    let clock = 0; // scene time, in seconds
    let last = 0;
    const root = document.documentElement;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Hold the particles as dust while the intro splash is showing.
      if (!root.hasAttribute("data-intro")) clock += dt;
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      draw(clock);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const should = visible && !document.hidden && !reduce;
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(resize);
    io.observe(el);
    ro.observe(el);
    document.addEventListener("visibilitychange", sync);
    if (fine && !reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerleave", onLeave);
    }
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className={`relative ${className ?? ""}`} aria-hidden="true">
      {/* A soft light behind the sculpture (CSS, so it costs nothing per frame). */}
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgb(156_232_232/0.45),rgb(32_167_219/0.08)_60%,transparent)]" />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
