/**
 * Publication state of a notice or article. Pure, so unit tests import it.
 *
 *   draft      not published
 *   scheduled  published with a future date — goes live by itself then
 *   live       published and visible to visitors
 */
export type PublishState = "draft" | "scheduled" | "live";

export function publishState(status: string, publishedAt: string, now: number = Date.now()): PublishState {
  if (status !== "published") return "draft";
  const t = new Date(publishedAt).getTime();
  return Number.isFinite(t) && t > now ? "scheduled" : "live";
}

export const PUBLISH_LABELS: Record<PublishState, string> = { draft: "Draft", scheduled: "Scheduled", live: "Published" };
