import { CopyText } from "./CopyText";
import type { ShownCopy } from "@/lib/content/public";

/** Eyebrow + heading + optional intro, used at the top of every section. */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  as: H = "h2",
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: ShownCopy | string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  action?: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-6 ${action ? "md:flex-row md:items-end md:justify-between" : ""} ${className ?? ""}`}
      data-reveal
    >
      <div className={`flex max-w-3xl flex-col gap-4 ${centered ? "mx-auto items-center text-center" : ""}`}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <H className={H === "h1" ? "t-page" : "t-section"}>{title}</H>
        {typeof intro === "string" ? (
          intro ? <p className="lead max-w-2xl">{intro}</p> : null
        ) : intro ? (
          <CopyText copy={intro} className="lead max-w-2xl" />
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
