import Link from "next/link";
import { NOTICE_KIND_LABELS } from "@/content/site";
import { PageTitle } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/kit";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";
import { formatDate } from "@/lib/text";

export const metadata = { title: "Notices" };

export default async function NoticesAdmin() {
  await requireAdminPage();
  const items = (await readCollection("notices")).items.sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt),
  );
  return (
    <>
      <PageTitle
        title="Notices"
        description="Announcements, product launches, coming-soon items and business updates."
        actions={
          <Link href="/admin/notices/new" className="btn btn-primary btn-sm">
            New notice
          </Link>
        }
      />
      {items.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-[var(--shadow-ring)]">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((n) => (
                <tr key={n.id} className="hover:bg-cloud/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/notices/${n.id}`} className="font-semibold text-ink hover:text-action">
                      {n.title}
                    </Link>
                    {n.pinned ? <span className="chip ml-2 !py-0.5">Pinned</span> : null}
                  </td>
                  <td className="px-5 py-3.5 text-body">{NOTICE_KIND_LABELS[n.kind]}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-body">{formatDate(n.publishedAt)}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={n.status} placeholder={n.placeholder} publishedAt={n.publishedAt} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex gap-4">
                      <Link href={`/admin/notices/${n.id}/preview`} className="font-semibold text-action hover:underline">
                        Preview
                      </Link>
                      <Link href={`/admin/notices/${n.id}`} className="font-semibold text-action hover:underline">
                        Edit
                      </Link>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted shadow-[var(--shadow-ring)]">No notices yet.</p>
      )}
    </>
  );
}
