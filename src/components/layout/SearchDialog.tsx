"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, CloseIcon, SearchIcon } from "@/components/ui/Icons";

type Hit = { id: string; type: "product" | "insight" | "notice" | "page"; title: string; url: string; label?: string; snippet: string };

const TYPE_LABEL: Record<Hit["type"], string> = {
  product: "Product",
  insight: "Insight",
  notice: "Notice",
  page: "Page",
};

/**
 * Site search, as a modal dialog. Results come from /api/search, which only
 * indexes published content. Debounced, cancellable (a slow response can
 * never overwrite a newer one), keyboard-navigable as a combobox, and usable
 * full-screen on phones.
 */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && d.open) d.close();
  }, [open]);

  const query = q.trim();
  const short = query.length < 2;

  useEffect(() => {
    if (short) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { results: Hit[] };
        setHits(data.results);
        setActive(data.results.length ? 0 : -1);
        setState("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [query, short]);

  const view = short ? "idle" : state;
  const shownHits = short ? [] : hits;

  const go = useCallback(
    (url: string) => {
      onClose();
      router.push(url);
    },
    [onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(shownHits.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && shownHits[active]) go(shownHits[active].url);
      else if (q.trim().length >= 2) go(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label="Search Genesis Pure Lifesciences"
      className="m-0 h-dvh max-h-dvh w-full max-w-none bg-white p-0 backdrop:bg-ink/35 backdrop:backdrop-blur-sm sm:mx-auto sm:mt-[9vh] sm:h-auto sm:max-h-[78vh] sm:max-w-2xl sm:rounded-[1.5rem] sm:shadow-2xl open:animate-[g-rise_260ms_var(--ease-out-soft)]"
    >
      <div className="flex h-full flex-col sm:max-h-[78vh]">
        <form
          role="search"
          action="/search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim().length >= 2) go(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
          className="flex items-center gap-3 border-b border-line px-5 py-4"
        >
          <SearchIcon size={22} className="shrink-0 text-action" />
          <label htmlFor="site-search" className="sr-only">
            Search products, insights and notices
          </label>
          <input
            ref={inputRef}
            id="site-search"
            name="q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search products, insights, notices…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (e.target.value.trim().length >= 2) setState("loading");
            }}
            onKeyDown={onKeyDown}
            maxLength={80}
            role="combobox"
            aria-expanded={shownHits.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 && shownHits[active] ? `${listId}-${active}` : undefined}
            className="min-w-0 flex-1 bg-transparent py-2 text-lg text-ink outline-none placeholder:text-muted/80"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted ring-1 ring-line hover:text-ink"
            aria-label="Close search"
          >
            <CloseIcon size={18} />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto px-2 py-3" aria-live="polite">
          {view === "idle" ? (
            <p className="px-4 py-6 text-sm text-muted">
              Type at least two characters. Try a product name, a category such as{" "}
              <button type="button" className="font-semibold text-action underline-offset-2 hover:underline" onClick={() => setQ("women")}>
                women
              </button>{" "}
              or{" "}
              <button type="button" className="font-semibold text-action underline-offset-2 hover:underline" onClick={() => setQ("surgical")}>
                surgical
              </button>
              , or a topic.
            </p>
          ) : null}
          {view === "loading" && shownHits.length === 0 ? (
            <div className="space-y-2 px-3 py-3" aria-label="Searching">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-cloud" />
              ))}
            </div>
          ) : null}
          {view === "error" ? (
            <p className="px-4 py-6 text-sm text-danger">Search is unavailable at the moment. Please try again.</p>
          ) : null}
          {view === "done" && shownHits.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-display text-lg text-ink">No results for “{q.trim()}”</p>
              <p className="mt-2 text-sm text-muted">Check the spelling, try a shorter word, or browse the product catalogue.</p>
              <Link href="/products" onClick={onClose} className="btn btn-secondary btn-sm mt-5">
                Browse products
              </Link>
            </div>
          ) : null}
          {shownHits.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Search results" className="space-y-1">
              {shownHits.map((h, i) => (
                <li key={h.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={h.url}
                    onClick={onClose}
                    onMouseEnter={() => setActive(i)}
                    className={`group flex items-start gap-4 rounded-xl px-3 py-3 transition-colors ${i === active ? "bg-mist" : "hover:bg-cloud"}`}
                  >
                    <span className="mt-0.5 w-16 shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-action">
                      {TYPE_LABEL[h.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.02rem] font-medium text-ink">{h.title}</span>
                      {h.label ? <span className="block text-xs text-muted">{h.label}</span> : null}
                      {h.snippet ? <span className="mt-1 line-clamp-2 block text-sm text-body">{h.snippet}</span> : null}
                    </span>
                    <ArrowRight size={16} className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-action" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {q.trim().length >= 2 ? (
          <div className="border-t border-line px-5 py-3 text-right">
            <Link href={`/search?q=${encodeURIComponent(q.trim())}`} onClick={onClose} className="btn btn-ghost text-sm">
              See all results <ArrowRight size={16} className="btn-arrow" />
            </Link>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
