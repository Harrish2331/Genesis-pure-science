import { PageTitle } from "@/components/admin/AdminShell";
import { EnquiryInbox } from "@/components/admin/EnquiryInbox";
import { requireAdminPage } from "@/lib/auth/session";
import { listEnquiries } from "@/lib/content/enquiries";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesAdmin() {
  await requireAdminPage("enquiries");
  const { items, total } = await listEnquiries(300);
  return (
    <>
      <PageTitle title="Enquiries" description="Messages sent through the website's contact form." />
      <EnquiryInbox items={items} total={total} />
    </>
  );
}
