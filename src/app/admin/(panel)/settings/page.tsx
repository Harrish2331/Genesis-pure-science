import { PageTitle } from "@/components/admin/AdminShell";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { readSettings } from "@/lib/content/repo";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  await requireAdminPage("settings");
  const { settings } = await readSettings();
  return (
    <>
      <PageTitle title="Settings" description="Company information, contact details, website copy and media." />
      <SettingsEditor key={settings.updatedAt} initial={settings} />
    </>
  );
}
