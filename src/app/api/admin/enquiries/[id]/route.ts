import { BodyError, guardAdmin, json, readJson } from "@/lib/auth/api";
import { deleteEnquiry, isEnquiryId, updateEnquiryStatus } from "@/lib/content/enquiries";
import { enquiryStatusSchema } from "@/lib/content/schemas";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH { status: "new" | "handled" } */
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin(req, "enquiries");
  if (denied) return denied;
  const { id } = await params;
  if (!isEnquiryId(id)) return json({ error: "Not found." }, 404);
  let body: unknown;
  try {
    body = await readJson(req, 1000);
  } catch (e) {
    return json({ error: (e as BodyError).message }, (e as BodyError).status ?? 400);
  }
  const parsed = enquiryStatusSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid status." }, 400);
  const ok = await updateEnquiryStatus(id, parsed.data.status);
  return ok ? json({ ok: true }) : json({ error: "Enquiry not found." }, 404);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await guardAdmin(req, "enquiries");
  if (denied) return denied;
  const { id } = await params;
  if (!isEnquiryId(id)) return json({ error: "Not found." }, 404);
  await deleteEnquiry(id);
  return json({ ok: true });
}
