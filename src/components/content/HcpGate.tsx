"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ShieldIcon } from "@/components/ui/Icons";

const KEY = "gpl-hcp-ack";

/**
 * Prescription-medicine notice.
 *
 * Under the Drugs and Magic Remedies (Objectionable Advertisements) Act 1954
 * and the Drugs & Cosmetics Rules, prescription medicines may not be promoted
 * to the general public. Details of products marked prescription-only are
 * therefore shown after the visitor confirms they are a registered medical
 * practitioner or healthcare/trade professional. The acknowledgement lasts for
 * the browser session only.
 *
 * This is a disclosure, not access control: the details travel in the page
 * payload and are simply not displayed until the visitor confirms. Search
 * engines are kept away from these pages separately (noindex, and excluded
 * from the sitemap). Anything that must never reach the public should not be
 * entered on a product page at all.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const read = (): "yes" | "no" => {
  try {
    return sessionStorage.getItem(KEY) === "1" ? "yes" : "no";
  } catch {
    return "no";
  }
};

export function HcpGate({ productName, children }: { productName: string; children: React.ReactNode }) {
  // "unknown" on the server and during hydration, so the gated content is
  // never in the server HTML and never flashes before the check.
  const stored = useSyncExternalStore(subscribe, read, () => "unknown" as const);
  const [ack, setAck] = useState(false);

  if (ack || stored === "yes") return <>{children}</>;
  if (stored === "unknown") return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-cloud" aria-hidden="true" />;

  return (
    <div className="card flex flex-col gap-5 p-7 md:p-9" role="region" aria-labelledby="hcp-heading">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-action">
        <ShieldIcon size={26} />
      </span>
      <h2 id="hcp-heading" className="t-card !text-[1.4rem]">
        For healthcare professionals
      </h2>
      <p className="text-body">
        {productName} is a prescription medicine. Information about prescription medicines is intended for registered medical
        practitioners and healthcare or trade professionals, and is provided for reference. It is not an advertisement.
      </p>
      <p className="text-sm text-muted">
        This information is not medical advice. Medicines should be used only as prescribed by a qualified doctor. The acknowledgement
        applies to this browsing session only.
      </p>
      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          className="btn btn-primary !whitespace-normal text-left"
          onClick={() => {
            try {
              sessionStorage.setItem(KEY, "1");
            } catch {
              // Private mode: acknowledge for this page view only.
            }
            setAck(true);
          }}
        >
          I am a healthcare professional or trade visitor
        </button>
        <Link href="/products" className="btn btn-secondary">
          Back to products
        </Link>
      </div>
    </div>
  );
}
