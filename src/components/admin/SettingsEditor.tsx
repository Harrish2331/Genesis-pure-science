"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Copy, Fact, Settings } from "@/lib/content/types";
import { FormMessage, ImageField, Panel, TextArea, TextField, Toggle, adminFetch, useUnsavedGuard } from "./kit";

const COPY: [keyof Settings["copy"], string, number][] = [
  ["heroEyebrow", "Hero eyebrow", 80],
  ["heroHeadline", "Hero headline", 140],
  ["heroIntro", "Hero introduction", 500],
  ["footerIntro", "Footer introduction", 400],
  ["aboutIntro", "About introduction", 600],
  ["whoWeAre", "Who we are", 2000],
  ["vision", "Vision", 800],
  ["mission", "Mission", 800],
  ["qualityCommitment", "Commitment to quality", 2000],
  ["scienceFocus", "Scientific focus", 1500],
  ["womensHealth", "Women’s Health description", 800],
  ["generalMedicine", "General Medicine description", 800],
  ["surgicals", "Surgicals description", 800],
  ["manufacturingIntro", "Manufacturing introduction", 1500],
  ["axonIntro", "Axon Surgicals introduction", 1500],
  ["contactIntro", "Contact introduction", 600],
];

export function SettingsEditor({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useUnsavedGuard(JSON.stringify(s) !== JSON.stringify(initial));

  const up = (fn: (d: Settings) => void) =>
    setS((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  // A render helper, not a component: a component declared here would be
  // remounted on every keystroke and its input would lose focus.
  const factRow = ({ label, path, get, max, hint }: { label: string; path: string; get: (d: Settings) => Fact; max: number; hint?: string }) => (
    <div key={path}>
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <TextField label={label} value={get(s).value} maxLength={max} hint={hint} error={fields[`${path}.value`]} onChange={(v) => up((d) => void (get(d).value = v))} />
      <div className="pb-3">
        <Toggle label="Confirmed" checked={get(s).confirmed} onChange={(v) => up((d) => void (get(d).confirmed = v))} />
      </div>
    </div>
    </div>
  );

  const save = async () => {
    setBusy(true);
    setMsg(null);
    setFields({});
    const res = await adminFetch<{ settings: Settings }>("/api/admin/settings", { method: "PUT", body: { ...s, expectedUpdatedAt: initial.updatedAt } });
    setBusy(false);
    if (!res.ok) {
      setFields(res.fields ?? {});
      setMsg({ kind: "error", text: res.error });
      return;
    }
    setMsg({ kind: "ok", text: "Settings saved. The website is updated." });
    router.refresh();
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {msg ? <FormMessage kind={msg.kind}>{msg.text}</FormMessage> : null}
      <p className="rounded-xl bg-mist px-4 py-3 text-sm text-action">
        Facts are shown on the website only when ticked “Confirmed”. Copy is always shown; tick “Approved” to record sign-off — anything still unconfirmed or unapproved is listed in the dashboard’s launch checklist.
      </p>

      <Panel id="brand" title="Brand">
        <TextField label="Company name" value={s.brand.name} maxLength={80} onChange={(v) => up((d) => void (d.brand.name = v))} error={fields["brand.name"]} />
        {factRow({ label: "Registered legal name", path: "brand.legalName", get: (d) => d.brand.legalName, max: 160 })}
        {factRow({ label: "Official tagline", path: "brand.tagline", get: (d) => d.brand.tagline, max: 120, hint: "Leave empty until Genesis supplies it." })}
      </Panel>

      <Panel id="copy" title="Website copy">
        {COPY.map(([key, label, max]) => {
          const c: Copy = s.copy[key];
          return (
            <div key={key} className="rounded-xl p-4 ring-1 ring-line">
              <TextArea label={label} value={c.text} maxLength={max} rows={max > 300 ? 4 : 2} onChange={(v) => up((d) => void (d.copy[key].text = v))} error={fields[`copy.${key}.text`]} />
              <Toggle label="Approved by Genesis" checked={c.approved} onChange={(v) => up((d) => void (d.copy[key].approved = v))} />
            </div>
          );
        })}
      </Panel>

      <Panel id="values" title="Core values">
        {s.values.items.map((v, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
            <TextField label="Value" value={v.title} maxLength={60} onChange={(x) => up((d) => void (d.values.items[i].title = x))} />
            <TextField label="Description" value={v.text} maxLength={300} onChange={(x) => up((d) => void (d.values.items[i].text = x))} />
            <button type="button" className="btn btn-sm mb-0.5 text-danger ring-1 ring-danger/30" onClick={() => up((d) => void d.values.items.splice(i, 1))}>
              Remove
            </button>
          </div>
        ))}
        <div className="flex flex-wrap gap-4">
          {s.values.items.length < 8 ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => up((d) => void d.values.items.push({ title: "", text: "" }))}>
              Add value
            </button>
          ) : null}
          <Toggle label="Approved by Genesis" checked={s.values.approved} onChange={(v) => up((d) => void (d.values.approved = v))} />
        </div>
      </Panel>

      <Panel id="contact" title="Contact details">
        {factRow({ label: "Customer service telephone", path: "contact.customerServicePhone", get: (d) => d.contact.customerServicePhone, max: 30 })}
        {factRow({ label: "Business email", path: "contact.email", get: (d) => d.contact.email, max: 200 })}
        {factRow({ label: "WhatsApp business number", path: "contact.whatsapp", get: (d) => d.contact.whatsapp, max: 20, hint: "International format, digits only, e.g. 919876543210." })}
        <TextField label="WhatsApp pre-filled message" value={s.contact.whatsappMessage} maxLength={300} onChange={(v) => up((d) => void (d.contact.whatsappMessage = v))} />
        {factRow({ label: "GST No. (GSTIN)", path: "contact.gstin", get: (d) => d.contact.gstin, max: 15, hint: "Displayed exactly as entered." })}
        {factRow({ label: "Business hours", path: "contact.hours", get: (d) => d.contact.hours, max: 160 })}
        {s.contact.offices.map((o, i) => (
          <div key={o.id} className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-line">
            <TextField label="Office label" value={o.label} maxLength={60} onChange={(v) => up((d) => void (d.contact.offices[i].label = v))} />
            <TextArea label="Address (one line per row)" rows={4} value={o.lines.join("\n")} onChange={(v) => up((d) => void (d.contact.offices[i].lines = v.split("\n").slice(0, 8)))} />
            <TextField label="Google Maps link" value={o.mapsUrl} maxLength={500} placeholder="https://" error={fields[`contact.offices.${i}.mapsUrl`]} onChange={(v) => up((d) => void (d.contact.offices[i].mapsUrl = v))} />
            <Toggle label="Address confirmed" checked={o.confirmed} onChange={(v) => up((d) => void (d.contact.offices[i].confirmed = v))} />
          </div>
        ))}
      </Panel>

      <Panel id="departments" title="Contact page email cards" description="Each card is shown on the Contact page. One email address per line.">
        {s.contact.departments.map((dep, i) => (
          <div key={dep.id} className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-line">
            <TextField label="Card title" value={dep.label} maxLength={60} error={fields[`contact.departments.${i}.label`]} onChange={(v) => up((d) => void (d.contact.departments[i].label = v))} />
            <TextArea
              label="Email addresses"
              rows={2}
              value={dep.emails.join("\n")}
              error={Object.entries(fields).find(([k]) => k.startsWith(`contact.departments.${i}.emails`))?.[1]}
              onChange={(v) => up((d) => void (d.contact.departments[i].emails = v.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 5)))}
            />
            <div className="flex flex-wrap items-center gap-4">
              <Toggle label="Confirmed" checked={dep.confirmed} onChange={(v) => up((d) => void (d.contact.departments[i].confirmed = v))} />
              <button type="button" className="btn btn-sm text-danger ring-1 ring-danger/30" onClick={() => up((d) => void d.contact.departments.splice(i, 1))}>
                Remove card
              </button>
            </div>
          </div>
        ))}
        {s.contact.departments.length < 8 ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm self-start"
            onClick={() => up((d) => void d.contact.departments.push({ id: `dept-${Date.now()}`, label: "", emails: [], confirmed: true }))}
          >
            Add card
          </button>
        ) : null}
      </Panel>

      <Panel id="social" title="Social media (official URLs only)">
        {(["linkedin", "instagram", "facebook", "x", "youtube"] as const).map((k) => factRow({ label: k === "x" ? "X" : k[0].toUpperCase() + k.slice(1), path: `social.${k}`, get: (d) => d.social[k], max: 500 }))}
      </Panel>

      <Panel id="axon" title="Axon Surgicals">
        {factRow({ label: "Relationship to Genesis", path: "axon.relationship", get: (d) => d.axon.relationship, max: 300, hint: "Shown only once confirmed. Nothing is assumed." })}
        {factRow({ label: "Axon Surgicals website", path: "axon.website", get: (d) => d.axon.website, max: 500 })}
      </Panel>

      <Panel id="intro" title="Company introduction video">
        <TextField label="Video URL (.mp4 or .webm)" value={s.intro.videoUrl} maxLength={500} error={fields["intro.videoUrl"]} onChange={(v) => up((d) => void (d.intro.videoUrl = v))} hint="Leave empty to show the animated brand introduction." />
        <ImageField label="Poster image" value={s.intro.poster} onChange={(v) => up((d) => void (d.intro.poster = v))} />
      </Panel>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="submit" className="btn btn-primary shadow-xl" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
