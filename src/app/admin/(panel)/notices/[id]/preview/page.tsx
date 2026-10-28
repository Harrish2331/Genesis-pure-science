import Link from "next/link";
import { notFound } from "next/navigation";
import { NoticeCard } from "@/components/content/NoticeCard";
import { requireAdminPage } from "@/lib/auth/session";
import { PUBLISH_LABELS, publishState } from "@/lib/content/publish";
import { readCollection } from "@/lib/content/repo";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Renders the saved notice — draft or not — as it appears on the public Notices page. */
export default async function PreviewNotice({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("notices");
  const { id } = await params;
  const item = (await readCollection("notices")).items.find((n) => n.id === id);
  if (!item) notFound();
  const state = publishState(item.status, item.publishedAt);
  return (
    <div className="-mx-4 -my-6 min-h-dvh bg-white md:-mx-8 md:-my-10">
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#c27a00]/60 bg-[#fff8eb] px-5 py-2.5 text-sm text-[#7a4a00]">
        <span>
          <strong>Preview</strong> — {PUBLISH_LABELS[state].toLowerCase()} version as saved.{" "}
          {state === "live" ? "Visible on the Notices page." : "Not visible to visitors until it is published and its date has arrived."}
        </span>
        <Link href={`/admin/notices/${item.id}`} className="font-semibold underline">
          Back to editor
        </Link>
      </div>
      <div className="wash-warm px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <section aria-label="Featured layout">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">As the featured notice</p>
            <NoticeCard notice={item} full />
          </section>
          <section aria-label="Card layout" className="max-w-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">As a card in the list</p>
            <NoticeCard notice={item} />
          </section>
        </div>
      </div>
    </div>
  );
}
