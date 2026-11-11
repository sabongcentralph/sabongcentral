import { notFound } from "next/navigation";
import { getLang, t } from "@/lib/i18n";
import { derbyEnabled } from "@/lib/health";
import { ComingSoon } from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

// Hidden (404) until DERBY_ENABLED is "true", after the lawyer approves.
export default async function DerbiesPage() {
  if (!derbyEnabled()) notFound();
  const lang = await getLang();
  return <ComingSoon lang={lang} title={t("navDerbies", lang)} body={t("trustInfoOnly", lang)} />;
}
