import { cookies } from "next/headers";
import { getLang } from "@/lib/i18n";
import { AgeGate } from "@/components/AgeGate";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabs } from "@/components/BottomTabs";
import { SiteFooter } from "@/components/SiteFooter";
import { SideNav } from "@/components/SideNav";
import { Reveal } from "@/components/Reveal";

// Public site chrome: header, side menu, footer, bottom tabs. The admin panel has its own.
export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  const age = (await cookies()).get("sc_21")?.value;
  return (
    <div className="flex min-h-screen flex-col">
      {age !== "1" && <AgeGate under={age === "no"} />}
      <div className="bg-crimson px-4 py-1.5 text-center text-[12px] font-semibold text-white">
        BETA · Sabong Central is new. Listings are being added every day.
      </div>
      <AppHeader lang={lang} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <aside className="sticky top-[66px] hidden self-start h-[calc(100dvh-66px)] w-[250px] flex-none overflow-y-auto border-r border-line py-6 pl-3 pr-2 lg:block">
          <SideNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
      <SiteFooter lang={lang} />
      <BottomTabs lang={lang} />
      <Reveal />
    </div>
  );
}
