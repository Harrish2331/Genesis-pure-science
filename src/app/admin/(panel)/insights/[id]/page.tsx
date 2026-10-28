import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/AdminShell";
import { InsightEditor } from "@/components/admin/InsightEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";

export const metadata = { title: "Edit article" };

export default async function EditInsight({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const items = (await readCollection("insights")).items;
  const item = items.find((a) => a.id === id);
  if (!item) notFound();
  const categories = Array.from(new Set(items.map((a) => a.category).filter(Boolean)));
  return (
    <>
      <PageTitle title="Edit article" description={item.title} />
      <InsightEditor key={item.updatedAt} initial={item} isNew={false} categories={categories} />
    </>
  );
}
