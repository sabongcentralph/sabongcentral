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

Every label is in `lib/i18n.ts` in simple Taglish (default, `tl`) and
English. The TL / EN switch in the header changes language.

## Look

Warm ivory, deep red and touches of gold. Colors and fonts (Fraunces for
headings, Inter for text) are theme tokens in `app/globals.css`, along with
the small animations, which turn off for visitors who prefer reduced motion.

## Farms

The `farms` table is created on first request (`lib/farms.ts`). Only
`status = 'approved'` farms are public. Six sample farms in Batangas are
seeded and marked "Sample" on the site; remove them with
`delete from farms where is_sample = 1;`.

## Scripts

- `npm run dev` starts the local dev server (D1 is emulated locally).
- `npm run build` builds the Worker.
- `npm run start` previews the built Worker locally.
- `npm run typecheck` generates binding types and runs TypeScript.
- `npm run deploy` deploys to Cloudflare. The D1 database is created on
  first deploy.

Pages: `/` home, `/farms` directory with filters, `/farms/<slug>` profile,
`/videos` and `/sumali` (coming soon), `/derbies` (404 until enabled).

`/api/health` reports whether the database and photo storage respond.
