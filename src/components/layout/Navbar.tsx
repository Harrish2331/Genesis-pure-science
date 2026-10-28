"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav } from "@/content/site";
import { Emblem, Logo } from "@/components/brand/Logo";
import { CloseIcon, MenuIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SearchDialog } from "./SearchDialog";

export type WhatsAppConfig = { href: string | null };

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Site navigation.
 *
 * Top of page: the full stacked logo, as the brand guidelines' website
 * header shows it. Once scrolled, the bar condenses and switches to the
 * symbol — the approved variation "where space is limited" — so the sticky
 * bar stays slim. On small screens the symbol is used throughout and the
 * full logo heads the menu panel.
 */
export function Navbar({ whatsapp }: { whatsapp: WhatsAppConfig }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcut: "/" or Ctrl/⌘+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const d = menuRef.current;
    if (!d) return;
    if (menuOpen && !d.open) d.showModal();
    if (!menuOpen && d.open) d.close();
  }, [menuOpen]);

  const waButton = (compact: boolean) =>
    whatsapp.href ? (
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-whatsapp ${compact ? "btn-sm !px-2.5" : "btn-sm"}`}
        aria-label="Chat with Genesis Pure Lifesciences on WhatsApp (opens WhatsApp)"
        title="Chat on WhatsApp"
      >
        <WhatsAppIcon size={18} />
        {compact ? null : <span>WhatsApp</span>}
      </a>
    ) : null;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled ? "bg-white/92 shadow-[0_1px_0_rgb(201_215_225/0.6),0_12px_30px_-24px_rgb(16_42_67/0.35)] backdrop-blur-xl" : "bg-white"
        }`}
      >
        <a
          href="#main"
          className="absolute left-4 top-3 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-action shadow-lg focus:translate-y-0"
        >
          Skip to content
        </a>
        <nav
          aria-label="Main"
          className={`container-x flex items-center justify-between gap-4 transition-[height] duration-300 ${
            scrolled ? "h-[4.25rem]" : "h-[4.25rem] xl:h-[7.5rem]"
          }`}
        >
          <Link href="/" className="relative flex shrink-0 items-center rounded-md" aria-label="Genesis Pure Lifesciences — home">
            {/* Desktop, top of page: the full logo */}
            <span
              className={`hidden transition-opacity duration-300 xl:block ${scrolled ? "pointer-events-none absolute opacity-0" : "opacity-100"}`}
              aria-hidden={scrolled}
            >
              <Logo height={102} priority />
            </span>
            {/* Condensed / mobile: the symbol */}
            <span className={`transition-opacity duration-300 ${scrolled ? "opacity-100" : "xl:pointer-events-none xl:absolute xl:opacity-0"}`}>
              <Emblem height={46} priority decorative />
            </span>
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative block rounded-md px-2.5 py-2 text-[0.875rem] font-medium tracking-[0.005em] transition-colors 2xl:px-3 ${
                      active ? "text-action" : "text-ink/80 hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute inset-x-2.5 -bottom-0.5 h-[2px] origin-left rounded-full bg-[image:var(--grad-line)] transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink/80 ring-1 ring-line-strong transition hover:text-action hover:ring-action/50"
              aria-label="Search the site"
              aria-haspopup="dialog"
            >
              <SearchIcon size={18} />
              <span className="hidden 2xl:inline">Search</span>
            </button>
            {/* Icon only: the floating button carries the full WhatsApp call to action. */}
            {waButton(true)}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink ring-1 ring-line-strong xl:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </nav>
        <div
          className={`h-px bg-[image:var(--grad-line)] transition-opacity duration-500 ${scrolled ? "opacity-70" : "opacity-0"}`}
          aria-hidden="true"
        />
      </header>

      {/* Mobile / tablet menu */}
      <dialog
        ref={menuRef}
        onClose={() => setMenuOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
        aria-label="Site menu"
        className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-white p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm open:animate-[g-fade_240ms_ease]"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between px-6 pt-6">
            <Link href="/" onClick={() => setMenuOpen(false)} aria-label="Genesis Pure Lifesciences — home">
              <Logo height={104} />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-line-strong"
              aria-label="Close menu"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="grad-rule mx-6 mt-6 opacity-60" />
          <ul className="flex-1 overflow-y-auto px-3 py-4">
            {mainNav.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 font-display text-[1.15rem] font-medium transition-colors ${
                      active ? "bg-mist text-action" : "text-ink hover:bg-cloud"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-3 border-t border-line px-6 py-5">
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-sm flex-1">
              Contact our team
            </Link>
            {waButton(false)}
          </div>
        </div>
      </dialog>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
