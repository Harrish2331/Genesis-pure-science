"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Emblem } from "@/components/brand/Logo";
import { CloseIcon, ExternalIcon, MenuIcon } from "@/components/ui/Icons";
import { ROLE_LABELS, can, type Role } from "@/lib/auth/roles";

const NAV = [
  { href: "/admin", label: "Dashboard", area: "" },
  { href: "/admin/notices", label: "Notices", area: "notices" },
  { href: "/admin/insights", label: "Insights", area: "insights" },
  { href: "/admin/products", label: "Products", area: "products" },
  { href: "/admin/partners", label: "Partners", area: "partners" },
  { href: "/admin/enquiries", label: "Enquiries", area: "enquiries" },
  { href: "/admin/settings", label: "Settings", area: "settings" },
];

export function AdminShell({
  email,
  role,
  children,
  newEnquiries,
}: {
  email: string;
  role: Role;
  children: React.ReactNode;
  newEnquiries: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {NAV.filter((n) => !n.area || can(role, n.area)).map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active ? "bg-action text-white" : "text-ink hover:bg-mist"
            }`}
          >
            {n.label}
            {n.href === "/admin/enquiries" && newEnquiries ? (
              <span className={`rounded-full px-2 text-xs ${active ? "bg-white/25" : "bg-sky/15 text-action"}`}>{newEnquiries}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-line bg-white lg:flex lg:flex-col lg:gap-8 lg:p-5">
        <Link href="/admin" className="flex items-center gap-3 px-1.5">
          <Emblem height={40} decorative />
          <span className="text-sm font-semibold leading-tight text-ink">
            Genesis
            <span className="block text-xs font-medium text-muted">Content dashboard</span>
          </span>
        </Link>
        {nav}
        <div className="mt-auto flex flex-col gap-2 border-t border-line pt-5 text-sm">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-action hover:underline">
            View website <ExternalIcon size={14} />
          </a>
          <p className="truncate text-xs text-muted" title={email}>
            {email}
            <span className="block font-semibold text-ink">{ROLE_LABELS[role]}</span>
          </p>
          <button type="button" onClick={signOut} className="btn btn-secondary btn-sm">
            Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Emblem height={34} decorative />
          <span className="text-sm font-semibold text-ink">Genesis dashboard</span>
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-line-strong" aria-expanded={open} aria-label="Dashboard menu">
          {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
        </button>
      </header>
      {open ? (
        <div className="border-b border-line bg-white p-4 lg:hidden">
          {nav}
          <div className="mt-4 flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm flex-1">
              View website
            </a>
            <button type="button" onClick={signOut} className="btn btn-secondary btn-sm flex-1">
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      <main id="main" className="min-w-0 px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-[1.9rem] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
