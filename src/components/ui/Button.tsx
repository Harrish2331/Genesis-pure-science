import Link from "next/link";
import { ArrowRight } from "./Icons";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";

type Common = {
  variant?: Variant;
  size?: "md" | "sm";
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

const cls = (variant: Variant, size: "md" | "sm", extra?: string) =>
  ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", extra ?? ""].filter(Boolean).join(" ");

/** A link styled as a button. External links open in a new tab, safely. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  arrow,
  className,
  children,
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  const body = (
    <>
      {children}
      {arrow ? <ArrowRight className="btn-arrow" size={18} /> : null}
    </>
  );
  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a
        href={href}
        className={cls(variant, size, className)}
        {...(external || /^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {body}
      </a>
    );
  }
  return (
    <Link href={href} className={cls(variant, size, className)} {...rest}>
      {body}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  arrow,
  className,
  children,
  ...rest
}: Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button className={cls(variant, size, className)} {...rest}>
      {children}
      {arrow ? <ArrowRight className="btn-arrow" size={18} /> : null}
    </button>
  );
}
