import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

// Home screen app (Em, 2026-11-13): "Add to Home Screen" opens Sabong Sentral
// full screen with its own icon. Icons are Em's logo emblem, in public/icons.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "The Philippine Gamefowl Community: gamefarms, derby schedules, seminars and farm guides. Information only.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#040303",
    theme_color: "#121215",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
