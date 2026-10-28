import { driver } from "@/lib/store/driver";

/**
 * GET /api/media/media/<yyyy>/<mm>/<uuid>.webp — stream an uploaded image.
 *
 * Used by the filesystem driver and by private Blob stores (a public store
 * serves its own CDN URLs instead). Keys are random UUIDs written by the
 * upload handler, so a URL is immutable and cached for a year. Only keys
 * under media/ can be served — content documents and enquiries cannot be
 * reached through this route.
 */
const MEDIA_KEY = /^media\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(webp|jpg|png|avif)$/;

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!MEDIA_KEY.test(key)) return new Response("Not found", { status: 404 });

  const file = await driver().readBinary(key);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file.body as BodyInit, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
    },
  });
}
