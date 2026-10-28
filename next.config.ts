import type { NextConfig } from "next";

/**
 * Security headers applied to every response. A full script CSP would need
 * per-request nonces across the whole app; `frame-ancestors` and the headers
 * below cover click-jacking, MIME sniffing and referrer leakage without that.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  /**
   * The filesystem content driver resolves its directory at runtime, so the
   * tracer cannot scope those calls and would otherwise pull the whole
   * project — public/ and the client's source artwork included — into every
   * server function. Neither is ever read by server code.
   */
  outputFileTracingExcludes: {
    "/*": ["./public/**", "./source-assets/**", "./.data/**", "./tools/**", "./docs/**"],
    "/**": ["./public/**", "./source-assets/**", "./.data/**", "./tools/**", "./docs/**"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // 90 is used for the logo artwork so fine edges stay crisp.
    qualities: [75, 90],
    localPatterns: [
      { pathname: "/brand/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/products/**", search: "" },
      { pathname: "/partners/**", search: "" },
      { pathname: "/certifications/**", search: "" },
      { pathname: "/placeholder/**", search: "" },
      // Uploaded media served by the app (filesystem driver or private Blob).
      // The version lives in the path, so no query string is ever needed.
      { pathname: "/api/media/**", search: "" },
    ],
    remotePatterns: [
      // Vercel Blob public stores.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Brand artwork is fetched on every page (intro, page transitions):
        // let browsers reuse it for a week instead of revalidating each visit.
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        // Operator tool: never indexed, never cached by a shared cache.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
