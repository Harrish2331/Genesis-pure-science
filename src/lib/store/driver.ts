import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobPreconditionFailedError, del, get, list, put } from "@vercel/blob";

/**
 * Persistent storage for content documents, enquiries and uploaded media.
 *
 * Two drivers, chosen by environment:
 *
 *   filesystem   Default. Writes under CONTENT_STORAGE_DIR (default ".data"),
 *                which is outside public/ on purpose. For local development
 *                and for hosts with a persistent disk.
 *
 *   vercel blob  Active whenever BLOB_READ_WRITE_TOKEN is set — and then for
 *                EVERYTHING. A serverless function has no writable disk, so
 *                there is no "small enough to keep on disk" exception.
 *
 * Documents carry an ETag. Writes pass the ETag they read, and the driver
 * refuses the write if the document changed in between (Blob `ifMatch`; on
 * disk, a content hash). The repository retries such conflicts, so two
 * administrators — or two server instances — saving at once cannot silently
 * drop each other's changes.
 */

export class ConflictError extends Error {
  constructor(key: string) {
    super(`Document ${key} changed during the write`);
  }
}

export type Doc = { text: string; etag: string };

export type StoredBinary = {
  body: ReadableStream<Uint8Array> | Buffer;
  contentType: string;
  size?: number;
};

export interface StoreDriver {
  readonly name: "filesystem" | "blob";
  readDoc(key: string): Promise<Doc | null>;
  /** `etag` null means "create; fail if it already exists". */
  writeDoc(key: string, text: string, etag: string | null): Promise<void>;
  putBinary(key: string, bytes: Buffer, contentType: string): Promise<{ url: string }>;
  readBinary(key: string): Promise<StoredBinary | null>;
  remove(key: string): Promise<void>;
  /** Keys under a prefix, newest uploads not guaranteed first. */
  list(prefix: string): Promise<string[]>;
}

const KEY = /^[a-z0-9][a-z0-9._/-]*$/i;

export function assertKey(key: string) {
  if (!KEY.test(key) || key.includes("..") || key.includes("//")) {
    throw new Error(`Invalid storage key: ${key}`);
  }
}

const sha = (text: string | Buffer) => createHash("sha256").update(text).digest("hex").slice(0, 32);

/* ── Filesystem ───────────────────────────────────────────────────────── */

