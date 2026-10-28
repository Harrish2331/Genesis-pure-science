import { PageTitle } from "@/components/admin/AdminShell";
import { InsightEditor } from "@/components/admin/InsightEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";
import type { Insight } from "@/lib/content/types";

export const metadata = { title: "New article" };

export default async function NewInsight() {
  await requireAdminPage();
  const existing = (await readCollection("insights")).items;
  const blank: Insight = {
    id: "",
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    coverImage: null,
    coverAlt: "",
    category: "",
    author: "Genesis Pure Lifesciences",
    featured: false,
    status: "draft",
    publishedAt: new Date(new Date().toISOString().slice(0, 10)).toISOString(),
    seoTitle: "",
    metaDescription: "",
    placeholder: false,
    reviewNote: "",
    createdAt: "",
    updatedAt: "",
  };
  const categories = Array.from(new Set(existing.map((a) => a.category).filter(Boolean)));
  return (
    <>
      <PageTitle title="New article" />
      <InsightEditor initial={blank} isNew categories={categories} />
    </>
  );
}
