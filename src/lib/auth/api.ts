import "server-only";
import { can } from "./roles";
import { currentAdmin } from "./session";

/**
 * Guard for every /api/admin route handler.
 *
 *   1. State-changing requests must come from this site's own pages: the
 *      Origin header has to match the Host. Combined with the SameSite=Strict
 *      session cookie this closes cross-site request forgery.
 *   2. The caller must hold a valid dashboard session.
 *   3. When `area` is given, the caller's role must be allowed into it.
 *
 * Returns a Response to send back when the request is refused, or null.
 */
export async function guardAdmin(req: Request, area?: string): Promise<Response | null> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    let sameOrigin = false;
    try {
      sameOrigin = Boolean(origin && host && new URL(origin).host === host);
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) return json({ error: "Cross-site request refused." }, 403);
  }
  const user = await currentAdmin();
  if (!user) return json({ error: "Your session has expired. Please sign in again." }, 401);
  if (area && !can(user.role, area)) return json({ error: "Your account does not have access to this area." }, 403);
  return null;
}

export function json(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...(extra ?? {}) },
  });
}

/** Parse a JSON body, refusing oversized or non-JSON payloads. */
export async function readJson(req: Request, maxBytes = 200_000): Promise<unknown> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new BodyError("Expected a JSON request body.", 415);
  const text = await req.text();
  if (text.length > maxBytes) throw new BodyError("Request body is too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new BodyError("Malformed JSON.", 400);
  }
}

export class BodyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
