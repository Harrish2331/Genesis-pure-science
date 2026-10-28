"use client";

import Link from "next/link";
import { useState } from "react";
import type { Insight } from "@/lib/content/types";
import { excerpt as toExcerpt } from "@/lib/text";
import { ConfirmButton, FormMessage, ImageField, Panel, SlugField, StatusPill, TextArea, TextField, Toggle, useRecordEditor } from "./kit";
import { MarkdownField } from "./MarkdownField";
import { SeoFields } from "./SeoFields";

export function InsightEditor({ initial, isNew, categories }: { initial: Insight; isNew: boolean; categories: string[] }) {
  const ed = useRecordEditor<Insight>({
    collection: "insights",
    initial,
    isNew,
    listHref: "/admin/insights",
    editHref: (id) => `/admin/insights/${id}`,
  });
  const r = ed.record;
  const f = ed.fields;
  const [now] = useState(() => Date.now());
  const scheduled = r.status === "published" && new Date(r.publishedAt).getTime() > now;
  const liveSaved = ed.saved.status === "published" && !ed.saved.placeholder && new Date(ed.saved.publishedAt).getTime() <= now;

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
        <Panel title="Article">
          <TextField label="Title" required value={r.title} onChange={(v) => ed.set("title", v)} maxLength={160} error={f.title} />
          <SlugField value={r.slug} onChange={(v) => ed.set("slug", v)} source={r.title} prefix="/insights/" error={f.slug} />
          <TextArea
            label="Excerpt"
            value={r.excerpt}
            onChange={(v) => ed.set("excerpt", v)}
            maxLength={320}
            rows={3}
            error={f.excerpt}
            hint="One or two sentences shown on cards and in search. Required to publish."
          />
          <MarkdownField label="Body" value={r.body} onChange={(v) => ed.set("body", v)} error={f.body} maxLength={50000} />
        </Panel>
        <Panel title="Search engines and sharing">
          <SeoFields
            title={r.seoTitle}
            description={r.metaDescription}
            fallbackTitle={r.title}
            fallbackDescription={r.excerpt || toExcerpt(r.body, 155)}
            path={`/insights/${r.slug}`}
            onTitle={(v) => ed.set("seoTitle", v)}
            onDescription={(v) => ed.set("metaDescription", v)}
            errors={f}
          />
        </Panel>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
        <Panel title="Publishing" aside={<StatusPill status={ed.saved.status} placeholder={ed.saved.placeholder} publishedAt={ed.saved.publishedAt} />}>
          {scheduled ? (
            <p className="rounded-xl bg-mist px-3 py-2 text-sm text-action">Scheduled — goes live on the publication date.</p>
          ) : null}
          <div>
            <label className="field-label" htmlFor="pub-date">
              Publication date
            </label>
            <input
              id="pub-date"
              type="date"
              className="field"
              value={r.publishedAt.slice(0, 10)}
              onChange={(e) => e.target.value && ed.set("publishedAt", new Date(`${e.target.value}T00:00:00.000Z`).toISOString())}
              aria-invalid={f.publishedAt ? true : undefined}
            />
            {f.publishedAt ? <p className="field-error">{f.publishedAt}</p> : <p className="field-hint">A future date schedules the article.</p>}
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-primary" disabled={ed.busy} onClick={() => void ed.save({ status: "published" })}>
              {ed.saved.status === "published" && !isNew ? "Update published article" : "Publish"}
            </button>
            <button type="button" className="btn btn-secondary" disabled={ed.busy} onClick={() => void ed.save({ status: "draft" })}>
              {ed.saved.status === "published" && !isNew ? "Unpublish (save as draft)" : "Save draft"}
            </button>
          </div>
          {ed.dirty ? <p className="text-xs font-semibold text-warn">Unsaved changes</p> : null}
          {!isNew ? (
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <Link href={`/admin/insights/${r.id}/preview`} target="_blank" className="btn btn-secondary btn-sm">
                Preview{ed.dirty ? " (saved version)" : ""}
              </Link>
              {liveSaved ? (
                <a href={`/insights/${ed.saved.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  View live
                </a>
              ) : null}
              <ConfirmButton
                label="Delete"
                title="Delete this article?"
                body={`“${ed.saved.title}” will be removed from the website and the dashboard. This cannot be undone.`}
                onConfirm={ed.remove}
              />
            </div>
          ) : null}
        </Panel>

        <Panel title="Details">
          <div>
            <label className="field-label" htmlFor="cat">
              Category
            </label>
            <input id="cat" list="insight-cats" className="field" value={r.category} maxLength={60} onChange={(e) => ed.set("category", e.target.value)} />
            <datalist id="insight-cats">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <TextField label="Author" value={r.author} onChange={(v) => ed.set("author", v)} maxLength={80} error={f.author} />
          <Toggle label="Featured" checked={r.featured} onChange={(v) => ed.set("featured", v)} hint="Shown as the lead article on the Insights page." />
          <ImageField
            label="Cover image"
            value={r.coverImage}
            onChange={(v) => ed.set("coverImage", v)}
            alt={r.coverAlt}
            onAltChange={(v) => ed.set("coverAlt", v)}
            altError={f.coverAlt}
          />
        </Panel>

        <Panel title="Review">
          <Toggle
            label="Development placeholder"
            checked={r.placeholder}
            onChange={(v) => ed.set("placeholder", v)}
            hint="Placeholders are never shown on the production site. Untick once this is real, approved content."
          />
          <TextArea label="Internal note" value={r.reviewNote} onChange={(v) => ed.set("reviewNote", v)} maxLength={1000} rows={3} hint="Never shown publicly." />
        </Panel>
      </div>
    </form>
  );
}
