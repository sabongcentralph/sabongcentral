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

- `DERBY_ENABLED` (in `cloudflare.config.ts`): `"true"` (derby listings ON,
  each needs verified permits). Set `"false"` to hide every derby at once.

## Content and approvals

Everything public is a row in the `listings` table (`lib/db.ts`): farms,
events, goods, reels, articles, community notices and suppliers. Only
`status = 'approved'` rows are public. Tables are created on first request.

- Sample content (`lib/sample.ts`) is seeded with `is_sample = 1` and shown
  with a "Sample" tag. Remove it with `delete from listings where is_sample = 1;`.
- `/portal` takes test submissions (no login yet) which land as `pending`.
- `/admin` is the admin: approval queue, approve / approve + Business Verified /
  reject (reason required) / hide / restore, reports, contact messages, and an
  activity log of every action. Super Admin: sabongcentralph@gmail.com. The
  first password's hash is in `lib/auth.ts`; change it in Admin → Account.
- Reels embed Facebook, YouTube or TikTok links only (`lib/embed.ts`).
- Locations: full PSA PSGC list (2025-2Q), 82 provinces + Metro Manila and all
  1,633 cities/municipalities, in `lib/psgc.json`.

## Labels

Navigation labels are in `lib/i18n.ts` (Taglish default, English via the
TL / EN switch). Page content is in simple Taglish.

## Look

Bold bright red (#D62828), black (#121215) and white, with a touch of gold
(#C8A44D). No maroon. Colors and fonts (Fraunces for headings, Inter for text)
are theme tokens in `app/globals.css`, along with the motion (hero slashes,
red tab sweep, card lift, button shine, fade-up on scroll via
`components/Reveal.tsx`), all of which turn off for reduced motion.
Phone-first: five bottom tabs on phones, top navigation on desktop.

## End-to-end test

`npm run test:e2e` walks through the whole site on a local copy: public pages and links,
public forms, admin review, admin-created member accounts, listings with photos, edits,
Business Verified documents, reports and account safety (66 checks, phone and desktop).
It only uses the local test database (`.cloudflare/state`), never the live site.
Needs Playwright once: `npm i -g playwright && npx playwright install chromium`.
