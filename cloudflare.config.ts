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
      // Database for farms, organizers, derbies, users, reports.
      // Created automatically in the Cloudflare account on first deploy.
      DB: bindings.d1({ name: "sabongcentral-db" }),
      // Farm photos and derby posters. Photos never go in the database.
      PHOTOS: bindings.r2({ name: "sabongcentral-photos" }),
      // Derby section stays hidden until the lawyer approves it.
      DERBY_ENABLED: bindings.text("false"),
    },
  }),
});
