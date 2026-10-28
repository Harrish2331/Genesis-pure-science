/**
 * Whether this is a non-production deployment (local development, Vercel
 * previews). Such deployments are kept out of search engines: noindex,
 * robots.txt disallow-all and an empty sitemap. It never changes what a
 * page shows. CONTENT_REVIEW_MODE=true/false overrides the detection.
 */
export function isPreviewDeployment(): boolean {
  const flag = process.env.CONTENT_REVIEW_MODE?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV !== "production";
  return process.env.NODE_ENV !== "production";
}

/**
 * Canonical origin, without a trailing slash. Set NEXT_PUBLIC_SITE_URL to the
 * production domain once Genesis confirms it; on Vercel the project's
 * production domain is used as a fallback so canonicals never point at a
 * preview or localhost URL in production.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd.replace(/\/+$/, "")}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const googleSiteVerification = () => process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;
