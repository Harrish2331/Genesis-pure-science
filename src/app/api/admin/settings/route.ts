import { after } from "next/server";
import { BodyError, guardAdmin, json, readJson } from "@/lib/auth/api";
import { collectUnusedMedia } from "@/lib/content/admin-ops";
import { invalidate } from "@/lib/content/public";
import { readSettings, writeSettings } from "@/lib/content/repo";
import { fieldErrors, settingsSchema } from "@/lib/content/schemas";

/** PUT /api/admin/settings — replace the site settings (validated). */
export async function PUT(req: Request) {
  const denied = await guardAdmin(req, "settings");
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await readJson(req)) as Record<string, unknown>;
  } catch (e) {
    return json({ error: (e as BodyError).message }, (e as BodyError).status ?? 400);
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);

  const expected = typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : undefined;
  try {
    const before = (await readSettings()).settings;
    if (expected && before.updatedAt !== expected) {
      return json({ error: "Settings were changed by someone else since you opened this page. Reload to see their changes." }, 409);
    }
    const oldPoster = before.intro.poster?.key;
    const saved = await writeSettings((s) => ({ ...s, ...parsed.data }));
    invalidate("settings");
    if (oldPoster && oldPoster !== saved.intro.poster?.key) after(() => collectUnusedMedia([oldPoster]));
    return json({ settings: saved });
  } catch (e) {
    console.error("[admin] settings save failed", e);
    return json({ error: "Settings could not be saved. Please try again." }, 500);
  }
}
