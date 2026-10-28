/**
 * Password hashing and signed session tokens (node:crypto only).
 *
 * Pure apart from node:crypto, so unit tests import it directly. The cookie
 * and request handling live in session.ts.
 *
 * Token format:  v1.<emailB64url>.<expiresMs>.<nonce>.<hmac>
 * The HMAC covers everything before it, keyed with ADMIN_SESSION_SECRET.
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 64;

/** "scrypt:<saltHex>:<keyHex>" */
export function hashPassword(password: string, saltHex?: string): string {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : randomBytes(16);
  const key = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, keyHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  let derived: Buffer;
  try {
    derived = scryptSync(password, Buffer.from(saltHex, "hex"), SCRYPT_KEYLEN, { N: SCRYPT_N });
  } catch {
    return false;
  }
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === derived.length && timingSafeEqual(derived, expected);
}

/** Constant-time string equality that tolerates different lengths. */
export function safeEqual(a: string, b: string): boolean {
  const ah = createHmac("sha256", "genesis-cmp").update(a).digest();
  const bh = createHmac("sha256", "genesis-cmp").update(b).digest();
  return timingSafeEqual(ah, bh);
}

function mac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function mintToken(email: string, secret: string, ttlSeconds: number, now = Date.now()): string {
  const payload = [
    "v1",
    Buffer.from(email, "utf8").toString("base64url"),
    String(now + ttlSeconds * 1000),
    randomBytes(12).toString("base64url"),
  ].join(".");
  return `${payload}.${mac(payload, secret)}`;
}

export type TokenClaims = { email: string; expires: number };

export function verifyToken(token: string | undefined, secret: string | undefined, now = Date.now()): TokenClaims | null {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v1") return null;
  const payload = parts.slice(0, 4).join(".");
  if (!safeEqual(parts[4], mac(payload, secret))) return null;
  const expires = Number(parts[2]);
  if (!Number.isFinite(expires) || now >= expires) return null;
  let email: string;
  try {
    email = Buffer.from(parts[1], "base64url").toString("utf8");
  } catch {
    return null;
  }
  return { email, expires };
}
