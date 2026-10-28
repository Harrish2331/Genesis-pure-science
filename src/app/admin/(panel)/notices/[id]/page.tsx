import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/AdminShell";
import { NoticeEditor } from "@/components/admin/NoticeEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";

export const metadata = { title: "Edit notice" };

export default async function EditNotice({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [notices, products, insights] = await Promise.all([readCollection("notices"), readCollection("products"), readCollection("insights")]);
  const item = notices.items.find((n) => n.id === id);
  if (!item) notFound();
  return (
    <>
      <PageTitle title="Edit notice" description={item.title} />
      <NoticeEditor
        key={item.updatedAt}
        initial={item}
        isNew={false}
        products={products.items.map((p) => ({ slug: p.slug, name: p.name }))}
        insights={insights.items.map((a) => ({ slug: a.slug, title: a.title }))}
      />
    </>
  );
}
