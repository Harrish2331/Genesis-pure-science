import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { RateLimiter, clientKey } from "@/lib/rate-limit";
import { can, type Area, type Role } from "./roles";
import { mintToken, safeEqual, verifyPassword, verifyToken } from "./token";

/**
 * Administrator authentication.
 *
 * One administrator account and an optional editor account, configured
 * entirely in server-side environment variables — nothing about them ever
 * reaches the browser bundle:
 *
 *   ADMIN_EMAIL            the administrator's login email
 *   ADMIN_PASSWORD_HASH    scrypt hash from `npm run admin:hash -- "password"`
 *   ADMIN_SESSION_SECRET   32+ random characters; signs the session cookie.
 *                          Changing it signs every session out.
 *   EDITOR_EMAIL           optional: an editor limited to Notices & Insights
 *   EDITOR_PASSWORD_HASH   optional: the editor's scrypt hash
 *
 * The role is not stored in the cookie: it is worked out from the email on
 * every request, so removing EDITOR_EMAIL revokes the editor at once.
 *
 * The session is an HMAC-signed, http-only, SameSite=Strict cookie that
 * expires after eight hours. Every admin page and every admin API route
 * re-verifies it on the server; the proxy only provides an early redirect.
 */

export const SESSION_COOKIE = "gpl_admin";
const TTL_SECONDS = 60 * 60 * 8;

const loginLimiter = new RateLimiter(8, 15 * 60 * 1000);

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : undefined;
};

export type AuthConfig = { ok: true } | { ok: false; missing: string[] };

export function authConfig(): AuthConfig {
  const missing: string[] = [];
  if (!process.env.ADMIN_EMAIL) missing.push("ADMIN_EMAIL");
  if (!process.env.ADMIN_PASSWORD_HASH) missing.push("ADMIN_PASSWORD_HASH");
  if (!secret()) missing.push("ADMIN_SESSION_SECRET (32+ characters)");
  return missing.length ? { ok: false, missing } : { ok: true };
}

const norm = (v: string) => v.trim().toLowerCase();

function editorAccount(): { email: string; hash: string } | null {
  const email = process.env.EDITOR_EMAIL;
  const hash = process.env.EDITOR_PASSWORD_HASH;
  return email && hash ? { email: norm(email), hash } : null;
}

/** Which account an email belongs to, if any. The administrator wins a tie. */
function roleFor(email: string): Role | null {
  if (safeEqual(email, norm(process.env.ADMIN_EMAIL!))) return "admin";
  const editor = editorAccount();
  if (editor && safeEqual(email, editor.email)) return "editor";
  return null;
}

export type LoginResult = { ok: true } | { ok: false; reason: "invalid" | "locked" | "unconfigured"; retryAfter?: number };

export async function login(email: string, password: string): Promise<LoginResult> {
  const cfg = authConfig();
  if (!cfg.ok) return { ok: false, reason: "unconfigured" };

  const key = clientKey(await headers());
  const state = loginLimiter.blocked(key);
  if (state.blocked) return { ok: false, reason: "locked", retryAfter: state.retryAfter };

  // Always run every configured (slow) password check so a wrong email and a
  // wrong password take the same time.
  const who = norm(email);
  const editor = editorAccount();
  const adminPw = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!);
  const editorPw = editor ? verifyPassword(password, editor.hash) : false;
  const adminOk = adminPw && safeEqual(who, norm(process.env.ADMIN_EMAIL!));
  const editorOk = Boolean(editor) && editorPw && safeEqual(who, editor!.email);

  if (!adminOk && !editorOk) {
    const r = loginLimiter.take(key);
    return r.ok ? { ok: false, reason: "invalid" } : { ok: false, reason: "locked", retryAfter: r.retryAfter };
  }

  loginLimiter.reset(key);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, mintToken(adminOk ? norm(process.env.ADMIN_EMAIL!) : editor!.email, secret()!, TTL_SECONDS), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type DashboardUser = { email: string; role: Role };

export async function currentAdmin(): Promise<DashboardUser | null> {
  if (!authConfig().ok) return null;
  const claims = verifyToken((await cookies()).get(SESSION_COOKIE)?.value, secret());
  if (!claims) return null;
  // A token minted for an account that is no longer configured is not valid.
  const role = roleFor(claims.email);
  return role ? { email: claims.email, role } : null;
}

/**
 * For dashboard pages: redirect to the login screen when not signed in, and
 * back to the dashboard when the signed-in role may not open `area`.
 */
export async function requireAdminPage(area?: Area): Promise<DashboardUser> {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  if (area && !can(user.role, area)) redirect("/admin?denied=1");
  return user;
}
