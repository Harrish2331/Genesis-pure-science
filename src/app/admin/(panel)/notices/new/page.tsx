import { PageTitle } from "@/components/admin/AdminShell";
import { NoticeEditor } from "@/components/admin/NoticeEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";
import type { Notice } from "@/lib/content/types";

export const metadata = { title: "New notice" };

export default async function NewNotice() {
  await requireAdminPage();
  const [products, insights] = await Promise.all([readCollection("products"), readCollection("insights")]);
  const blank: Notice = {
    id: "",
    slug: "",
    title: "",
    kind: "announcement",
    summary: "",
    image: null,
    imageAlt: "",
    productSlug: "",
    insightSlug: "",
    linkUrl: "",
    linkLabel: "",
    pinned: false,
    status: "draft",
    publishedAt: new Date(new Date().toISOString().slice(0, 10)).toISOString(),
    placeholder: false,
    reviewNote: "",
    createdAt: "",
    updatedAt: "",
  };
  return (
    <>
      <PageTitle title="New notice" />
      <NoticeEditor
        initial={blank}
        isNew
        products={products.items.map((p) => ({ slug: p.slug, name: p.name }))}
        insights={insights.items.map((a) => ({ slug: a.slug, title: a.title }))}
      />
    </>
  );
}
