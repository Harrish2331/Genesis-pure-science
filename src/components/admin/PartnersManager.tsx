"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Partner, PartnerSite } from "@/lib/content/types";
import { slugify } from "@/lib/text";
import { ConfirmButton, FormMessage, ImageField, Panel, TextArea, TextField, Toggle, adminFetch } from "./kit";

const blank = (order: number): Partner => ({
  id: "",
  slug: "",
  name: "",
  fullName: "",
  nameConfirmed: false,
  description: "",
  tagline: "",
  location: "",
  region: "",
  capabilities: [],
  certifications: [],
  sites: [],
  exportMarkets: [],
  productRanges: [],
  registrations: [],
  notes: [],
  sourceNote: "",
  logo: null,
  website: "",
  sortOrder: order,
  published: true,
  reviewNote: "",
  createdAt: "",
  updatedAt: "",
});

/* One entry per line; sites are "Name | Location | Role". */
const toLines = (v: string[]) => v.join("\n");
const fromLines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);
const sitesToLines = (v: PartnerSite[]) => v.map((s) => [s.name, s.location, s.role].join(" | ").replace(/( \| )+$/, "")).join("\n");
const sitesFromLines = (v: string): PartnerSite[] =>
  fromLines(v).map((l) => {
    const [name = "", location = "", role = ""] = l.split("|").map((x) => x.trim());
    return { name, location, role };
  });

