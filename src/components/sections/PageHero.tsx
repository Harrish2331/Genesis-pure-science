import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Molecule, RibbonBackdrop, Sprout } from "@/components/brand/Motifs";
import { CopyText } from "@/components/ui/CopyText";
import type { ShownCopy } from "@/lib/content/public";
import { breadcrumbLd } from "@/lib/seo";
import type { SiteImage } from "@/content/images";

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
  image,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: ShownCopy | string;
  crumbs: Crumb[];
  children?: React.ReactNode;
  motif?: "molecule" | "sprout" | "none";
  /** Optional hero image, shown beside the text (below it on phones). */
  image?: SiteImage | null;
}) {
  const text = (
    <div className={`flex flex-col gap-5 ${image ? "" : "mt-10 max-w-3xl md:mt-14"}`} data-reveal>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="t-page">{title}</h1>
      {typeof intro === "string" ? intro ? <p className="lead max-w-2xl">{intro}</p> : null : intro ? <CopyText copy={intro} className="lead max-w-2xl" /> : null}
      {children}
    </div>
  );
  return (
    <section className="wash-hero relative isolate overflow-hidden">
      <div className="pattern-dots pattern-fade pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <RibbonBackdrop className="pointer-events-none absolute -right-10 top-0 -z-10 h-full w-[70%] max-w-4xl" />
      <div className="container-x relative pb-14 pt-10 md:pb-20 md:pt-14">
        <Breadcrumbs items={crumbs} />
        {image ? (
          <div className="mt-8 grid items-center gap-10 md:mt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            {text}
            <figure
              className="relative overflow-hidden rounded-[var(--radius-panel)] bg-white shadow-[var(--shadow-ring),var(--shadow-soft)]"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              {/* The hero image is the page's largest element: load it first. */}
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
                quality={90}
                sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]" aria-hidden="true" />
            </figure>
          </div>
        ) : (
          text
        )}
        {image ? null : motif === "molecule" ? (
          <Molecule className="absolute right-[8%] top-16 hidden opacity-90 md:block" size={88} />
        ) : motif === "sprout" ? (
          <Sprout className="absolute right-[10%] top-20 hidden md:block" size={64} />
        ) : null}
      </div>
    </section>
  );
}
