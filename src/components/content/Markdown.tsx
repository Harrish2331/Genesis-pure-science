import Link from "next/link";
import { parseMarkdown, type Inline } from "@/lib/markdown";

function InlineNodes({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case "text":
            return <span key={i}>{n.v}</span>;
          case "strong":
            return (
              <strong key={i}>
                <InlineNodes nodes={n.c} />
              </strong>
            );
          case "em":
            return (
              <em key={i}>
                <InlineNodes nodes={n.c} />
              </em>
            );
          case "code":
            return <code key={i}>{n.v}</code>;
          case "link":
            return n.external ? (
              <a key={i} href={n.href} target="_blank" rel="noopener noreferrer">
                <InlineNodes nodes={n.c} />
              </a>
            ) : n.href.startsWith("/") ? (
              <Link key={i} href={n.href}>
                <InlineNodes nodes={n.c} />
              </Link>
            ) : (
              <a key={i} href={n.href}>
                <InlineNodes nodes={n.c} />
              </a>
            );
        }
      })}
    </>
  );
}

/** Renders the safe Markdown subset as React elements (never as HTML). */
export function Markdown({ source, className = "prose-g" }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={i} id={b.id}>
                <InlineNodes nodes={b.c} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id}>
                <InlineNodes nodes={b.c} />
              </h3>
            );
          case "p":
            return (
              <p key={i}>
                <InlineNodes nodes={b.c} />
              </p>
            );
          case "ul":
          case "ol": {
            const L = b.t;
            return (
              <L key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <InlineNodes nodes={it} />
                  </li>
                ))}
              </L>
            );
          }
          case "quote":
            return (
              <blockquote key={i}>
                <InlineNodes nodes={b.c} />
              </blockquote>
            );
          case "hr":
            return <hr key={i} />;
        }
      })}
    </div>
  );
}
