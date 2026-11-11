import { getLang, t } from "@/lib/i18n";
import { ComingSoon } from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

// Farm sign-up lands here once login is built.
export default async function JoinPage() {
  const lang = await getLang();
  return <ComingSoon lang={lang} title={t("joinTitle", lang)} body={t("joinBody", lang)} />;
}
