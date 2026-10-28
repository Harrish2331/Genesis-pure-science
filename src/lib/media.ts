import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { driver } from "@/lib/store/driver";
import type { MediaRef } from "@/lib/content/types";

/**
 * Image uploads from the dashboard.
 *
 * An upload is accepted only if (1) it is within the size limit, (2) its first
 * bytes are a real JPEG, PNG, WebP or AVIF signature — the browser-supplied
 * MIME type is not trusted — and (3) sharp can decode it. It is then
 * re-encoded to WebP, auto-rotated, capped at 2400 px and stripped of all
 * metadata (EXIF, GPS). Re-encoding means what is stored is always an image
 * we produced, never the uploaded bytes.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 2400;

export class UploadError extends Error {}

function sniff(buf: Buffer): "jpeg" | "png" | "webp" | "avif" | null {
  if (buf.length < 16) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /avi[fs]/.test(buf.subarray(8, 12).toString("ascii"))) return "avif";
  return null;
}

export async function storeImage(file: File): Promise<MediaRef> {
  if (!file || typeof file.arrayBuffer !== "function") throw new UploadError("No file was received.");
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Images must be 8 MB or smaller.");

  const input = Buffer.from(await file.arrayBuffer());
  if (!sniff(input)) throw new UploadError("Only JPEG, PNG, WebP or AVIF images are accepted.");

  let output: { data: Buffer; info: { width: number; height: number } };
  try {
    output = await sharp(input, { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new UploadError("That file could not be read as an image.");
  }

  const now = new Date();
  const key = `media/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.webp`;
  const { url } = await driver().putBinary(key, output.data, "image/webp");
  return { url, key, width: output.info.width, height: output.info.height, contentType: "image/webp" };
}
