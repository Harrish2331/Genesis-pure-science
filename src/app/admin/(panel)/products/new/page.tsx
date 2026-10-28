import { PageTitle } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { requireAdminPage } from "@/lib/auth/session";
import type { Product } from "@/lib/content/types";

export const metadata = { title: "New product" };

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await requireAdminPage("products");
  const cat = (await searchParams).category;
  const blank: Product = {
    id: "",
    slug: "",
    name: "",
    category: cat === "general-medicine" || cat === "surgicals" ? cat : "womens-health",
    subcategories: [],
    composition: "",
    dosageForm: "",
    packSize: "",
    shortDescription: "",
    description: "",
    image: null,
    imageAlt: "",
    imageCaption: "",
    specifications: [],
    manufacturer: "",
    marketedBy: "",
    brand: "",
    availability: "unspecified",
    prescriptionOnly: false,
    featured: false,
    status: "draft",
    placeholder: false,
    reviewNote: "",
    seoTitle: "",
    metaDescription: "",
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
  };
  return (
    <>
      <PageTitle title="New product" />
      <ProductEditor initial={blank} isNew />
    </>
  );
}
