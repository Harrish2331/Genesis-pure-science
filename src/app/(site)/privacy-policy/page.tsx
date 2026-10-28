import { LegalPage } from "@/components/sections/LegalPage";
import { privacyPolicy } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: privacyPolicy.title,
  description: privacyPolicy.description,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalPage doc={privacyPolicy} />;
}
