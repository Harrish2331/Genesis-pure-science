"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { PUBLISH_LABELS, publishState } from "@/lib/content/publish";
import type { MediaRef } from "@/lib/content/types";
import { slugify } from "@/lib/text";

/* ── API ───────────────────────────────────────────────────────────────── */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; fields?: Record<string, string> };

export async function adminFetch<T>(url: string, init?: { method?: string; body?: unknown; form?: FormData }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: init?.method ?? "GET",
      headers: init?.form ? undefined : init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.form ?? (init?.body !== undefined ? JSON.stringify(init.body) : undefined),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 401) {
      // A full reload on purpose: it drops all client state from the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/admin/login?expired=1&next=${encodeURIComponent(window.location.pathname)}`);
      return { ok: false, status: 401, error: "Your session has expired." };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: typeof data.error === "string" ? data.error : `Request failed (${res.status}).`,
        fields: (data.fields as Record<string, string>) ?? undefined,
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Could not reach the server. Check your connection." };
  }
}

/* ── Layout ────────────────────────────────────────────────────────────── */

export function Panel({ title, description, children, id, aside }: { title: string; description?: string; children: React.ReactNode; id?: string; aside?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-[var(--shadow-ring)] md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
        {aside}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Draft / Published, or Scheduled when a published item carries a future date (pass publishedAt). */
export function StatusPill({ status, placeholder, publishedAt }: { status: "draft" | "published" | string; placeholder?: boolean; publishedAt?: string }) {
  const state = publishedAt === undefined ? (status === "published" ? "live" : "draft") : publishState(status, publishedAt);
  const cls = state === "live" ? "chip chip-green" : state === "scheduled" ? "chip chip-warn" : "chip chip-neutral";
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      <span className={cls}>{PUBLISH_LABELS[state]}</span>
      {placeholder ? <span className="review-flag">Placeholder</span> : null}
    </span>
  );
}

/* ── Fields ────────────────────────────────────────────────────────────── */

type Base = { label: string; error?: string; hint?: React.ReactNode; required?: boolean; className?: string };

function Wrap({ id, label, error, hint, required, className, children }: Base & { id: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  value,
  onChange,
  maxLength,
  type = "text",
  placeholder,
  ...base
}: Base & { value: string; onChange: (v: string) => void; maxLength?: number; type?: string; placeholder?: string }) {
  const id = useId();
  return (
    <Wrap id={id} {...base}>
      <input
        id={id}
        type={type}
        className="field"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={base.error ? `${id}-err` : undefined}
      />
      {maxLength && value.length > maxLength * 0.8 ? (
        <p className="field-hint text-right tabular-nums">
          {value.length}/{maxLength}
        </p>
      ) : null}
    </Wrap>
  );
}

export function TextArea({
  value,
  onChange,
  maxLength,
  rows = 4,
  placeholder,
  mono,
  ...base
}: Base & { value: string; onChange: (v: string) => void; maxLength?: number; rows?: number; placeholder?: string; mono?: boolean }) {
  const id = useId();
  return (
    <Wrap id={id} {...base}>
      <textarea
        id={id}
        rows={rows}
        className={`field ${mono ? "font-mono text-[0.9rem]" : ""}`}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={base.error ? `${id}-err` : undefined}
      />
      {maxLength ? (
        <p className="field-hint text-right tabular-nums">
          {value.length}/{maxLength}
        </p>
      ) : null}
    </Wrap>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ...base
}: Base & { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <Wrap id={id} {...base}>
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-action)]" />
      <label htmlFor={id} className="text-sm">
        <span className="font-semibold text-ink">{label}</span>
        {hint ? <span className="block text-muted">{hint}</span> : null}
      </label>
    </div>
  );
}

