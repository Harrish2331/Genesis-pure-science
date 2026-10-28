"use client";

import Link from "next/link";
import { NOTICE_KIND_LABELS } from "@/content/site";
import { NOTICE_KINDS, type Notice } from "@/lib/content/types";
import { ConfirmButton, FormMessage, ImageField, Panel, SelectField, SlugField, StatusPill, TextArea, TextField, Toggle, useRecordEditor } from "./kit";

export function NoticeEditor({
  initial,
  isNew,
  products,
  insights,
}: {
  initial: Notice;
  isNew: boolean;
  products: { slug: string; name: string }[];
  insights: { slug: string; title: string }[];
}) {
  const ed = useRecordEditor<Notice>({ collection: "notices", initial, isNew, listHref: "/admin/notices", editHref: (id) => `/admin/notices/${id}` });
  const r = ed.record;
  const f = ed.fields;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void ed.save();
      }}
      className="grid gap-6 lg:grid-cols-[1fr_22rem]"
    >
      <div className="flex min-w-0 flex-col gap-6">
        {ed.message ? <FormMessage kind={ed.message.kind}>{ed.message.text}</FormMessage> : null}
        <Panel title="Notice">
          <TextField label="Title" required value={r.title} onChange={(v) => ed.set("title", v)} maxLength={160} error={f.title} />
          <SlugField value={r.slug} onChange={(v) => ed.set("slug", v)} source={r.title} prefix="/notices#" error={f.slug} />
          <SelectField
            label="Type"
            value={r.kind}
            onChange={(v) => ed.set("kind", v)}
            options={NOTICE_KINDS.map((k) => ({ value: k, label: NOTICE_KIND_LABELS[k] }))}
          />
          <TextArea label="Notice text" required value={r.summary} onChange={(v) => ed.set("summary", v)} maxLength={2000} rows={6} error={f.summary} />
          <ImageField label="Image (optional)" value={r.image} onChange={(v) => ed.set("image", v)} alt={r.imageAlt} onAltChange={(v) => ed.set("imageAlt", v)} altError={f.imageAlt} />
        </Panel>
        <Panel title="Links" description="Point the notice at a product, an article, or any other page.">
          <SelectField
            label="Related product"
            value={r.productSlug}
            onChange={(v) => ed.set("productSlug", v)}
            options={[{ value: "", label: "None" }, ...products.map((p) => ({ value: p.slug, label: p.name }))]}
          />
          <SelectField
            label="Related article"
            value={r.insightSlug}
            onChange={(v) => ed.set("insightSlug", v)}
            options={[{ value: "", label: "None" }, ...insights.map((a) => ({ value: a.slug, label: a.title }))]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Other link" value={r.linkUrl} onChange={(v) => ed.set("linkUrl", v)} maxLength={500} error={f.linkUrl} placeholder="https://… or /products" />
            <TextField label="Link label" value={r.linkLabel} onChange={(v) => ed.set("linkLabel", v)} maxLength={60} error={f.linkLabel} />
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
        <Panel title="Publishing" aside={<StatusPill status={ed.saved.status} placeholder={ed.saved.placeholder} publishedAt={ed.saved.publishedAt} />}>
          <div>
            <label className="field-label" htmlFor="n-date">
              Announcement date
            </label>
            <input
              id="n-date"
              type="date"
              className="field"
              value={r.publishedAt.slice(0, 10)}
              onChange={(e) => e.target.value && ed.set("publishedAt", new Date(`${e.target.value}T00:00:00.000Z`).toISOString())}
            />
            {f.publishedAt ? <p className="field-error">{f.publishedAt}</p> : <p className="field-hint">Shown on the notice. A future date schedules it.</p>}
          </div>
          <Toggle label="Pin to top" checked={r.pinned} onChange={(v) => ed.set("pinned", v)} />
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-primary" disabled={ed.busy} onClick={() => void ed.save({ status: "published" })}>
              {ed.saved.status === "published" && !isNew ? "Update published notice" : "Publish"}
            </button>
            <button type="button" className="btn btn-secondary" disabled={ed.busy} onClick={() => void ed.save({ status: "draft" })}>
              {ed.saved.status === "published" && !isNew ? "Unpublish (save as draft)" : "Save draft"}
            </button>
          </div>
          {ed.dirty ? <p className="text-xs font-semibold text-warn">Unsaved changes</p> : null}
          {!isNew ? (
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <Link href={`/admin/notices/${r.id}/preview`} target="_blank" className="btn btn-secondary btn-sm">
                Preview{ed.dirty ? " (saved version)" : ""}
              </Link>
              {ed.saved.status === "published" && !ed.saved.placeholder ? (
                <a href={`/notices#${ed.saved.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  View live
                </a>
              ) : null}
              <ConfirmButton label="Delete" title="Delete this notice?" body={`“${ed.saved.title}” will be removed. This cannot be undone.`} onConfirm={ed.remove} />
            </div>
          ) : null}
        </Panel>
        <Panel title="Review">
          <Toggle label="Development placeholder" checked={r.placeholder} onChange={(v) => ed.set("placeholder", v)} hint="Never shown on the production site." />
          <TextArea label="Internal note" value={r.reviewNote} onChange={(v) => ed.set("reviewNote", v)} maxLength={1000} rows={3} />
        </Panel>
      </div>
    </form>
  );
}
