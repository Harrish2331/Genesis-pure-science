import Link from "next/link";
import { PageTitle } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/kit";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";
import { formatDate } from "@/lib/text";

export const metadata = { title: "Insights" };

export default async function InsightsAdmin() {
  await requireAdminPage();
  const items = (await readCollection("insights")).items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  // Server component, rendered per request: reading the clock here is intended.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return (
    <>
      <PageTitle
        title="Insights"
        description="Articles, news and updates. Drafts and scheduled articles are only visible here."
        actions={<Link href="/admin/insights/new" className="btn btn-primary btn-sm">New article</Link>}
      />
      {items.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-[var(--shadow-ring)]">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-cloud/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/insights/${a.id}`} className="font-semibold text-ink hover:text-action">{a.title}</Link>
                    {a.featured ? <span className="chip ml-2 !py-0.5">Featured</span> : null}
                  </td>
                  <td className="px-5 py-3.5 text-body">{a.category || "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-body">
                    {formatDate(a.publishedAt)}
                    {a.status === "published" && new Date(a.publishedAt).getTime() > now ? <span className="chip ml-2 !py-0.5">Scheduled</span> : null}
                  </td>
                  <td className="px-5 py-3.5"><StatusPill status={a.status} placeholder={a.placeholder} publishedAt={a.publishedAt} /></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <Link href={`/admin/insights/${a.id}/preview`} className="font-semibold text-action hover:underline" target="_blank">Preview</Link>
                    <Link href={`/admin/insights/${a.id}`} className="ml-4 font-semibold text-action hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted shadow-[var(--shadow-ring)]">No articles yet.</p>
      )}
    </>
  );
}
