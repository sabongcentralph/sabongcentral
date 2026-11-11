# Sabong Central

A trusted directory of gamefarms and derby schedules in the Philippines.
Information only: the site never takes bets or handles payments.

## Stack

- Next.js App Router + TypeScript, run on Cloudflare Workers through
  [vinext](https://github.com/cloudflare/vinext) (Cloudflare's recommended
  path for new Next.js apps as of late 2026).
- Cloudflare D1 (`DB` binding) for data. R2 (`PHOTOS` binding) for photos is
  added in Phase 2; R2 must first be enabled in the Cloudflare dashboard.
- Tailwind CSS.

Bindings live in `cloudflare.config.ts`. Read them in server code with
`import { env } from "cloudflare:workers"`.

## Feature flags

- `DERBY_ENABLED` (in `cloudflare.config.ts`): keep `"false"` until the lawyer
  approves derby listings.

## Labels

Every label is in `lib/i18n.ts` in Tagalog and English. Tagalog is the
default; the header button switches language.

## Scripts

- `npm run dev` starts the local dev server (D1 is emulated locally).
- `npm run build` builds the Worker.
- `npm run start` previews the built Worker locally.
- `npm run typecheck` generates binding types and runs TypeScript.
- `npm run deploy` deploys to Cloudflare. The D1 database is created on
  first deploy.

`/api/health` reports whether the database and photo storage respond.
