import { after } from "next/server";
import { BodyError, guardAdmin, json, readJson } from "@/lib/auth/api";
import { OpError, SCHEMA, collectUnusedMedia, deleteRecord, isCollection, updateRecord } from "@/lib/content/admin-ops";
import { invalidate } from "@/lib/content/public";
import { fieldErrors } from "@/lib/content/schemas";

type Ctx = { params: Promise<{ collection: string; id: string }> };

const ID = /^[\w-]{1,80}$/;

/** PUT — replace a record. Body: the record fields, plus optional expectedUpdatedAt. */
export async function PUT(req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  const denied = await guardAdmin(req, collection);
  if (denied) return denied;
  if (!isCollection(collection) || !ID.test(id)) return json({ error: "Not found." }, 404);

  let body: Record<string, unknown>;
  try {
    body = (await readJson(req)) as Record<string, unknown>;
  } catch (e) {
    return json({ error: (e as BodyError).message }, (e as BodyError).status ?? 400);
  }
  const expected = typeof body?.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : undefined;
  const parsed = SCHEMA[collection].safeParse(body);
  if (!parsed.success) return json({ error: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);

  try {
    const { record, replacedMedia } = await updateRecord(collection, id, parsed.data as never, expected);
    invalidate(collection);
    after(() => collectUnusedMedia(replacedMedia));
    return json({ item: record });
  } catch (e) {
    if (e instanceof OpError) return json({ error: e.message, fields: e.fields }, e.status);
    console.error("[admin] update failed", e);
    return json({ error: "The record could not be saved. Please try again." }, 500);
  }
}

/** DELETE — remove a record (the dashboard asks for confirmation first). */
export async function DELETE(req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  const denied = await guardAdmin(req, collection);
  if (denied) return denied;
  if (!isCollection(collection) || !ID.test(id)) return json({ error: "Not found." }, 404);
  try {
    const media = await deleteRecord(collection, id);
    invalidate(collection);
    after(() => collectUnusedMedia(media));
    return json({ ok: true });
  } catch (e) {
    if (e instanceof OpError) return json({ error: e.message }, e.status);
    console.error("[admin] delete failed", e);
    return json({ error: "The record could not be deleted. Please try again." }, 500);
  }
}
