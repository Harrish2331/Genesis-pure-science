"use client";

import { useState } from "react";
import { CheckIcon, LinkIcon, SocialIcon, WhatsAppIcon } from "@/components/ui/Icons";

/** Plain share links — no third-party scripts, no tracking. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <SocialIcon id="linkedin" /> },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: <WhatsAppIcon size={18} /> },
    { label: "Share on X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: <SocialIcon id="x" /> },
  ];
  const btn = "flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate ring-1 ring-line-strong transition hover:text-action hover:ring-action/40";
  return (
    <div>
      <h2 className="eyebrow mb-3">Share</h2>
      <ul className="flex gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`${l.label} (opens in a new tab)`}>
              {l.icon}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={btn}
            aria-label={copied ? "Link copied" : "Copy link"}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                // Clipboard unavailable (permissions): nothing else to do.
              }
            }}
          >
            {copied ? <CheckIcon size={18} className="text-leaf-ink" /> : <LinkIcon size={18} />}
          </button>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </div>
  );
}
