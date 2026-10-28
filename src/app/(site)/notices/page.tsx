import { NoticeCard } from "@/components/content/NoticeCard";
import { CtaBand } from "@/components/sections/CtaBand";
import { EmptyState } from "@/components/sections/EmptyState";
import { PageHero } from "@/components/sections/PageHero";
import { getNotices, getSettings, showFact } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Notices",
  description: "Product announcements, launches, coming-soon notices and company updates from Genesis Pure Lifesciences.",
  path: "/notices",
});

export default async function NoticesPage() {
  const [notices, settings] = await Promise.all([getNotices(), getSettings()]);
  const wa = showFact(settings.contact.whatsapp);

  return (
    <>
      <PageHero
        eyebrow="Notice"
        title="Notices and announcements"
        intro="Official updates from Genesis Pure Lifesciences: product announcements, launches, coming-soon notices and company news."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Notice", path: "/notices" },
        ]}
      />
      <section className="wash-warm pb-20 pt-12 md:pb-28 md:pt-16" aria-label="Notices">
        <div className="container-x max-w-5xl">
          {notices.length ? (
            <ol className="flex flex-col gap-6">
              {notices.map((n) => (
                <li key={n.id}>
                  <NoticeCard notice={n} full />
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState as="h2" title="No notices at the moment">Announcements and product updates will be published here.</EmptyState>
          )}
        </div>
      </section>
      <CtaBand whatsappHref={wa ? whatsappUrl(wa.value, settings.contact.whatsappMessage) : null} />
    </>
  );
}
