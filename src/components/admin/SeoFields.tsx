"use client";

import { TextArea, TextField } from "./kit";

/** SEO title and meta description, with a search-result style preview. */
export function SeoFields({
  title,
  description,
  fallbackTitle,
  fallbackDescription,
  path,
  onTitle,
  onDescription,
  errors,
}: {
  title: string;
  description: string;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  onTitle: (v: string) => void;
  onDescription: (v: string) => void;
  errors: Record<string, string>;
}) {
  const shownTitle = `${title || fallbackTitle || "Untitled"} | Genesis Pure Lifesciences`;
  const shownDesc = description || fallbackDescription;
  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="SEO title"
        value={title}
        onChange={onTitle}
        maxLength={70}
        error={errors.seoTitle}
        hint="Optional. Defaults to the title. Aim for 50–60 characters."
      />
      <TextArea
        label="Meta description"
        value={description}
        onChange={onDescription}
        maxLength={170}
        rows={3}
        error={errors.metaDescription}
        hint="Optional. Defaults to the excerpt. Aim for 120–160 characters."
      />
      <div className="rounded-xl bg-cloud p-4 ring-1 ring-line" aria-label="Search result preview">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">Search preview</p>
        <p className="mt-2 truncate text-xs text-[#1a7f37]">genesis…{path}</p>
        <p className="truncate text-[1.05rem] text-[#1a0dab]">{shownTitle}</p>
        <p className="line-clamp-2 text-sm text-body">{shownDesc || "No description yet."}</p>
      </div>
    </div>
  );
}
