import Link from "next/link";
import { PageTitle } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/kit";
import { requireAdminPage } from "@/lib/auth/session";
import { launchChecklist, type CheckItem } from "@/lib/content/checklist";
import { listEnquiries } from "@/lib/content/enquiries";
import { publishState, type PublishState } from "@/lib/content/publish";
import {
  COLLECTIONS,
  readCollection,
  storageDriverName,
} from "@/lib/content/repo";
import { isPreviewDeployment, siteUrl } from "@/lib/env";
import { formatDate } from "@/lib/text";

export const metadata = { title: "Dashboard" };

const SEV: Record<CheckItem["severity"], { label: string; cls: string }> = {
  required: { label: "Before launch", cls: "bg-danger-bg text-danger" },
  review: { label: "Approve copy", cls: "bg-warn-bg text-warn" },
  optional: { label: "Optional", cls: "bg-cloud text-muted ring-1 ring-line" },
};

type Editorial = {
  kind: "Notice" | "Insight";
  id: string;
  title: string;
  status: string;
  publishedAt: string;
  placeholder: boolean;
  updatedAt: string;
  base: string;
};

function tally(items: Editorial[]): Record<PublishState, number> {
  const out: Record<PublishState, number> = { live: 0, scheduled: 0, draft: 0 };
  for (const it of items) out[publishState(it.status, it.publishedAt)]++;
  return out;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await requireAdminPage();
  const isAdmin = user.role === "admin";
  const { denied } = await searchParams;
  const [checklist, enquiries, ...cols] = await Promise.all([
    isAdmin ? launchChecklist() : Promise.resolve([] as CheckItem[]),
    isAdmin
      ? listEnquiries(5)
      : Promise.resolve({
          items: [] as Awaited<ReturnType<typeof listEnquiries>>["items"],
        }),
    ...COLLECTIONS.map((c) => readCollection(c)),
  ]);
  const byName = Object.fromEntries(
    COLLECTIONS.map((c, i) => [c, cols[i].items]),
  ) as {
    [K in (typeof COLLECTIONS)[number]]: Awaited<
      ReturnType<typeof readCollection<K>>
    >["items"];
  };
  const notices: Editorial[] = byName.notices.map((n) => ({
    ...n,
    kind: "Notice",
    base: "/admin/notices",
  }));
  const insights: Editorial[] = byName.insights.map((a) => ({
    ...a,
    kind: "Insight",
    base: "/admin/insights",
  }));
  const editorial = [
    {
      label: "Notices",
      href: "/admin/notices",
      newHref: "/admin/notices/new",
      t: tally(notices),
      total: notices.length,
    },
    {
      label: "Insights",
      href: "/admin/insights",
      newHref: "/admin/insights/new",
      t: tally(insights),
      total: insights.length,
    },
  ];
  const recent = [...notices, ...insights]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);
  const counts = Object.fromEntries(
    COLLECTIONS.map((c, i) => {
      const items = cols[i].items as {
        status?: string;
        published?: boolean;
        placeholder?: boolean;
      }[];
      return [
        c,
        {
          total: items.length,
          live: items.filter(
            (it) =>
              (it.status ? it.status === "published" : it.published) &&
              !it.placeholder,
          ).length,
        },
      ];
    }),
  ) as Record<(typeof COLLECTIONS)[number], { total: number; live: number }>;

  const grouped = (["required", "review", "optional"] as const).map((s) => ({
    s,
    items: checklist.filter((c) => c.severity === s),
  }));

  return (
    <>
      <PageTitle
        title="Dashboard"
        description={
          isAdmin
            ? "Manage notices, Insights, products, partners and company information. Changes go live as soon as they are saved."
            : "Manage notices and Insights articles. Changes go live as soon as they are saved."
        }
        actions={
          <>
            <Link href="/admin/notices/new" className="btn btn-primary btn-sm">
              New notice
            </Link>
            <Link href="/admin/insights/new" className="btn btn-primary btn-sm">
              New insight
            </Link>
            {isAdmin ? (
              <a href="/api/admin/export" className="btn btn-secondary btn-sm">
                Download backup
              </a>
            ) : null}
          </>
        }
      />

      {denied ? (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-warn-bg px-4 py-3 text-sm font-semibold text-warn"
        >
          Your account does not have access to that area.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {editorial.map((e) => (
          <section
            key={e.label}
            className="rounded-2xl bg-white p-5 shadow-[var(--shadow-ring)] md:p-6"
            aria-labelledby={`sum-${e.label}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id={`sum-${e.label}`}
                className="font-display text-lg font-semibold text-ink"
              >
                <Link href={e.href} className="hover:text-action">
                  {e.label}
                </Link>
              </h2>
              <Link
                href={e.newHref}
                className="text-sm font-semibold text-action hover:underline"
              >
                + New
              </Link>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-3">
              {(
                [
                  ["Published", e.t.live, "text-ok"],
                  ["Scheduled", e.t.scheduled, "text-warn"],
                  ["Drafts", e.t.draft, "text-muted"],
                  ["Total", e.total, "text-ink"],
                ] as const
              ).map(([label, n, cls]) => (
                <div key={label} className="rounded-xl bg-cloud px-3 py-3">
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">
                    {label}
                  </dt>
                  <dd
                    className={`mt-1 font-display text-2xl font-semibold tabular-nums ${cls}`}
                  >
                    {n}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section
        className="mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-ring)] md:p-7"
        aria-labelledby="recent-content"
      >
        <h2
          id="recent-content"
          className="font-display text-lg font-semibold text-ink"
        >
          Recently updated
        </h2>
        {recent.length ? (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((r) => (
              <li
                key={`${r.kind}-${r.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3 text-sm"
              >
                <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  {r.kind}
                </span>
                <Link
                  href={`${r.base}/${r.id}`}
                  className="min-w-0 flex-1 truncate font-semibold text-ink hover:text-action"
                >
                  {r.title}
                </Link>
                <StatusPill
                  status={r.status}
                  placeholder={r.placeholder}
                  publishedAt={r.publishedAt}
                />
                <span className="w-28 text-right text-xs text-muted">
                  {formatDate(r.updatedAt)}
                </span>
                <Link
                  href={`${r.base}/${r.id}/preview`}
                  className="text-xs font-semibold text-action hover:underline"
                >
                  Preview
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Nothing yet. Create a notice or an article to get started.
          </p>
        )}
      </section>

      {isAdmin ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["Products", "products", "/admin/products"],
                ["Partners", "partners", "/admin/partners"],
              ] as const
            ).map(([label, key, href]) => (
              <Link
                key={key}
                href={href}
                className="rounded-2xl bg-white p-5 shadow-[var(--shadow-ring)] transition hover:shadow-[var(--shadow-ring),var(--shadow-soft)]"
              >
                <p className="text-sm font-semibold text-muted">{label}</p>
                <p className="mt-2 font-display text-3xl font-semibold text-ink tabular-nums">
                  {counts[key].live}
                </p>
                <p className="text-xs text-muted">
                  live · {counts[key].total} in total
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section
              className="rounded-2xl bg-white p-5 shadow-[var(--shadow-ring)] md:p-7"
              aria-labelledby="checklist"
            >
              <h2
                id="checklist"
                className="font-display text-lg font-semibold text-ink"
              >
                Launch checklist
              </h2>
              <p className="mt-1 text-sm text-muted">
                Information still needed from Genesis, worked out from the live
                content. Unconfirmed details and placeholders are hidden on the
                production site until resolved.
              </p>
              {checklist.length === 0 ? (
                <p className="mt-5 rounded-xl bg-ok-bg p-4 text-sm font-semibold text-ok">
                  Everything is confirmed. Nothing outstanding.
                </p>
              ) : (
                <div className="mt-5 flex flex-col gap-6">
                  {grouped
                    .filter((g) => g.items.length)
                    .map((g) => (
                      <div key={g.s}>
                        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                          <span
                            className={`rounded-full px-2 py-0.5 ${SEV[g.s].cls}`}
                          >
                            {SEV[g.s].label}
                          </span>
                          {g.items.length}
                        </h3>
                        <ul className="divide-y divide-line rounded-xl ring-1 ring-line">
                          {g.items.map((it, i) => (
                            <li key={`${it.label}-${i}`}>
                              <Link
                                href={it.href}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cloud"
                              >
                                <span className="w-28 shrink-0 text-xs font-semibold text-muted">
                                  {it.area}
                                </span>
                                <span className="text-body">{it.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </section>

            <div className="flex flex-col gap-6">
              <section
                className="rounded-2xl bg-white p-5 shadow-[var(--shadow-ring)] md:p-7"
                aria-labelledby="recent"
              >
                <div className="flex items-center justify-between">
                  <h2
                    id="recent"
                    className="font-display text-lg font-semibold text-ink"
                  >
                    Recent enquiries
                  </h2>
                  <Link
                    href="/admin/enquiries"
                    className="text-sm font-semibold text-action hover:underline"
                  >
                    All
                  </Link>
                </div>
                {enquiries.items.length ? (
                  <ul className="mt-4 divide-y divide-line">
                    {enquiries.items.map((e) => (
                      <li key={e.id} className="py-3">
                        <p className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-ink">
                            {e.name}
                          </span>
                          {e.status === "new" ? (
                            <span className="chip">New</span>
                          ) : (
                            <span className="chip chip-neutral">Handled</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {formatDate(e.createdAt)} · {e.email}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted">No enquiries yet.</p>
                )}
              </section>

              <section
                className="rounded-2xl bg-white p-5 text-sm shadow-[var(--shadow-ring)] md:p-7"
                aria-labelledby="system"
              >
                <h2
                  id="system"
                  className="font-display text-lg font-semibold text-ink"
                >
                  System
                </h2>
                <dl className="mt-4 space-y-2.5">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Content storage</dt>
                    <dd className="font-semibold text-ink">
                      {storageDriverName() === "blob"
                        ? "Vercel Blob"
                        : "Local files (.data)"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Review mode</dt>
                    <dd className="font-semibold text-ink">
                      {isPreviewDeployment()
                        ? "On (placeholders visible)"
                        : "Off (production)"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Canonical domain</dt>
                    <dd className="truncate font-semibold text-ink">
                      {siteUrl()}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
