import Link from "next/link";
import { CapsuleGlyph, Molecule } from "@/components/brand/Motifs";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-mist to-white">
        <div className="container-x flex flex-col items-center gap-6 py-24 text-center md:py-32">
          <div className="relative">
            <Molecule size={96} />
            <CapsuleGlyph size={48} className="absolute -bottom-2 -right-6" />
          </div>
          <p className="eyebrow">Error 404</p>
          <h1 className="t-page max-w-2xl">We could not find that page</h1>
          <p className="lead max-w-xl">The page may have moved, or the address may be mistyped.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" arrow>
              Go to the homepage
            </ButtonLink>
            <ButtonLink href="/products" variant="secondary">
              Browse products
            </ButtonLink>
          </div>
          <p className="text-sm text-muted">
            Or <Link className="font-semibold text-action hover:underline" href="/contact">contact our team</Link>.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
