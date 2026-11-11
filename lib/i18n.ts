import { cookies } from "next/headers";

export type Lang = "tl" | "en";
export const LANG_COOKIE = "lang";

// Every label on the site lives here, in Tagalog and English.
const dict = {
  tagline: {
    tl: "Ang mapagkakatiwalaang listahan ng mga gamefarm at derby sa Pilipinas.",
    en: "The trusted directory of gamefarms and derbies in the Philippines.",
  },
  comingSoon: { tl: "Malapit nang buksan", en: "Coming soon" },
  intro: {
    tl: "Hanapin ang mga gamefarm at iskedyul ng derby ayon sa lokasyon. Ang mga farm at organizer ang mag-aayos ng sarili nilang listahan.",
    en: "Find gamefarms and derby schedules by location. Farms and organizers manage their own listings.",
  },
  infoOnlyTitle: { tl: "Impormasyon lamang", en: "Information only" },
  infoOnlyBody: {
    tl: "Hindi kami tumatanggap ng taya o bayad. Lahat ng listahan ay sinusuri muna ng admin bago ilabas.",
    en: "We never take bets or handle payments. Every listing is reviewed by an admin before it goes public.",
  },
  farms: { tl: "Mga Gamefarm", en: "Gamefarms" },
  derbies: { tl: "Mga Derby", en: "Derbies" },
  soon: { tl: "Malapit na", en: "Soon" },
  hidden: { tl: "Nakatago muna", en: "Hidden for now" },
  systemCheck: { tl: "Pagsusuri ng sistema", en: "System check" },
  database: { tl: "Database (D1)", en: "Database (D1)" },
  photoStorage: { tl: "Imbakan ng larawan (R2)", en: "Photo storage (R2)" },
  ok: { tl: "Gumagana", en: "Working" },
  failed: { tl: "May problema", en: "Not working" },
  switchLang: { tl: "English", en: "Tagalog" },
} as const;

export type LabelKey = keyof typeof dict;

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "en" ? "en" : "tl";
}

export function t(key: LabelKey, lang: Lang): string {
  return dict[key][lang];
}
