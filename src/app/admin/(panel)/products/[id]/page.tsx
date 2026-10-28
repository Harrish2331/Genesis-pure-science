import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("products");
  const { id } = await params;
  const item = (await readCollection("products")).items.find((p) => p.id === id);
  if (!item) notFound();
  return (
    <>
      <PageTitle title="Edit product" description={item.name} />
      <ProductEditor key={item.updatedAt} initial={item} isNew={false} />
    </>
  );
}
