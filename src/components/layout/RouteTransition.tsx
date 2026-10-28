"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { EMBLEM } from "@/lib/brand";

/** Veil fade-in before the route is pushed — long enough to be fully opaque. */
const COVER_MS = 150;
/** The veil stays at least this long from the click, so it never flickers. */
const MIN_SHOWN_MS = 300;
/** Fade-out; matches .route-veil[data-state="out"] in globals.css. */
const REVEAL_MS = 220;
/** Never hold the veil longer than this, whatever happens to the request. */
const SAFETY_MS = 5000;

type Target = { url: URL; kind: "page" | "query" };

/** What a click on this anchor would do, or null if it is not ours to handle. */
function classify(e: MouseEvent, a: HTMLAnchorElement): Target | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return null;
  const raw = a.getAttribute("href");
  if (!raw || raw.startsWith("#") || /^(mailto|tel|sms|javascript):/i.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(a.href, location.href);
  } catch {
    return null;
  }
  if (url.origin !== location.origin) return null; // external, WhatsApp, etc.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return null;
  if (url.pathname !== location.pathname) return { url, kind: "page" };
  if (url.search !== location.search) return { url, kind: "query" };
  return null; // same page, possibly another #anchor
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Page transitions, centralised.
 *
 *  - Moving to another page: a light brand veil — the emblem inside a small
 *    turning molecular ring, a compact echo of the intro — fades in over the
 *    current page (150 ms), the route is then pushed (it was prefetched at the
 *    click, so loading runs in parallel), and the veil lifts once the new page
 *    has rendered: about 0.5–0.6 s in all. Nothing new is ever shown before it
 *    is covered, and the veil never takes pointer or keyboard focus.
 *  - Only the query string changing (catalogue filters): the thin molecular
 *    progress line, no veil.
 *  - Back/forward, reduced motion, modified clicks, external, WhatsApp,
 *    download and in-page anchor links: left to the browser and router; the
 *    template's short page-enter fade covers history navigation.
 *
 * All state lives in data-state attributes and refs: no React re-renders.
 */
export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const veil = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const startedAt = useRef(0);
  const pending = useRef<string | null>(null);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => {
    const v = veil.current;
    const l = line.current;
    if (!v || !l) return;

    const reveal = () => {
      clear();
      pending.current = null;
      v.dataset.state = "out";
      later(() => (v.dataset.state = "idle"), REVEAL_MS);
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || document.documentElement.hasAttribute("data-intro")) return;
      const target = classify(e, a);
      if (!target) return;
      const href = target.url.pathname + target.url.search + target.url.hash;

      if (target.kind === "query") {
        l.dataset.state = "idle";
        void l.offsetWidth; // restart the line from zero
        l.dataset.state = "loading";
        later(() => (l.dataset.state = "idle"), SAFETY_MS);
        return;
      }
      if (reducedMotion()) return; // plain, immediate navigation

      // Take the navigation over from <Link>, so the page cannot change
      // before the veil covers it.
      e.preventDefault();
      router.prefetch(href);
      const covering = v.dataset.state === "in";
      clear();
      pending.current = href;
      if (!covering) startedAt.current = performance.now();
      v.dataset.state = "in";
      later(() => router.push(href), covering ? 0 : COVER_MS);
      later(reveal, SAFETY_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clear();
    };
  }, [router]);

  // The new route has rendered: lift the veil (after its minimum time) or finish the line.
  useEffect(() => {
    const v = veil.current;
    const l = line.current;
    if (l?.dataset.state === "loading") {
      l.dataset.state = "done";
      window.setTimeout(() => (l.dataset.state = "idle"), 450);
    }
    if (!v || v.dataset.state !== "in" || !pending.current) return;
    const target = new URL(pending.current, location.href);
    if (target.pathname !== location.pathname) return; // an older route committed; keep waiting
    const wait = Math.max(0, MIN_SHOWN_MS - (performance.now() - startedAt.current));
    clear();
    pending.current = null;
    timers.current.push(
      window.setTimeout(() => {
        v.dataset.state = "out";
        timers.current.push(window.setTimeout(() => (v.dataset.state = "idle"), REVEAL_MS));
      }, wait),
    );
  }, [pathname, search]);

  return (
    <>
      <div ref={line} className="nav-progress" data-state="idle" aria-hidden="true">
        <span className="nav-progress-bar" />
        <span className="nav-progress-node" />
      </div>
      <div ref={veil} className="route-veil" data-state="idle" aria-hidden="true">
        <div className="route-veil-mark">
          <svg className="route-veil-ring" viewBox="0 0 100 100" fill="none">
            <path d="M50 8 L86.4 29 L86.4 71 L50 92 L13.6 71 L13.6 29 Z" className="route-veil-bonds" />
            <path d="M50 8 L86.4 29 L86.4 71 L50 92 L13.6 71 L13.6 29 Z" pathLength={1} className="route-veil-spark" />
            {[
              [50, 8],
              [86.4, 29],
              [86.4, 71],
              [50, 92],
              [13.6, 71],
              [13.6, 29],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3.2} className="route-veil-node" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </svg>
          <Image src={EMBLEM.src} alt="" width={EMBLEM.width} height={EMBLEM.height} unoptimized loading="eager" className="route-veil-emblem" />
        </div>
      </div>
    </>
  );
}