class FileSystemDriver implements StoreDriver {
  readonly name = "filesystem" as const;
  // Runtime data, never part of the bundle: tell the tracer not to follow it.
  private readonly root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.CONTENT_STORAGE_DIR ?? ".data");

  private file(key: string) {
    assertKey(key);
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Key escapes the storage root");
    return full;
  }

  async readDoc(key: string): Promise<Doc | null> {
    try {
      const text = await readFile(this.file(key), "utf8");
      return { text, etag: sha(text) };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  async writeDoc(key: string, text: string, etag: string | null) {
    const target = this.file(key);
    const current = await this.readDoc(key);
    if (etag === null ? current !== null : current?.etag !== etag) throw new ConflictError(key);
    await mkdir(path.dirname(target), { recursive: true });
    // Write a sibling and rename: a reader sees the old file or the new one,
    // never a half-written one.
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, text, "utf8");
    await rename(tmp, target);
  }

  async putBinary(key: string, bytes: Buffer) {
    const target = this.file(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    return { url: `/api/media/${key}` };
  }

  async readBinary(key: string): Promise<StoredBinary | null> {
    try {
      const target = this.file(key);
      const [body, info] = await Promise.all([readFile(target), stat(target)]);
      return { body, contentType: contentTypeFor(key), size: info.size };
    } catch {
      return null;
    }
  }

  async remove(key: string) {
    await rm(this.file(key), { force: true });
  }

  async list(prefix: string) {
    assertKey(prefix);
    const dir = this.file(prefix.replace(/\/+$/, ""));
    const out: string[] = [];
    const walk = async (d: string) => {
      let entries;
      try {
        entries = await readdir(d, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) await walk(full);
        else if (!e.name.endsWith(".tmp")) out.push(path.relative(this.root, full).split(path.sep).join("/"));
      }
    };
    await walk(dir);
    return out;
  }
}

/* ── Vercel Blob ──────────────────────────────────────────────────────── */

type Access = "private" | "public";

const PREFIX = "genesis/";

class BlobDriver implements StoreDriver {
  readonly name = "blob" as const;
  /** Learned from the store on first contact; never configured by hand. */
  private access: Access | null = null;

  private get token() {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  private order(): Access[] {
    return this.access ? [this.access] : ["private", "public"];
  }

  private static mismatch(e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    return /access on a (private|public) store|configured with (private|public) access/i.test(m);
  }

  /** Run a put, learning the store's access level from a mismatch error. */
  private async withAccess<T>(op: (access: Access) => Promise<T>): Promise<T> {
    let last: unknown;
    for (const access of this.order()) {
      try {
        const r = await op(access);
        this.access = access;
        return r;
      } catch (e) {
        last = e;
        if (!BlobDriver.mismatch(e)) throw e;
      }
    }
    throw last;
  }

  async readDoc(key: string): Promise<Doc | null> {
    assertKey(key);
    for (const access of this.order()) {
      try {
        const res = await get(PREFIX + key, { access, token: this.token, useCache: false });
        if (!res || res.statusCode !== 200) continue;
        this.access = access;
        return { text: await new Response(res.stream).text(), etag: res.blob.etag };
      } catch {
        // Not found, or wrong access level for this store: try the next.
      }
    }
    return null;
  }

  async writeDoc(key: string, text: string, etag: string | null) {
    assertKey(key);
    try {
      await this.withAccess((access) =>
        put(PREFIX + key, text, {
          access,
          token: this.token,
          contentType: "application/json; charset=utf-8",
          addRandomSuffix: false,
          cacheControlMaxAge: 60,
          ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
        }),
      );
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError) throw new ConflictError(key);
      if (!etag && /already exists/i.test(e instanceof Error ? e.message : "")) throw new ConflictError(key);
      throw e;
    }
  }

  async putBinary(key: string, bytes: Buffer, contentType: string) {
    assertKey(key);
    const res = await this.withAccess((access) =>
      put(PREFIX + key, bytes, {
        access,
        token: this.token,
        contentType,
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      }),
    );
    // Public stores hand out a CDN URL; private ones are streamed by our route.
    return { url: this.access === "public" ? res.url : `/api/media/${key}` };
  }

  async readBinary(key: string): Promise<StoredBinary | null> {
    assertKey(key);
    for (const access of this.order()) {
      try {
        const res = await get(PREFIX + key, { access, token: this.token });
        if (!res || res.statusCode !== 200) continue;
        this.access = access;
        return { body: res.stream, contentType: res.blob.contentType, size: res.blob.size };
      } catch {
        // try next access level
      }
    }
    return null;
  }

  async remove(key: string) {
    assertKey(key);
    try {
      await del(PREFIX + key, { token: this.token });
    } catch {
      // Already gone is not worth surfacing.
    }
  }

  async list(prefix: string) {
    assertKey(prefix);
    const keys: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: PREFIX + prefix, cursor, limit: 1000, token: this.token });
      for (const b of page.blobs) keys.push(b.pathname.slice(PREFIX.length));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return keys;
  }
}

/* ── Selection ────────────────────────────────────────────────────────── */

export function contentTypeFor(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  return (
    { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif", json: "application/json" }[
      ext ?? ""
    ] ?? "application/octet-stream"
  );
}

let instance: StoreDriver | null = null;

export function driver(): StoreDriver {
  if (!instance) instance = process.env.BLOB_READ_WRITE_TOKEN ? new BlobDriver() : new FileSystemDriver();
  return instance;
}

export const contentHash = sha;
