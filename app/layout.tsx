import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getLang } from "@/lib/i18n";
import { derbyEnabled } from "@/lib/health";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Gamefarm directory for the Philippines. Information only: no bets, no payments.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang === "tl" ? "tl" : "en"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader lang={lang} derbies={derbyEnabled()} />
          {children}
          <SiteFooter lang={lang} />
        </div>
      </body>
    </html>
  );
}
