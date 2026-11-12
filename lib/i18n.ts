import { cookies } from "next/headers";

// "tl" is the default: simple Taglish, the way most visitors talk.
export type Lang = "tl" | "en";
export const LANG_COOKIE = "lang";

// Every label on the site lives here, in Taglish and English.
const dict = {
  // header and footer
  tagline: { tl: "Philippine Gamefowl Community", en: "Philippine Gamefowl Community" },
  portal: { tl: "Portal", en: "Portal" },
  navFarms: { tl: "Farms", en: "Farms" },
  navDerbies: { tl: "Derby Schedule", en: "Derby Schedule" },
  navVideos: { tl: "Videos", en: "Videos" },
  navHow: { tl: "Paano Gumagana", en: "How It Works" },
  login: { tl: "Login", en: "Log in" },
  listFarm: { tl: "I-list ang Farm", en: "List your farm" },
  mainMenu: { tl: "Main menu", en: "Main menu" },
  footerAbout: {
    tl: "A free community information platform. Not a gambling or e-sabong platform: no bets, and no payments pass through us.",
    en: "A free community information platform. Not a gambling or e-sabong platform: no bets, and no payments pass through us.",
  },
  aboutUs: { tl: "About us", en: "About us" },
  reportListing: { tl: "Report a listing", en: "Report a listing" },
  policies: { tl: "Policies", en: "Policies" },
  contactUs: { tl: "Contact us", en: "Contact us" },

  // home
  eyebrow: { tl: "Gamefarm Directory ng Pilipinas", en: "The Philippine Gamefarm Directory" },
  heroTitle: { tl: "Hanapin ang verified gamefarms malapit sa'yo.", en: "Find verified gamefarms near you." },
  heroBody: {
    tl: "Lahat ng farms dito ay checked ng admin bago i-post. Bloodlines, photos, at contact info, nasa isang lugar na.",
    en: "Every farm here is checked by an admin before it goes up. Bloodlines, photos and contact info, all in one place.",
  },
  searchFarms: { tl: "Search farms", en: "Search farms" },
  searchLabel: { tl: "Farm name o bloodline", en: "Farm name or bloodline" },
  searchPlaceholder: { tl: "e.g. Sweater, Kelso, Roundhead", en: "e.g. Sweater, Kelso, Roundhead" },
  region: { tl: "Region", en: "Region" },
  province: { tl: "Province", en: "Province" },
  city: { tl: "City / Town", en: "City / Town" },
  all: { tl: "All", en: "All" },
  search: { tl: "Search", en: "Search" },
  trustApproved: { tl: "Bawat listing ay admin-approved", en: "Every listing is admin-approved" },
  trustInfoOnly: { tl: "Info lang: walang taya, walang bayad", en: "Information only: no bets, no payments" },
  browseByLocation: { tl: "Browse by location", en: "Browse by location" },
  featuredFarms: { tl: "Featured farms", en: "Featured farms" },
  featuredSub: { tl: "Verified farms sa Batangas", en: "Verified farms in Batangas" },
  viewAllFarms: { tl: "View all farms", en: "View all farms" },
  howTitle: { tl: "Paano ito gumagana", en: "How it works" },
  how1Title: { tl: "Gumawa ng account", en: "Create an account" },
  how1Body: { tl: "Sign up gamit ang email o Google. Libre para sa farms at organizers.", en: "Sign up with email or Google. Free for farms and organizers." },
  how2Title: { tl: "I-add ang farm details", en: "Add your farm details" },
  how2Body: { tl: "Location, bloodlines, photos, at contact info mo.", en: "Location, bloodlines, photos and how to reach you." },
  how3Title: { tl: "Hintayin ang approval", en: "Wait for approval" },
  how3Body: { tl: "Iche-check ng admin ang listing mo bago i-publish.", en: "An admin checks your listing before it goes public." },
  ctaTitle: { tl: "May gamefarm ka?", en: "Own a gamefarm?" },
  ctaBody: {
    tl: "Ipakita ang farm mo sa breeders at sabungeros sa buong probinsya. Libre mag-list.",
    en: "Show your farm to breeders and enthusiasts across the province. Listing is free.",
  },
  ctaButton: { tl: "I-list ang farm mo", en: "List your farm" },

  // farm cards and directory
  farmPhoto: { tl: "Farm photo", en: "Farm photo" },
  verified: { tl: "Verified", en: "Verified" },
  sample: { tl: "Sample", en: "Sample" },
  directoryTitle: { tl: "Gamefarms sa Batangas", en: "Gamefarms in Batangas" },
  directorySub: { tl: "Lahat ng farms dito ay admin-approved.", en: "Every farm here is admin-approved." },
  filters: { tl: "Filters", en: "Filters" },
  reset: { tl: "Reset", en: "Reset" },
  farmName: { tl: "Farm name", en: "Farm name" },
  bloodline: { tl: "Bloodline", en: "Bloodline" },
  applyFilters: { tl: "I-apply", en: "Apply" },
  farmsFound: { tl: "farms found", en: "farms found" },
  noFarms: { tl: "No farms match. Try different filters.", en: "No farms match. Try different filters." },

  // farm profile
  adminVerified: { tl: "Admin verified", en: "Admin verified" },
  aboutFarm: { tl: "About the farm", en: "About the farm" },
  bloodlines: { tl: "Bloodlines", en: "Bloodlines" },
  contactFarm: { tl: "Contact the farm", en: "Contact the farm" },
  owner: { tl: "Owner", en: "Owner" },
  call: { tl: "Call", en: "Call" },
  messageFb: { tl: "Message sa Facebook", en: "Message on Facebook" },
  directoryOnly: {
    tl: "Directory lang ang Sabong Central. Direct kayong mag-usap ng farm.",
    en: "Sabong Central is a directory only. Talk to the farm directly.",
  },
  locationMap: { tl: "Location map", en: "Location map" },
  memberSince: { tl: "Member since", en: "Member since" },
  reportThis: { tl: "I-report ang listing", en: "Report this listing" },
  otherFarms: { tl: "More farms in Batangas", en: "Other farms in Batangas" },
  sampleNotice: {
    tl: "This is a sample listing to show how the site looks. It is not a real farm.",
    en: "This is a sample listing to show how the site looks. It is not a real farm.",
  },

  // coming soon pages
  soonTitle: { tl: "Malapit na", en: "Coming soon" },
  videosTitle: { tl: "Matuto sa short videos", en: "Learn from short videos" },
  videosBody: {
    tl: "Quick tips sa pag-aalaga, feeding, at health ng gamefowl, mula sa breeders at vets. Educational lang: walang laban o betting content.",
    en: "Quick tips on gamefowl care, feeding and health, from breeders and vets. Educational only: no fight or betting content.",
  },
  joinTitle: { tl: "I-list ang farm mo", en: "List your farm" },
  joinBody: {
    tl: "Ginagawa pa namin ang sign up para sa farms. Babalik kami dito kapag ready na.",
    en: "Farm sign-up is still being built. Check back soon.",
  },
  backHome: { tl: "Balik sa Home", en: "Back to Home" },
} as const;

export type LabelKey = keyof typeof dict;

// English first (Em, 2026-11-11). The Taglish labels stay in this file for a
// later TL/EN switch; until then every visitor gets English.
export async function getLang(): Promise<Lang> {
  await cookies();
  return "en";
}

export function t(key: LabelKey, lang: Lang): string {
  return dict[key][lang];
}
