import { guardAdmin, json } from "@/lib/auth/api";
import { MAX_UPLOAD_BYTES, UploadError, storeImage } from "@/lib/media";

/**
 * POST /api/admin/media — multipart upload of one image ("file").
 * Returns a MediaRef for the editor to attach to a record. See src/lib/media.ts
 * for what is checked and how the image is re-encoded.
 */
export async function POST(req: Request) {
  const denied = await guardAdmin(req, "media");
  if (denied) return denied;

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) return json({ error: "Images must be 8 MB or smaller." }, 413);
  if (!(req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
    return json({ error: "Expected a file upload." }, 415);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "The upload could not be read." }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "No file was received." }, 400);

  try {
    const media = await storeImage(file);
    return json({ media }, 201);
  } catch (e) {
    if (e instanceof UploadError) return json({ error: e.message }, 400);
    console.error("[admin] upload failed", e);
    return json({ error: "The image could not be stored. Please try again." }, 500);
  }
}
