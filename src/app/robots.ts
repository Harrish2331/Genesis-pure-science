import type { MetadataRoute } from "next";
import { absoluteUrl, isPreviewDeployment } from "@/lib/env";

/**
 * Production: everything public is crawlable — including /_next assets, so
 * pages render correctly for crawlers — except the dashboard and internal
 * APIs. Preview deployments (development, Vercel previews) disallow all.
 */
export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/media/"],
        disallow: ["/admin", "/api/admin/", "/api/search", "/search"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
