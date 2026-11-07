"use client";

import { useEffect, useRef } from "react";
import { EMBLEM } from "@/lib/brand";

/**
 * The hero centrepiece: a geodesic molecular sphere — the 60-atom, 90-bond
 * truncated-icosahedron cage of the C60 fullerene — turning slowly around the
 * Genesis emblem, with two satellite atoms on tilted orbits.
 *
 * Drawn as a true 3D projection on one <canvas>: atoms are pre-rendered glossy
 * sprites in the logo's gradient (deep blue at the top through sky and leaf to
 * lime), shaded and faded by depth; bonds and atoms are depth-sorted, so the
 * cage's back half passes behind the emblem and its front half in front.
 *
 * Cost control: a fixed ~100 sprite draws per frame, no per-frame allocation
 * of gradients, device pixel ratio capped at 2, the loop stops entirely while
 * the scene is off-screen or the tab is hidden, and under
 * prefers-reduced-motion a single still frame is drawn. Pointer parallax only
 * on fine pointers. Decorative: hidden from assistive technology.
 */

const PHI = (1 + Math.sqrt(5)) / 2;

/** Truncated icosahedron: even permutations of three generator vectors. */
function cage() {
  const gens = [
    [0, 1, 3 * PHI],
    [1, 2 + PHI, 2 * PHI],
    [PHI, 2, 2 * PHI + 1],
  ];
  const out: number[][] = [];
  const seen = new Set<string>();
  for (const [a, b, c] of gens) {
    for (const [x, y, z] of [
      [a, b, c],
      [b, c, a],
      [c, a, b],
    ]) {
      for (const sx of x ? [1, -1] : [1])
        for (const sy of y ? [1, -1] : [1])
          for (const sz of z ? [1, -1] : [1]) {
            const p = [x * sx, y * sy, z * sz];
            const k = p.map((v) => v.toFixed(3)).join(",");
            if (!seen.has(k)) {
              seen.add(k);
              out.push(p);
            }
          }
    }
  }
  const r = Math.hypot(...out[0]);
  const atoms = out.map((p) => p.map((v) => v / r)); // unit sphere
  const bonds: [number, number][] = [];
  const edge = 2 / r;
  for (let i = 0; i < atoms.length; i++)
    for (let j = i + 1; j < atoms.length; j++) {
      const d = Math.hypot(atoms[i][0] - atoms[j][0], atoms[i][1] - atoms[j][1], atoms[i][2] - atoms[j][2]);
      if (Math.abs(d - edge) < 1e-3) bonds.push([i, j]);
    }
  return { atoms, bonds };
}

const { atoms: ATOMS, bonds: BONDS } = cage();
/** The logo's gradient, top to bottom of the sphere. */
const PALETTE = ["#087ecd", "#20a7db", "#3cc0c4", "#41b183", "#9bd96b"];

function hexRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A glossy atom: base colour, a soft key light upper-left, a dark rim. */
function sprite(colour: string, size = 96) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const [r, gr, b] = hexRgb(colour);
  const s = size / 2;
  const body = g.createRadialGradient(s * 0.7, s * 0.62, s * 0.08, s, s, s);
  body.addColorStop(0, `rgb(${Math.min(255, r + 120)},${Math.min(255, gr + 110)},${Math.min(255, b + 90)})`);
  body.addColorStop(0.45, colour);
  body.addColorStop(1, `rgb(${Math.round(r * 0.45)},${Math.round(gr * 0.45)},${Math.round(b * 0.55)})`);
  g.fillStyle = body;
  g.beginPath();
  g.arc(s, s, s * 0.96, 0, Math.PI * 2);
  g.fill();
  const spec = g.createRadialGradient(s * 0.66, s * 0.56, 0, s * 0.66, s * 0.56, s * 0.42);
  spec.addColorStop(0, "rgba(255,255,255,0.9)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spec;
  g.fillRect(0, 0, size, size);
  return c;
}

