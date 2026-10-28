import Link from "next/link";
import { AVAILABILITY_LABELS, categoryMeta } from "@/content/site";
import { PageTitle } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/kit";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";

export const metadata = { title: "Products" };

export default async function ProductsAdmin() {
  await requireAdminPage("products");
  const items = (await readCollection("products")).items.sort(
    (a, b) => a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
  return (
    <>
      <PageTitle
        title="Products"
        description="The product catalogue. Only published, non-placeholder products appear on the production site."
        actions={
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            New product
          </Link>
        }
      />
      {items.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-[var(--shadow-ring)]">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Availability</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((p) => (
                <tr key={p.id} className="align-top hover:bg-cloud/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold text-ink hover:text-action">
                      {p.name}
                    </Link>
                    {p.prescriptionOnly ? <span className="chip chip-neutral ml-2 !py-0.5">Rx</span> : null}
                    {p.featured ? <span className="chip ml-2 !py-0.5">Featured</span> : null}
                    {p.reviewNote && !p.placeholder ? <p className="mt-1 max-w-md text-xs text-warn">{p.reviewNote}</p> : null}
                  </td>
                  <td className="px-5 py-3.5 text-body">{categoryMeta(p.category).label}</td>
                  <td className="px-5 py-3.5 text-body">{AVAILABILITY_LABELS[p.availability] || "—"}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={p.status} placeholder={p.placeholder} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold text-action hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted shadow-[var(--shadow-ring)]">No products yet.</p>
      )}
    </>
  );
}
