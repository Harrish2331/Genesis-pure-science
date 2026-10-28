"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Count-up figures, after the reference site's statistics band. Every value
 * passed in is computed from the live catalogue and partner data — this
 * component never holds a number of its own. The final value is in the HTML
 * from the start (no-JS, crawlers, reduced motion); the count-up runs once,
 * when the band scrolls into view.
 */
export function StatsBand({ stats }: { stats: { value: number; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col border-t border-line pt-5" data-reveal>
          <dt className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted">{s.label}</dt>
          <dd className="order-first -mt-1 font-display text-[clamp(2.4rem,1.8rem+2vw,3.6rem)] font-semibold leading-none tracking-[-0.03em] text-ink">
            <CountUp to={s.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 1100);
          setShown(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {String(shown).padStart(2, "0")}
    </span>
  );
}
