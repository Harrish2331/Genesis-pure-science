import { authConfig, login, logout } from "@/lib/auth/session";
import { BodyError, json, readJson } from "@/lib/auth/api";

/**
 * POST /api/admin/session  { email, password }  — sign in
 * DELETE /api/admin/session                     — sign out
 *
 * The response never says which of email or password was wrong.
 */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (!origin || !host || new URL(origin).host !== host) return json({ error: "Cross-site request refused." }, 403);
  } catch {
    return json({ error: "Cross-site request refused." }, 403);
  }

  if (!authConfig().ok) {
    return json({ error: "The admin login is not configured on this server. See docs/ADMIN-GUIDE.md." }, 503);
  }

  let body: unknown;
  try {
    body = await readJson(req, 4000);
  } catch (e) {
    return json({ error: e instanceof BodyError ? e.message : "Bad request." }, e instanceof BodyError ? e.status : 400);
  }
  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password || password.length > 500) {
    return json({ error: "Enter your email address and password." }, 400);
  }

  const result = await login(email, password);
  if (result.ok) return json({ ok: true });
  if (result.reason === "locked") {
    return json(
      { error: `Too many attempts. Try again in ${Math.ceil((result.retryAfter ?? 900) / 60)} minutes.` },
      429,
      { "Retry-After": String(result.retryAfter ?? 900) },
    );
  }
  return json({ error: "Incorrect email address or password." }, 401);
}

export async function DELETE(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) return json({ error: "Cross-site request refused." }, 403);
  await logout();
  return json({ ok: true });
}
