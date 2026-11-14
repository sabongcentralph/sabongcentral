import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getLang } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: "Philippine gamefowl community: gamefarms, derby schedules, supplies and education. Information only: no bets, no payments.",
  robots: { index: false, follow: false }, // test site: keep out of search engines until launch
  // Home screen app on iPhone: opens full screen with the dark status bar.
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black" },
};

export const viewport: Viewport = { themeColor: "#121215", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang === "tl" ? "tl" : "en"}>
      <body>
        {children}
      </body>
    </html>
  );
}
