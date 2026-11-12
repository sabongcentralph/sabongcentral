import type { Metadata, Viewport } from "next";
import { SITE_NAME } from "@/lib/site";
import { getLang } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: "Philippine gamefowl community: gamefarms, derby schedules, supplies and education. Information only: no bets, no payments.",
  robots: { index: false, follow: false }, // test site: keep out of search engines until launch
};

export const viewport: Viewport = { themeColor: "#121215", width: "device-width", initialScale: 1 };

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
        {children}
      </body>
    </html>
  );
}
