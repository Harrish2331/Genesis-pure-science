import { Sprout } from "@/components/brand/Motifs";

export function EmptyState({
  title,
  children,
  action,
  as: H = "h3",
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  /** h2 when the empty state is the first content under the page heading. */
  as?: "h2" | "h3";
}) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center" data-reveal>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint ring-1 ring-leaf/15">
        <Sprout size={34} />
      </span>
      <H className="t-card">{title}</H>
      {children ? <div className="max-w-md text-[0.95rem] text-body">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
