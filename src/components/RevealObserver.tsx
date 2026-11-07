"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for every [data-reveal] element on the page.
 *
 * Content is never hidden by default: the `js-reveal` class that lowers and
 * fades elements is only added here, after the observer exists, and the CSS
 * ignores it entirely under prefers-reduced-motion. Anything already in view
 * is revealed immediately, so nothing important waits on an animation.
 *
 * Elements that arrive later — a new route, a catalogue filter that only
 * changes the query string, a client-rendered list — are picked up by a
 * MutationObserver, so a [data-reveal] element can never be left hidden.
 */
export function RevealObserver() {
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

    const track = (el: HTMLElement) => {
      if (el.classList.contains("is-revealed")) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add("is-revealed");
      else io.observe(el);
    };
    const scan = (node: ParentNode) => {
      if (node instanceof HTMLElement && node.hasAttribute("data-reveal")) track(node);
      node.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach(track);
    };

    scan(document);
    root.classList.add("js-reveal");

    // Mutation records already arrive batched (one callback per microtask
    // checkpoint), so scanning here costs one pass per DOM update.
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
