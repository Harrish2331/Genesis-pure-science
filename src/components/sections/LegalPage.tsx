import { Markdown } from "@/components/content/Markdown";
import { PageHero } from "@/components/sections/PageHero";
import type { LegalDoc } from "@/content/legal";
import { formatDate } from "@/lib/text";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={doc.title}
        crumbs={[
          { name: "Home", path: "/" },
          { name: doc.title, path: `/${doc.slug}` },
        ]}
        motif="none"
      >
        <p className="meta">Last updated {formatDate(`${doc.updated}T00:00:00Z`)}</p>
      </PageHero>
      <section className="pb-20 md:pb-28">
        <div className="container-x">
          <Markdown source={doc.body} className="prose-g max-w-[70ch]" />
        </div>
      </section>
    </>
  );
}
