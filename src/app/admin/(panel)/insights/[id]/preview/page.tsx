import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/content/ArticleView";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";
import { absoluteUrl } from "@/lib/env";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Renders the saved article — draft or not — with the public article layout. */
export default async function PreviewInsight({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const item = (await readCollection("insights")).items.find((a) => a.id === id);
  if (!item) notFound();
  return (
    <div className="-mx-4 -my-6 bg-white md:-mx-8 md:-my-10">
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#c27a00]/60 bg-[#fff8eb] px-5 py-2.5 text-sm text-[#7a4a00]">
        <span>
          <strong>Preview</strong> — {item.status === "published" ? "published" : "draft"} version as saved. Not visible to visitors unless published.
        </span>
        <Link href={`/admin/insights/${item.id}`} className="font-semibold underline">Back to editor</Link>
      </div>
      <ArticleView article={item} shareUrl={absoluteUrl(`/insights/${item.slug}`)} preview />
    </div>
  );
}
