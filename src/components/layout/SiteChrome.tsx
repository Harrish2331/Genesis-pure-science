import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { IntroSplash } from "@/components/brand/IntroSplash";
import { RevealObserver } from "@/components/RevealObserver";
import { getSettings, showFact } from "@/lib/content/public";
import { organizationLd, websiteLd } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";
import { Footer } from "./Footer";
import { Navbar, type WhatsAppConfig } from "./Navbar";
import { RouteTransition } from "./RouteTransition";
import { WhatsAppFloat } from "./WhatsAppFloat";

/** Header, footer and site-wide structured data around every public page. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const wa = showFact(settings.contact.whatsapp);
  const href = wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null;
  const whatsapp: WhatsAppConfig = { href };

  return (
    <div className="flex min-h-dvh flex-col">
      <IntroSplash />
      <Suspense fallback={null}>
        <RouteTransition />
      </Suspense>
      <Navbar whatsapp={whatsapp} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} whatsappHref={href} />
      {href ? <WhatsAppFloat href={href} /> : null}
      <RevealObserver />
      <JsonLd data={[organizationLd(settings), websiteLd()]} />
    </div>
  );
}
