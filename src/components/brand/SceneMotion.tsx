"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Behaviour for an animated brand scene, kept separate from its markup so the
 * SVG itself stays server-rendered:
 *
 *   · pauses every animation while the scene is off-screen or the tab is
 *     hidden, so idle loops never burn battery out of sight;
 *   · adds a gentle pointer parallax on devices with a fine pointer — each
 *     layer marked data-depth moves by its own fraction. Skipped entirely
 *     for touch and for prefers-reduced-motion.
 *
 * Updates are batched into one requestAnimationFrame and only write
 * transforms, so they never trigger layout.
 */
export function SceneMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let visible = true;
    const sync = () => el.setAttribute("data-paused", String(!visible || document.hidden));
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;

    if (!reduce && fine) {
      const layers = Array.from(el.querySelectorAll<SVGGElement>("[data-depth]"));
      let tx = 0;
      let ty = 0;
      const apply = () => {
        raf = 0;
        for (const layer of layers) {
          const d = Number(layer.dataset.depth) || 0;
          layer.style.transform = `translate(${(tx * d * 14).toFixed(2)}px, ${(ty * d * 14).toFixed(2)}px)`;
        }
      };
      for (const layer of layers) layer.style.transition = "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";
      onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
        if (!raf) raf = requestAnimationFrame(apply);
      };
      onLeave = () => {
        tx = 0;
        ty = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onLeave) document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
