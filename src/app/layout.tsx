import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { googleSiteVerification, isPreviewDeployment, siteUrl } from "@/lib/env";
import { INTRO_SCRIPT } from "@/lib/intro";
import "./globals.css";

/*
 * Typography. The logo's own lettering is artwork and is never set in a font.
 * For the website: Sora — a geometric sans whose round, open forms sit
 * comfortably beside the emblem's circular G — for display headings, and
 * Inter for body copy, navigation and interface text, chosen for legibility
 * at small sizes. Both are self-hosted by next/font (no request to Google at
 * runtime) and swap in without layout shift.
 */
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const DESCRIPTION =
  "Genesis Pure Lifesciences is a pharmaceutical company focused on women’s health and general medicine.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Genesis Pure Lifesciences", template: "%s | Genesis Pure Lifesciences" },
  description: DESCRIPTION,
  applicationName: "Genesis Pure Lifesciences",
  // Preview deployments (development, Vercel previews) are never indexed.
  robots: isPreviewDeployment() ? { index: false, follow: false } : { index: true, follow: true },
  verification: { google: googleSiteVerification() },
  openGraph: {
    type: "website",
    siteName: "Genesis Pure Lifesciences",
    locale: "en_IN",
    title: "Genesis Pure Lifesciences",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the intro script may set data-intro on <html> before React hydrates.
    <html lang="en-IN" className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Must run before first paint, so it is inline rather than loaded. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
