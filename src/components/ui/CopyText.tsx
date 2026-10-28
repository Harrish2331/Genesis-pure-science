import type { ShownCopy } from "@/lib/content/public";

/** A piece of site copy (edited in Admin → Settings). */
export function CopyText({
  copy,
  as: Tag = "p",
  className,
}: {
  copy: ShownCopy;
  as?: "p" | "span" | "h1" | "h2" | "div";
  className?: string;
}) {
  if (!copy.text) return null;
  return <Tag className={className}>{copy.text}</Tag>;
}
