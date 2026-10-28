import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Molecule, RibbonBackdrop, Sprout } from "@/components/brand/Motifs";
import { CopyText } from "@/components/ui/CopyText";
import type { ShownCopy } from "@/lib/content/public";
import { breadcrumbLd } from "@/lib/seo";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
          {items.map((c, i) => (
            <li key={c.path} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true" className="text-line-strong">/</span> : null}
              {i === items.length - 1 ? (
                <span aria-current="page" className="font-medium text-ink">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-action">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items)} />
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
  motif = "molecule",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: ShownCopy | string;
  crumbs: Crumb[];
  children?: React.ReactNode;
  motif?: "molecule" | "sprout" | "none";
}) {
  return (
    <section className="wash-hero relative isolate overflow-hidden">
      <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <RibbonBackdrop className="pointer-events-none absolute -right-10 top-0 -z-10 h-full w-[70%] max-w-4xl" />
      <div className="container-x relative pb-14 pt-10 md:pb-20 md:pt-14">
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 flex max-w-3xl flex-col gap-5 md:mt-14" data-reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="t-page">{title}</h1>
          {typeof intro === "string" ? intro ? <p className="lead max-w-2xl">{intro}</p> : null : intro ? <CopyText copy={intro} className="lead max-w-2xl" /> : null}
          {children}
        </div>
        {motif === "molecule" ? (
          <Molecule className="absolute right-[8%] top-16 hidden opacity-90 md:block" size={88} />
        ) : motif === "sprout" ? (
          <Sprout className="absolute right-[10%] top-20 hidden md:block" size={64} />
        ) : null}
      </div>
    </section>
  );
}
