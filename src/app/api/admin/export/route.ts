import { guardAdmin } from "@/lib/auth/api";
import { listEnquiries } from "@/lib/content/enquiries";
import { COLLECTIONS, readCollection, readSettings } from "@/lib/content/repo";

/** GET /api/admin/export — a JSON backup of all content and enquiries. */
export async function GET(req: Request) {
  const denied = await guardAdmin(req, "export");
  if (denied) return denied;

  const collections = Object.fromEntries(
    await Promise.all(COLLECTIONS.map(async (c) => [c, (await readCollection(c)).items] as const)),
  );
  const backup = {
    exportedAt: new Date().toISOString(),
    settings: (await readSettings()).settings,
    ...collections,
    enquiries: (await listEnquiries(10_000)).items,
  };
  const stamp = backup.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="genesis-content-backup-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