/** Slug input that follows the title until edited by hand. */
export function SlugField({ value, onChange, source, prefix, error }: { value: string; onChange: (v: string) => void; source: string; prefix: string; error?: string }) {
  const [manual, setManual] = useState(Boolean(value));
  useEffect(() => {
    if (!manual) onChange(slugify(source));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- follow the title only
  }, [source, manual]);
  return (
    <TextField
      label="URL slug"
      required
      value={value}
      onChange={(v) => {
        setManual(true);
        onChange(v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"));
      }}
      maxLength={80}
      error={error}
      hint={
        <>
          {prefix}
          <strong className="text-ink">{value || "…"}</strong>
          {manual ? (
            <button type="button" className="ml-2 font-semibold text-action hover:underline" onClick={() => setManual(false)}>
              Reset from title
            </button>
          ) : null}
        </>
      }
    />
  );
}

/* ── Image upload ──────────────────────────────────────────────────────── */

export function ImageField({
  label,
  value,
  onChange,
  alt,
  onAltChange,
  altError,
  hint,
}: {
  label: string;
  value: MediaRef | null;
  onChange: (v: MediaRef | null) => void;
  alt?: string;
  onAltChange?: (v: string) => void;
  altError?: string;
  hint?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (file.size > 8 * 1024 * 1024) return setError("Images must be 8 MB or smaller.");
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setError("Use a JPEG, PNG, WebP or AVIF image.");
    setBusy(true);
    const form = new FormData();
    form.set("file", file);
    const res = await adminFetch<{ media: MediaRef }>("/api/admin/media", { method: "POST", form });
    setBusy(false);
    if (res.ok) onChange(res.data.media);
    else setError(res.error);
  };

  return (
    <div>
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cloud ring-1 ring-line sm:w-56">
          {value ? (
            <Image src={value.url} alt="" fill sizes="224px" className="object-contain" />
          ) : (
            <span className="px-4 text-center text-xs text-muted">No image</span>
          )}
          {busy ? <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-action">Uploading…</span> : null}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()} disabled={busy} aria-describedby={`${id}-label`}>
              {value ? "Replace image" : "Upload image"}
            </button>
            {value ? (
              <button type="button" className="btn btn-sm text-danger ring-1 ring-danger/30 hover:bg-danger-bg" onClick={() => onChange(null)}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <p className="field-hint !mt-0">{hint ?? "JPEG, PNG, WebP or AVIF, up to 8 MB. Images are optimised and stripped of metadata on upload."}</p>
          {error ? <p className="field-error !mt-0">{error}</p> : null}
          {onAltChange ? (
            <TextField
              label="Image description (alt text)"
              value={alt ?? ""}
              onChange={onAltChange}
              maxLength={200}
              error={altError}
              hint="Describe what the image shows, for people using screen readers."
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Confirm dialog ────────────────────────────────────────────────────── */

export function ConfirmButton({
  label,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  className = "btn btn-sm text-danger ring-1 ring-danger/30 hover:bg-danger-bg",
}: {
  label: string;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        {label}
      </button>
      <dialog ref={ref} className="m-auto w-[min(28rem,92vw)] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-ink/40" aria-labelledby={`${title}-t`}>
        <div className="flex flex-col gap-4 p-6">
          <h2 id={`${title}-t`} className="font-display text-lg font-semibold text-ink">
            {title}
          </h2>
          <p className="text-sm text-body">{body}</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => ref.current?.close()} autoFocus>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm bg-danger text-white hover:bg-[#912018]"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onConfirm();
                setBusy(false);
                ref.current?.close();
              }}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/* ── Notices ───────────────────────────────────────────────────────────── */

export function FormMessage({ kind, children }: { kind: "error" | "ok"; children: React.ReactNode }) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm font-medium ${kind === "error" ? "bg-danger-bg text-danger" : "bg-ok-bg text-ok"}`}>
      {children}
    </div>
  );
}

/** Warn before leaving with unsaved changes. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

/* ── Record editor state ───────────────────────────────────────────────── */

export function useRecordEditor<T extends { id?: string; updatedAt?: string }>(opts: {
  collection: "products" | "insights" | "notices" | "partners";
  initial: T;
  isNew: boolean;
  listHref: string;
  editHref: (id: string) => string;
}) {
  const router = useRouter();
  const [record, setRecord] = useState<T>(opts.initial);
  const [saved, setSaved] = useState<T>(opts.initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(record) !== JSON.stringify(saved);
  useUnsavedGuard(dirty);

  const set = useCallback(<K extends keyof T>(k: K, v: T[K]) => setRecord((r) => ({ ...r, [k]: v })), []);

  const save = async (override?: Partial<T>) => {
    const body = { ...record, ...override };
    setBusy(true);
    setMessage(null);
    setFields({});
    const res = opts.isNew
      ? await adminFetch<{ item: T }>(`/api/admin/content/${opts.collection}`, { method: "POST", body })
      : await adminFetch<{ item: T }>(`/api/admin/content/${opts.collection}/${record.id}`, {
          method: "PUT",
          body: { ...body, expectedUpdatedAt: saved.updatedAt },
        });
    setBusy(false);
    if (!res.ok) {
      setFields(res.fields ?? {});
      setMessage({ kind: "error", text: res.error });
      return false;
    }
    setRecord(res.data.item);
    setSaved(res.data.item);
    setMessage({ kind: "ok", text: "Saved." });
    if (opts.isNew && res.data.item.id) router.replace(opts.editHref(res.data.item.id));
    else router.refresh();
    return true;
  };

  const remove = async () => {
    const res = await adminFetch(`/api/admin/content/${opts.collection}/${record.id}`, { method: "DELETE" });
    if (!res.ok) return setMessage({ kind: "error", text: res.error });
    setSaved(record); // clear dirty state before navigating away
    router.push(opts.listHref);
    router.refresh();
  };

  return { record, set, setRecord, save, remove, fields, message, busy, dirty, saved };
}
