import { siteSearch } from "@/lib/search";
import { MAX_QUERY_LENGTH } from "@/lib/search-core";
import { RateLimiter, clientKey } from "@/lib/rate-limit";

/** GET /api/search?q= — published content only. */

const limiter = new RateLimiter(120, 60 * 1000);

export async function GET(req: Request) {
  if (!limiter.take(clientKey(req.headers)).ok) {
    return Response.json({ error: "Too many searches. Please wait a moment." }, { status: 429 });
  }
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH).trim();
  if (q.length < 2) return Response.json({ query: q, results: [] });

  const results = await siteSearch(q, 12);
  return Response.json(
    { query: q, results: results.map((r) => ({ id: r.id, type: r.type, title: r.title, url: r.url, label: r.label, snippet: r.snippet, date: r.date })) },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" } },
  );
}
