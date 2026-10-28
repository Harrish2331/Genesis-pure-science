import { BodyError, guardAdmin, json, readJson } from "@/lib/auth/api";
import { OpError, SCHEMA, createRecord, isCollection } from "@/lib/content/admin-ops";
import { invalidate } from "@/lib/content/public";
import { readCollection } from "@/lib/content/repo";
import { fieldErrors } from "@/lib/content/schemas";

type Ctx = { params: Promise<{ collection: string }> };

/** GET — list a collection (dashboard only, always fresh). */
export async function GET(req: Request, { params }: Ctx) {
  const { collection } = await params;
  const denied = await guardAdmin(req, collection);
  if (denied) return denied;
  if (!isCollection(collection)) return json({ error: "Unknown collection." }, 404);
  const { items } = await readCollection(collection);
  return json({ items });
}

/** POST — create a record. */
export async function POST(req: Request, { params }: Ctx) {
  const { collection } = await params;
  const denied = await guardAdmin(req, collection);
  if (denied) return denied;
  if (!isCollection(collection)) return json({ error: "Unknown collection." }, 404);

  let body: unknown;
  try {
    body = await readJson(req);
  } catch (e) {
    return json({ error: (e as BodyError).message }, (e as BodyError).status ?? 400);
  }
  const parsed = SCHEMA[collection].safeParse(body);
  if (!parsed.success) return json({ error: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);

  try {
    // The schema for `collection` produced `parsed.data`, so the pairing is sound.
    const record = await createRecord(collection, parsed.data as never);
    invalidate(collection);
    return json({ item: record }, 201);
  } catch (e) {
    if (e instanceof OpError) return json({ error: e.message, fields: e.fields }, e.status);
    console.error("[admin] create failed", e);
    return json({ error: "The record could not be saved. Please try again." }, 500);
  }
}