export function MoleculeScene({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const sprites = PALETTE.map((c) => sprite(c));
    const glowSprite = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(156,232,232,0.9)");
      gr.addColorStop(1, "rgba(156,232,232,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return c;
    })();
    const emblem = new Image();
    emblem.src = EMBLEM.src;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce || !running) draw(still);
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

    const proj = new Float32Array(ATOMS.length * 3);
    const order = ATOMS.map((_, i) => i);
    const bondOrder = BONDS.map((_, i) => i);
    const bondZ = new Float32Array(BONDS.length);
    const colourOf = ATOMS.map((p) => Math.min(PALETTE.length - 1, Math.floor(((p[1] + 1) / 2) * PALETTE.length)));
    const still = 2.2; // seconds into the motion: a balanced pose for the static frame

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const size = Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2 + Math.sin(t * 0.7) * size * 0.012; // gentle float
      const R = size * 0.36;
      const fov = 3.2;

      // Rotation: steady spin about a tilted axis, nudged by the pointer.
      const ay = t * 0.22 + px * 0.35;
      const ax = -0.42 + Math.sin(t * 0.17) * 0.08 + py * 0.25;
      const cyA = Math.cos(ay);
      const syA = Math.sin(ay);
      const cxA = Math.cos(ax);
      const sxA = Math.sin(ax);

      for (let i = 0; i < ATOMS.length; i++) {
        const [x0, y0, z0] = ATOMS[i];
        const x1 = x0 * cyA + z0 * syA;
        const z1 = -x0 * syA + z0 * cyA;
        const y2 = y0 * cxA - z1 * sxA;
        const z2 = y0 * sxA + z1 * cxA;
        const s = fov / (fov - z2);
        proj[i * 3] = cx + x1 * R * s;
        proj[i * 3 + 1] = cy - y2 * R * s;
        proj[i * 3 + 2] = z2;
      }

      // Floor glow under the sphere.
      // A circle drawn in squashed space, so the gradient fades out on every edge.
      ctx!.save();
      ctx!.translate(cx, cy + R * 1.3);
      ctx!.scale(1, 0.2);
      const floor = ctx!.createRadialGradient(0, 0, 0, 0, 0, R);
      floor.addColorStop(0, "rgba(32,167,219,0.2)");
      floor.addColorStop(1, "rgba(32,167,219,0)");
      ctx!.fillStyle = floor;
      ctx!.fillRect(-R, -R, R * 2, R * 2);
      ctx!.restore();

      // Inner light behind the emblem.
      ctx!.globalAlpha = 0.55;
      ctx!.drawImage(glowSprite, cx - R * 0.95, cy - R * 0.95, R * 1.9, R * 1.9);
      ctx!.globalAlpha = 1;

      for (let i = 0; i < BONDS.length; i++) bondZ[i] = (proj[BONDS[i][0] * 3 + 2] + proj[BONDS[i][1] * 3 + 2]) / 2;
      bondOrder.sort((a, b) => bondZ[a] - bondZ[b]);
      order.sort((a, b) => proj[a * 3 + 2] - proj[b * 3 + 2]);

      const bond = (k: number) => {
        const [a, b] = BONDS[k];
        const z = bondZ[k];
        const depth = (z + 1) / 2; // 0 back … 1 front
        ctx!.strokeStyle = `rgba(${depth > 0.5 ? "32,167,219" : "65,74,131"},${0.16 + depth * 0.5})`;
        ctx!.lineWidth = 0.8 + depth * 1.8;
        ctx!.beginPath();
        ctx!.moveTo(proj[a * 3], proj[a * 3 + 1]);
        ctx!.lineTo(proj[b * 3], proj[b * 3 + 1]);
        ctx!.stroke();
      };
      const atom = (i: number) => {
        const z = proj[i * 3 + 2];
        const depth = (z + 1) / 2;
        const r = R * (0.042 + depth * 0.03) * (fov / (fov - z));
        ctx!.globalAlpha = 0.35 + depth * 0.65;
        ctx!.drawImage(sprites[colourOf[i]], proj[i * 3] - r, proj[i * 3 + 1] - r, r * 2, r * 2);
      };

      // Back half, emblem, front half.
      ctx!.lineCap = "round";
      let bi = 0;
      let ai = 0;
      for (; bi < bondOrder.length && bondZ[bondOrder[bi]] < 0; bi++) bond(bondOrder[bi]);
      for (; ai < order.length && proj[order[ai] * 3 + 2] < 0; ai++) atom(order[ai]);
      ctx!.globalAlpha = 1;

      if (emblem.complete && emblem.naturalWidth) {
        const eh = R * 1.05;
        const ew = eh * (EMBLEM.width / EMBLEM.height);
        ctx!.drawImage(emblem, cx - ew / 2, cy - eh / 2 + Math.sin(t * 1.1) * R * 0.025, ew, eh);
      }

      for (; bi < bondOrder.length; bi++) bond(bondOrder[bi]);
      for (; ai < order.length; ai++) atom(order[ai]);

      // Two satellite atoms on tilted orbits outside the cage.
      for (const [rad, tilt, speed, phase, c] of [
        [1.32, -0.35, 0.55, 0, 1],
        [1.22, 0.55, -0.42, 2.1, 4],
      ] as const) {
        const a = t * speed + phase;
        const ox = Math.cos(a) * rad;
        const oz = Math.sin(a) * rad;
        const oy = oz * Math.sin(tilt);
        const z = oz * Math.cos(tilt) * 0.6;
        const s = fov / (fov - z);
        const depth = Math.max(0, Math.min(1, (z + 1) / 2));
        const r = R * 0.07 * s;
        const x = cx + ox * R * s;
        const y = cy - oy * R * s;
        ctx!.globalAlpha = 0.35 + depth * 0.4;
        ctx!.drawImage(glowSprite, x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
        ctx!.globalAlpha = 0.6 + depth * 0.4;
        ctx!.drawImage(sprites[c], x - r, y - r, r * 2, r * 2);
      }
      ctx!.globalAlpha = 1;
    }

    // ── Loop: only while visible on screen and the tab is shown ─────────
    let raf = 0;
    let running = false;
    let visible = false;
    let t0 = performance.now() - still * 1000;
    let last = 0;
    const frame = (now: number) => {
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const should = visible && !document.hidden && !reduce;
      if (should && !running) {
        running = true;
        t0 += performance.now() - last; // resume where it paused
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        last = performance.now();
        cancelAnimationFrame(raf);
      }
    };
    last = performance.now();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(resize);
    io.observe(el);
    ro.observe(el);
    document.addEventListener("visibilitychange", sync);
    emblem.onload = () => {
      if (!running) draw(still);
    };
    if (fine && !reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className={`relative ${className ?? ""}`} aria-hidden="true">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
