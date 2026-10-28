"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-x flex flex-col items-center gap-5 py-24 text-center md:py-32">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="t-page max-w-2xl">This page could not be loaded</h1>
      <p className="lead max-w-xl">Please try again. If the problem continues, contact our team.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Go to the homepage
        </Link>
      </div>
      {error.digest ? <p className="meta">Reference: {error.digest}</p> : null}
    </section>
  );
}
