"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";

/**
 * The catalogue's search box. It is a plain GET form (works without
 * JavaScript); with JavaScript it also updates the results as you type,
 * debounced, replacing the URL so the back button is not flooded.
 */
export function CatalogueSearch({ initial, placeholder = "Search products by name, composition…" }: { initial: string; placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      const qs = next.toString();
      start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params intentionally read at fire time
  }, [value]);

  return (
    <form role="search" action={pathname} className="relative w-full" onSubmit={(e) => e.preventDefault()}>
      {Array.from(params.entries())
        .filter(([k]) => k !== "q" && k !== "page")
        .map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <label htmlFor="catalogue-q" className="sr-only">
        Search the catalogue
      </label>
      <SearchIcon size={20} className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${pending ? "animate-pulse text-sky" : "text-muted"}`} />
      <input
        id="catalogue-q"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={80}
        autoComplete="off"
        className="field !rounded-full !pl-12 !pr-12"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-cloud hover:text-ink"
          aria-label="Clear search"
        >
          <CloseIcon size={16} />
        </button>
      ) : null}
      <noscript>
        <button type="submit" className="btn btn-primary btn-sm mt-3">
          Search
        </button>
      </noscript>
    </form>
  );
}
