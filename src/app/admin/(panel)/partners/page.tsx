import { PageTitle } from "@/components/admin/AdminShell";
import { PartnersManager } from "@/components/admin/PartnersManager";
import { requireAdminPage } from "@/lib/auth/session";
import { readCollection } from "@/lib/content/repo";

export const metadata = { title: "Partners" };

export default async function PartnersAdmin() {
  await requireAdminPage("partners");
  const partners = (await readCollection("partners")).items.sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <PageTitle
        title="Manufacturing partners"
        description="Shown on the Manufacturing page and the homepage, in this order. Add logos, descriptions and websites only once Genesis has verified them."
      />
      <PartnersManager partners={partners} />
    </>
  );
}
