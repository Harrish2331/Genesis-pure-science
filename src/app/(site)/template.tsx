"use client";

import { useEffect } from "react";

/*
 * Next.js re-mounts a template on every navigation between pages, which makes
 * it the natural place for the page-enter transition. The very first page of
 * a visit is not animated (it is either under the intro or should paint at
 * once), so the class is only applied once the app has hydrated.
 */
let hydrated = false;

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrated = true;
  }, []);
  return <div className={hydrated ? "page-enter" : undefined}>{children}</div>;
}