function PartnerForm({ initial, onDone }: { initial: Partner; onDone: () => void }) {
  const [p, setP] = useState(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Raw text for the list fields, parsed on save so typing a new line is never swallowed.
  const [lists, setLists] = useState({
    capabilities: toLines(initial.capabilities),
    certifications: toLines(initial.certifications),
    exportMarkets: toLines(initial.exportMarkets),
    productRanges: toLines(initial.productRanges),
    registrations: toLines(initial.registrations),
    notes: toLines(initial.notes),
    sites: sitesToLines(initial.sites),
  });
  const setList = (k: keyof typeof lists, v: string) => setLists((x) => ({ ...x, [k]: v }));
  const isNew = !initial.id;
  const set = <K extends keyof Partner>(k: K, v: Partner[K]) => setP((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    setFields({});
    const body: Partner = {
      ...p,
      slug: p.slug || slugify(p.name),
      capabilities: fromLines(lists.capabilities),
      certifications: fromLines(lists.certifications),
      exportMarkets: fromLines(lists.exportMarkets),
      productRanges: fromLines(lists.productRanges),
      registrations: fromLines(lists.registrations),
      notes: fromLines(lists.notes),
      sites: sitesFromLines(lists.sites),
    };
    const res = isNew
      ? await adminFetch<{ item: Partner }>("/api/admin/content/partners", { method: "POST", body })
      : await adminFetch<{ item: Partner }>(`/api/admin/content/partners/${p.id}`, { method: "PUT", body: { ...body, expectedUpdatedAt: initial.updatedAt } });
    setBusy(false);
    if (!res.ok) {
      setFields(res.fields ?? {});
      setMsg({ kind: "error", text: res.error });
      return;
    }
    setMsg({ kind: "ok", text: "Saved." });
    onDone();
  };

  return (
    <Panel
      title={isNew ? "New partner" : p.name || "Partner"}
      description={p.reviewNote || undefined}
      aside={
        <span className="flex gap-1.5">
          {p.published ? <span className="chip chip-green">Shown</span> : <span className="chip chip-neutral">Hidden</span>}
          {p.nameConfirmed ? <span className="chip chip-green">Name confirmed</span> : <span className="review-flag">Name to confirm</span>}
        </span>
      }
    >
      {msg ? <FormMessage kind={msg.kind}>{msg.text}</FormMessage> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <TextField label="Company name (exactly as supplied)" required value={p.name} onChange={(v) => set("name", v)} maxLength={120} error={fields.name} />
        <TextField label="Order" type="number" value={String(p.sortOrder)} onChange={(v) => set("sortOrder", Number.parseInt(v || "0", 10) || 0)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full / registered name" value={p.fullName} onChange={(v) => set("fullName", v)} maxLength={160} error={fields.fullName} />
        <TextField
          label="Profile page URL slug"
          value={p.slug}
          onChange={(v) => set("slug", v)}
          maxLength={80}
          error={fields.slug}
          hint={`Shown at /manufacturing/${p.slug || slugify(p.name) || "…"}. Left empty, it is made from the name.`}
        />
      </div>
      <Toggle label="Official name and spelling confirmed by Genesis" checked={p.nameConfirmed} onChange={(v) => set("nameConfirmed", v)} />
      <TextField label="Tagline" value={p.tagline} onChange={(v) => set("tagline", v)} maxLength={200} error={fields.tagline} />
      <TextArea
        label="Verified description"
        value={p.description}
        onChange={(v) => set("description", v)}
        maxLength={3000}
        rows={5}
        hint="Only a description Genesis has verified or the partner's own published profile. Separate paragraphs with a blank line."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Country" value={p.location} onChange={(v) => set("location", v)} maxLength={120} />
        <TextField label="Region(s)" value={p.region} onChange={(v) => set("region", v)} maxLength={160} />
        <TextField label="Website (verified)" value={p.website} onChange={(v) => set("website", v)} maxLength={500} error={fields.website} placeholder="https://" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label="Capabilities (one per line)" value={lists.capabilities} onChange={(v) => setList("capabilities", v)} rows={5} error={fields.capabilities} />
        <TextArea
          label="Certifications stated by the partner (one per line)"
          value={lists.certifications}
          onChange={(v) => setList("certifications", v)}
          rows={5}
          error={fields.certifications}
          hint="Shown credited to the partner, never as Genesis's own certification."
        />
      </div>
      <TextArea
        label="Sites (one per line: Name | Location | Role)"
        value={lists.sites}
        onChange={(v) => setList("sites", v)}
        rows={5}
        error={fields.sites}
        hint="Example: Plant I name | Town, State | Plant I"
      />
      <TextArea label="Export markets (one per line)" value={lists.exportMarkets} onChange={(v) => setList("exportMarkets", v)} rows={4} error={fields.exportMarkets} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label="Product ranges (one per line)" value={lists.productRanges} onChange={(v) => setList("productRanges", v)} rows={4} error={fields.productRanges} />
        <TextArea
          label="Regulatory registrations (one per line)"
          value={lists.registrations}
          onChange={(v) => setList("registrations", v)}
          rows={4}
          error={fields.registrations}
          hint="Market registrations the partner states it holds — not registrations of Genesis products."
        />
      </div>
      <TextArea
        label="Notes shown with the profile (one per line)"
        value={lists.notes}
        onChange={(v) => setList("notes", v)}
        rows={4}
        error={fields.notes}
        hint="Qualifiers visitors should see, e.g. conflicting figures in the source, or capacity that is planned rather than installed."
      />
      <TextArea
        label="Source of this information"
        value={p.sourceNote}
        onChange={(v) => set("sourceNote", v)}
        maxLength={500}
        rows={2}
        error={fields.sourceNote}
        hint="Shown on the profile page, e.g. “Information from the partner's company brochure.”"
      />
      <ImageField label="Official logo" value={p.logo} onChange={(v) => set("logo", v)} hint="Upload only the partner's official logo file. Never a recreation." />
      <Toggle label="Show on the website" checked={p.published} onChange={(v) => set("published", v)} />
      <TextArea label="Internal note" value={p.reviewNote} onChange={(v) => set("reviewNote", v)} maxLength={1000} rows={2} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={save}>
          {busy ? "Saving…" : isNew ? "Add partner" : "Save partner"}
        </button>
        {!isNew ? (
          <ConfirmButton
            label="Delete"
            title="Delete this partner?"
            body={`${initial.name} will be removed from the Manufacturing page.`}
            onConfirm={async () => {
              const res = await adminFetch(`/api/admin/content/partners/${initial.id}`, { method: "DELETE" });
              if (!res.ok) setMsg({ kind: "error", text: res.error });
              else onDone();
            }}
          />
        ) : null}
      </div>
    </Panel>
  );
}

export function PartnersManager({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const refresh = () => {
    setAdding(false);
    router.refresh();
  };
  return (
    <div className="flex flex-col gap-6">
      {partners.map((p) => (
        <PartnerForm key={`${p.id}-${p.updatedAt}`} initial={p} onDone={refresh} />
      ))}
      {adding ? (
        <PartnerForm initial={blank((partners.at(-1)?.sortOrder ?? 0) + 1)} onDone={refresh} />
      ) : (
        <button type="button" className="btn btn-secondary self-start" onClick={() => setAdding(true)}>
          Add a partner
        </button>
      )}
    </div>
  );
}
