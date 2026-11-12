import type { Metadata, Viewport } from "next";
import { SITE_NAME } from "@/lib/site";
import { getLang } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabs } from "@/components/BottomTabs";
import { SiteFooter } from "@/components/SiteFooter";
import { SideNav } from "@/components/SideNav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: "Philippine gamefowl community: gamefarms, derby schedules, supplies and education. Information only: no bets, no payments.",
  robots: { index: false, follow: false }, // test site: keep out of search engines until launch
};

export const viewport: Viewport = { themeColor: "#6B0F1A", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang === "tl" ? "tl" : "en"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <div className="bg-[#2f2a1f] px-4 py-1.5 text-center text-[12px] font-semibold text-gold-light">
            TEST SITE · sample data only, not live yet
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
        </div>
      </body>
    </html>
  );
}
