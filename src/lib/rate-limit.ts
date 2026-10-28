/**
 * Fixed-window rate limiter held in process memory.
 *
 * Honest about its scope: on a serverless host each instance has its own
 * memory, so this slows down a single client hammering one instance (online
 * password guessing, form flooding) rather than acting as a distributed
 * limiter. Pair with Vercel's firewall rules for anything stronger.
 */

type Window = { count: number; resetAt: number };

export class RateLimiter {
  private readonly hits = new Map<string, Window>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Record one attempt. Returns whether it is allowed. */
  take(key: string, now = Date.now()): { ok: boolean; retryAfter: number } {
    this.sweep(now);
    const w = this.hits.get(key);
    if (!w || now >= w.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true, retryAfter: 0 };
    }
    w.count += 1;
    const ok = w.count <= this.limit;
    return { ok, retryAfter: ok ? 0 : Math.ceil((w.resetAt - now) / 1000) };
  }

  /** Whether the key is currently over the limit, without recording. */
  blocked(key: string, now = Date.now()): { blocked: boolean; retryAfter: number } {
    const w = this.hits.get(key);
    if (!w || now >= w.resetAt) return { blocked: false, retryAfter: 0 };
    const blocked = w.count >= this.limit;
    return { blocked, retryAfter: blocked ? Math.ceil((w.resetAt - now) / 1000) : 0 };
  }

  reset(key: string) {
    this.hits.delete(key);
  }

  private sweep(now: number) {
    if (this.hits.size < 5000) return;
    for (const [k, w] of this.hits) if (now >= w.resetAt) this.hits.delete(k);
  }
}

/** Best-effort client address from proxy headers. */
export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
