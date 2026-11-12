import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "sabongcentral",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-11",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      // Database for farms, organizers, derbies, users, reports: the D1 database
      // "sabongcentral-db". Bound by its id so deploys match the dashboard
      // settings (a name-only binding makes `cf deploy` stop with a conflict).
      DB: bindings.d1({ id: "3a9f50a6-70e3-436c-968c-8a28edfa0e1f" }),
      // Photos: R2 bucket "sabongcentral-photos". Only /media/p/... paths are
      // stored in D1; photos are shrunk in the browser to ~300 KB first.
      PHOTOS: bindings.r2({ name: "sabongcentral-photos" }),
      // Derby listings: ON (Em, 2026-11-11). Each derby still needs verified permits.
      // Set to "false" to hide every derby listing at once.
      DERBY_ENABLED: bindings.text("true"),
      // Sample farms, events and items. Off since the soft launch (Em, 2026-11-12):
      // only real listings show. "true" brings the samples back.
      SAMPLE_DATA: bindings.text("false"),
      // ADMIN_SETUP_CODE: a secret Em adds in the Cloudflare dashboard (Settings ->
      // Variables and Secrets, type Secret). It unlocks /admin/setup to set the
      // Super Admin password. Not declared here so deploys never require it.
    },
  }),
});
