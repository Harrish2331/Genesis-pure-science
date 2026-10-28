"use client";

import { AVAILABILITY_LABELS, CATEGORIES, subcategoriesOf } from "@/content/site";
import { AVAILABILITY, type Product } from "@/lib/content/types";
import { ConfirmButton, FormMessage, ImageField, Panel, SelectField, SlugField, StatusPill, TextArea, TextField, Toggle, useRecordEditor } from "./kit";
import { MarkdownField } from "./MarkdownField";
import { SeoFields } from "./SeoFields";

export function ProductEditor({ initial, isNew }: { initial: Product; isNew: boolean }) {
  const ed = useRecordEditor<Product>({ collection: "products", initial, isNew, listHref: "/admin/products", editHref: (id) => `/admin/products/${id}` });
  const r = ed.record;
  const f = ed.fields;

  const setSpec = (i: number, key: "label" | "value", v: string) =>
    ed.set(
      "specifications",
      r.specifications.map((s, j) => (j === i ? { ...s, [key]: v } : s)),
    );

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
        <p className="rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn">
          Enter product information exactly as approved by Genesis. Do not add clinical claims, dosage advice, prices or regulatory statements
          unless they have been supplied and approved.
        </p>
        <Panel title="Product">
          <TextField label="Product name" required value={r.name} onChange={(v) => ed.set("name", v)} maxLength={120} error={f.name} />
          <SlugField value={r.slug} onChange={(v) => ed.set("slug", v)} source={r.name} prefix="/products/" error={f.slug} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Category"
              value={r.category}
              onChange={(v) => {
                ed.set("category", v);
                // Subcategories belong to one category; clear any that no longer fit.
                ed.set("subcategories", r.subcategories.filter((s) => subcategoriesOf(v).some((x) => x.id === s)));
              }}
              options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            />
            <TextField label="Brand line (optional)" value={r.brand} onChange={(v) => ed.set("brand", v)} maxLength={80} hint="e.g. “Axon Surgicals” lists it on the Axon page." />
          </div>
          {subcategoriesOf(r.category).length ? (
            <fieldset>
              <legend className="field-label">Subcategories</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {subcategoriesOf(r.category).map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--color-action)]"
                      checked={r.subcategories.includes(s.id)}
                      onChange={(e) =>
                        ed.set("subcategories", e.target.checked ? [...r.subcategories, s.id] : r.subcategories.filter((x) => x !== s.id))
                      }
                    />
                    {s.label}
                  </label>
                ))}
              </div>
              {f.subcategories ? <p className="field-error">{f.subcategories}</p> : <p className="field-hint">Choose only areas supported by the approved pack or product information.</p>}
            </fieldset>
          ) : null}
          <TextArea
            label="Composition (exactly as printed on the pack)"
            value={r.composition}
            onChange={(v) => ed.set("composition", v)}
            maxLength={1000}
            rows={3}
            error={f.composition}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Dosage form" value={r.dosageForm} onChange={(v) => ed.set("dosageForm", v)} maxLength={80} placeholder="e.g. Tablets" error={f.dosageForm} />
            <TextField label="Pack size" value={r.packSize} onChange={(v) => ed.set("packSize", v)} maxLength={80} placeholder="e.g. 1 x 10 tablets" error={f.packSize} />
          </div>
          <TextArea
            label="Short description"
            value={r.shortDescription}
            onChange={(v) => ed.set("shortDescription", v)}
            maxLength={300}
            rows={3}
            error={f.shortDescription}
            hint="Shown on product cards. Required to publish."
          />
          <MarkdownField label="Full description (optional)" value={r.description} onChange={(v) => ed.set("description", v)} maxLength={8000} rows={8} error={f.description} />
          <ImageField label="Product image" value={r.image} onChange={(v) => ed.set("image", v)} alt={r.imageAlt} onAltChange={(v) => ed.set("imageAlt", v)} altError={f.imageAlt} />
          <TextField
            label="Image caption (optional)"
            value={r.imageCaption}
            onChange={(v) => ed.set("imageCaption", v)}
            maxLength={160}
            hint="Shown under the image. Leave empty for “Pack shown for identification. Artwork may vary.”"
          />
        </Panel>

        <Panel
          title="Specifications"
          description="Any other details printed on the approved pack, e.g. storage or dosage directions."
          aside={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={r.specifications.length >= 20}
              onClick={() => ed.set("specifications", [...r.specifications, { label: "", value: "" }])}
            >
              Add row
            </button>
          }
        >
          {r.specifications.length === 0 ? <p className="text-sm text-muted">No specifications yet.</p> : null}
          {r.specifications.map((s, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
              <TextField label="Label" value={s.label} onChange={(v) => setSpec(i, "label", v)} maxLength={60} error={f[`specifications.${i}.label`]} />
              <TextField label="Value" value={s.value} onChange={(v) => setSpec(i, "value", v)} maxLength={300} error={f[`specifications.${i}.value`]} />
              <button
                type="button"
                className="btn btn-sm mb-0.5 text-danger ring-1 ring-danger/30 hover:bg-danger-bg"
                onClick={() => ed.set("specifications", r.specifications.filter((_, j) => j !== i))}
                aria-label={`Remove ${s.label || "row"}`}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <TextField label="Manufactured by (verified only)" value={r.manufacturer} onChange={(v) => ed.set("manufacturer", v)} maxLength={120} />
            <TextField label="Marketed by (verified only)" value={r.marketedBy} onChange={(v) => ed.set("marketedBy", v)} maxLength={120} />
          </div>
        </Panel>

        <Panel title="Search engines and sharing">
          <SeoFields
            title={r.seoTitle}
            description={r.metaDescription}
            fallbackTitle={r.name}
            fallbackDescription={r.shortDescription}
            path={`/products/${r.slug}`}
            onTitle={(v) => ed.set("seoTitle", v)}
            onDescription={(v) => ed.set("metaDescription", v)}
            errors={f}
          />
        </Panel>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
        <Panel title="Publishing" aside={<StatusPill status={ed.saved.status} placeholder={ed.saved.placeholder} />}>
          <SelectField
            label="Availability"
            value={r.availability}
            onChange={(v) => ed.set("availability", v)}
            options={AVAILABILITY.map((a) => ({ value: a, label: a === "unspecified" ? "Not shown" : AVAILABILITY_LABELS[a] }))}
          />
          <Toggle
            label="Prescription only (Rx)"
            checked={r.prescriptionOnly}
            onChange={(v) => ed.set("prescriptionOnly", v)}
            hint="Shows a healthcare-professional notice before details and keeps the page out of search engines."
          />
          <Toggle label="Featured on the homepage" checked={r.featured} onChange={(v) => ed.set("featured", v)} />
          <TextField
            label="Sort order"
            type="number"
            value={String(r.sortOrder)}
            onChange={(v) => ed.set("sortOrder", Number.parseInt(v || "0", 10) || 0)}
            hint="Lower numbers appear first."
          />
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-primary" disabled={ed.busy} onClick={() => void ed.save({ status: "published" })}>
              {ed.saved.status === "published" && !isNew ? "Update published product" : "Publish"}
            </button>
            <button type="button" className="btn btn-secondary" disabled={ed.busy} onClick={() => void ed.save({ status: "draft" })}>
              {ed.saved.status === "published" && !isNew ? "Unpublish (save as draft)" : "Save draft"}
            </button>
          </div>
          {ed.dirty ? <p className="text-xs font-semibold text-warn">Unsaved changes</p> : null}
          {!isNew ? (
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {ed.saved.status === "published" ? (
                <a href={`/products/${ed.saved.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  {ed.saved.placeholder ? "View (review mode only)" : "View live"}
                </a>
              ) : null}
              <ConfirmButton label="Delete" title="Delete this product?" body={`“${ed.saved.name}” will be removed from the catalogue. This cannot be undone.`} onConfirm={ed.remove} />
            </div>
          ) : null}
        </Panel>
        <Panel title="Review">
          <Toggle label="Development placeholder" checked={r.placeholder} onChange={(v) => ed.set("placeholder", v)} hint="Never shown on the production site." />
          <TextArea label="Internal note" value={r.reviewNote} onChange={(v) => ed.set("reviewNote", v)} maxLength={1000} rows={4} hint="Never shown publicly." />
        </Panel>
      </div>
    </form>
  );
}
