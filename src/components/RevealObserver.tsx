"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One IntersectionObserver for every [data-reveal] element on the page.
 *
 * Content is never hidden by default: the `js-reveal` class that lowers and
 * fades elements is only added here, after the observer exists, and the CSS
 * ignores it entirely under prefers-reduced-motion. Anything already in view
 * is revealed immediately, so nothing important waits on an animation.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)");
    const vh = window.innerHeight;
    items.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < vh * 0.95) el.classList.add("is-revealed");
      else io.observe(el);
    });
    root.classList.add("js-reveal");
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
