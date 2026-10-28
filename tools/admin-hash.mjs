#!/usr/bin/env node
/**
 * Generate the values the admin login needs.
 *
 *   npm run admin:hash -- "a long passphrase"
 *
 * Prints ADMIN_PASSWORD_HASH (scrypt, same parameters as src/lib/auth/token.ts)
 * and a fresh ADMIN_SESSION_SECRET. Paste both into the server environment
 * (Vercel → Project → Settings → Environment Variables), never into code.
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run admin:hash -- "a passphrase of at least 12 characters"');
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64, { N: 16384 });
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
