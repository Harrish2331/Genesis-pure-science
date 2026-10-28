import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth/session";
import { listEnquiries } from "@/lib/content/enquiries";

export const dynamic = "force-dynamic";

/**
 * Every dashboard page renders inside this layout, which verifies the
 * session on the server. Each page and every /api/admin route verifies it
 * again — a layout alone is not treated as a security boundary.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  let fresh = 0;
  if (admin.role === "admin") {
    try {
      fresh = (await listEnquiries(200)).items.filter((e) => e.status === "new").length;
    } catch {
      fresh = 0;
    }
  }
  return (
    <AdminShell email={admin.email} role={admin.role} newEnquiries={fresh}>
      {children}
    </AdminShell>
  );
}
