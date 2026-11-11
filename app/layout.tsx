import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getLang } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Gamefarm and derby directory for the Philippines. Information only.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang === "tl" ? "tl" : "en"}>
      <body>{children}</body>
    </html>
  );
}
