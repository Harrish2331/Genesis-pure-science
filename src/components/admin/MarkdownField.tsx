"use client";

import { useId, useRef, useState } from "react";
import { Markdown } from "@/components/content/Markdown";

/**
 * A plain textarea for the safe Markdown subset, with formatting buttons and
 * a live preview rendered by the same component the public site uses.
 */
export function MarkdownField({
  label,
  value,
  onChange,
  error,
  maxLength,
  rows = 18,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength: number;
  rows?: number;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const wrap = (before: string, after = before, placeholder = "text") => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const line = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const start = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, start) + prefix + value.slice(start));
    requestAnimationFrame(() => ta.focus());
  };

  const tools: [string, string][] = [
    ["H2", "Heading"],
    ["H3", "Sub-heading"],
    ["B", "Bold"],
    ["I", "Italic"],
    ["•", "Bulleted list"],
    ["1.", "Numbered list"],
    ["❝", "Quotation"],
    ["Link", "Link"],
  ];
  const apply = (name: string) => {
    if (name === "Heading") line("## ");
    else if (name === "Sub-heading") line("### ");
    else if (name === "Bold") wrap("**");
    else if (name === "Italic") wrap("*");
    else if (name === "Bulleted list") line("- ");
    else if (name === "Numbered list") line("1. ");
    else if (name === "Quotation") line("> ");
    else wrap("[", "](https://)", "link text");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={id} className="field-label !mb-0">
          {label}
        </label>
        <div role="tablist" aria-label="Editor mode" className="flex rounded-full bg-cloud p-1 ring-1 ring-line">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tab === t ? "bg-white text-action shadow-sm" : "text-muted"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === "write" ? (
        <>
          <div className="mb-2 flex flex-wrap gap-1" role="toolbar" aria-label="Formatting">
            {tools.map(([glyph, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => apply(name)}
                title={name}
                aria-label={name}
                className="h-8 min-w-8 rounded-lg bg-white px-2 text-xs font-bold text-ink ring-1 ring-line hover:text-action hover:ring-action/40"
              >
                {glyph}
              </button>
            ))}
          </div>
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            className="field font-mono text-[0.9rem] leading-relaxed"
            value={value}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
          <p className="field-hint flex justify-between gap-4">
            <span>## heading · **bold** · *italic* · - list · [link](https://…) · &gt; quote</span>
            <span className="tabular-nums">
              {value.length}/{maxLength}
            </span>
          </p>
        </>
      ) : (
        <div className="min-h-64 rounded-xl bg-white p-5 ring-1 ring-line">
          {value.trim() ? <Markdown source={value} /> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
        </div>
      )}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
