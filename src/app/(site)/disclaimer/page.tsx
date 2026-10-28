import { LegalPage } from "@/components/sections/LegalPage";
import { disclaimer } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: disclaimer.title,
  description: disclaimer.description,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return <LegalPage doc={disclaimer} />;
}
