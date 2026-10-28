"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Enquiry } from "@/lib/content/types";
import { ENQUIRY_TYPE_LABELS } from "@/lib/validation/enquiry";
import { formatDate } from "@/lib/text";
import { ConfirmButton, FormMessage, adminFetch } from "./kit";

export function EnquiryInbox({ items, total }: { items: Enquiry[]; total: number }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "new" | "handled">("new");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = useMemo(() => items.filter((e) => filter === "all" || e.status === filter), [items, filter]);

  const setStatus = async (id: string, status: Enquiry["status"]) => {
    const res = await adminFetch(`/api/admin/enquiries/${id}`, { method: "PATCH", body: { status } });
    if (!res.ok) setError(res.error);
    else router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-mist px-4 py-3 text-sm text-action">
        The website no longer has an enquiry form — visitors contact Genesis by email, telephone or WhatsApp. This inbox keeps the enquiries
        received before the form was removed.
      </p>
      {error ? <FormMessage kind="error">{error}</FormMessage> : null}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter enquiries">
        {(["new", "handled", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === f ? "bg-action text-white" : "bg-white text-ink ring-1 ring-line"}`}
          >
            {f} ({f === "all" ? items.length : items.filter((e) => e.status === f).length})
          </button>
        ))}
        {total > items.length ? <span className="text-xs text-muted">Showing the latest {items.length} of {total}.</span> : null}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted shadow-[var(--shadow-ring)]">No enquiries here.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((e) => {
            const expanded = open === e.id;
            return (
              <li key={e.id} className="rounded-2xl bg-white shadow-[var(--shadow-ring)]">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : e.id)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">
                      {e.name}
                      {e.organisation ? <span className="font-normal text-muted"> · {e.organisation}</span> : null}
                    </span>
                    <span className="block truncate text-sm text-muted">{e.message}</span>
                  </span>
                  <span className="chip chip-neutral">{ENQUIRY_TYPE_LABELS[e.type] ?? e.type}</span>
                  <span className="text-xs text-muted">{formatDate(e.createdAt)}</span>
                  {e.status === "new" ? <span className="chip">New</span> : <span className="chip chip-green">Handled</span>}
                </button>
                {expanded ? (
                  <div className="border-t border-line px-5 py-5">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Email</dt>
                        <dd>
                          <a className="font-semibold text-action hover:underline" href={`mailto:${e.email}`}>
                            {e.email}
                          </a>
                        </dd>
                      </div>
                      {e.phone ? (
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Telephone</dt>
                          <dd>
                            <a className="font-semibold text-action hover:underline" href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}>
                              {e.phone}
                            </a>
                          </dd>
                        </div>
                      ) : null}
                      {e.product ? (
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Product</dt>
                          <dd className="text-ink">{e.product}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Received</dt>
                        <dd className="text-ink">
                          {new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Email copy</dt>
                        <dd className="text-ink">{e.emailDelivered === null ? "Not configured" : e.emailDelivered ? "Delivered" : "Failed"}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 whitespace-pre-wrap rounded-xl bg-cloud p-4 text-sm text-ink">{e.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a className="btn btn-primary btn-sm" href={`mailto:${e.email}?subject=${encodeURIComponent("Re: your enquiry to Genesis Pure Lifesciences")}`}>
                        Reply by email
                      </a>
                      {e.status === "new" ? (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus(e.id, "handled")}>
                          Mark as handled
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus(e.id, "new")}>
                          Mark as new
                        </button>
                      )}
                      <ConfirmButton
                        label="Delete"
                        title="Delete this enquiry?"
                        body={`The enquiry from ${e.name} will be permanently deleted.`}
                        onConfirm={async () => {
                          const res = await adminFetch(`/api/admin/enquiries/${e.id}`, { method: "DELETE" });
                          if (!res.ok) setError(res.error);
                          else router.refresh();
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
