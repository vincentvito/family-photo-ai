# Family Photoshoot AI Launch Plan

Working checklist for getting the app customer-ready on Vercel.

## Tomorrow's Launch Order (must-haves)

Realistic order for a same-day shippable cut. Anything not in this list is post-launch.

1. **Smoke-test generation locally** with current Replicate token before touching anything (Phase 0).
2. **Cap roster UI to one photo per person** (cheap UX simplification, no schema change).
3. **Migrate storage to R2** — uploads, locations, generations (Phase 4).
4. **Migrate DB SQLite → Postgres on Supabase** (Phase 2). Required before Vercel — local SQLite cannot ship.
5. **Replace fire-and-forget generation with client-driven Replicate polling** so it survives serverless function exit (Phase 5).
6. **Gate `/studio/*` and server actions behind auth** (Phase 3 — already mostly done).
7. **Stripe MVP**: one product, one price, checkout + webhook, decrement credits on `startGeneration()`. Skip multi-tier (Phase 6).
8. **Deploy to Vercel + smoke test prod** (Phase 7 + 8).

Cut from day-one: refinement/upscale gating, full QA matrix, multi-tier pricing, polished post-checkout pages, image export hardening.

## Phase 0: Smoke Test Before Migrating

Establish that the current pipeline works locally before changing storage or DB. If generation is broken today, every later phase is debugging blind.

- [ ] Confirm `REPLICATE_API_TOKEN` is set and valid
- [ ] Add one person + one reference photo via `/studio/roster`
- [ ] Pick a canned theme, run generation, confirm 4 variants land in `storage/generations/<id>/`
- [ ] Confirm one refine pass works
- [ ] Note any provider error messages to fix later

## Current Baseline

- [x] Upgrade app to Next.js 16
- [x] Restore working lint command with ESLint CLI
- [x] Run `npm run lint` cleanly
- [x] Run `npm run build` successfully
- [x] Clean up landing page step visuals
- [x] Fix mobile landing header with hamburger menu
- [x] Split oversized `ThemeSection` out of `ThemeBoard`
- [x] Replace full page reloads with `router.refresh()` where touched

## Phase 1: Better Auth Foundation

- [x] Confirm Supabase project connection string
- [x] Install Better Auth packages
- [x] Add Better Auth server config
- [x] Add Better Auth Drizzle adapter
- [x] Add `/api/auth/[...all]` route handler
- [x] Add Better Auth client helper
- [x] Configure email OTP plugin
- [x] Add Zoho/ZeptoMail sender for OTP emails
- [x] Generate Better Auth schema
- [x] Apply Better Auth tables to Supabase
- [ ] Review Better Auth Stripe plugin fit for payments
- [x] Add login page/modal flow
- [x] Add logout control
- [ ] Gate `/studio/*` routes behind auth

## Phase 2: App Data Model And Supabase Postgres

R2 handles files; Supabase Postgres handles rows. Drop SQLite entirely.

- [ ] Convert app Drizzle schema from SQLite (`drizzle-orm/better-sqlite3`) to Postgres (`drizzle-orm/postgres-js` or `node-postgres`)
- [ ] Update `src/lib/db.ts` to open a Postgres pool against `DATABASE_URL`
- [ ] Add `userId` ownership columns on `people`, `generations` (and any other user-scoped tables)
- [ ] Add `credit_ledger` table for Stripe purchases + generation debits
- [ ] Update `drizzle.config.ts` for Postgres
- [ ] Generate and apply app migrations against Supabase
- [ ] Remove `better-sqlite3` from runtime deps (keep dev-only if still used for scripts)
- [ ] Delete `storage.sqlite*` from repo root and `.gitignore` it

## Phase 3: Authorization Boundaries

- [ ] Add `getCurrentUser()` or equivalent auth helper
- [ ] Scope `listRoster()` to current user
- [ ] Scope person/photo mutations to current user
- [ ] Scope generation/refinement state to current user
- [ ] Scope album/favorite/export actions to current user
- [ ] Protect upload routes
- [ ] Protect image serving routes
- [ ] Protect upscale/export routes

## Phase 4: Storage (Cloudflare R2)

Using R2 to match the rest of this customer's apps. S3-compatible, no egress fees.

- [ ] Provision R2 bucket (`family-photo-ai-prod`) and access key
- [ ] Decide: public bucket + custom domain (recommended, unguessable nanoid keys) vs private bucket + signed URLs
- [ ] Add `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (if signed-URL path)
- [ ] Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` env vars
- [ ] Refactor `src/lib/storage.ts` to write/read against R2 instead of `process.cwd()/storage`
  - [ ] `saveReferencePhoto()` → `PutObject` to `uploads/<personId>/<key>.jpg`
  - [ ] `saveLocationReference()` → `PutObject` to `locations/<key>.jpg`
  - [ ] `saveGeneratedImage()` → `PutObject` to `generations/<generationId>/<key>.jpg`
  - [ ] `imageToBase64()` / `toDataUrl()` → fetch from R2 (or skip and pass signed URL straight to Replicate)
  - [ ] Replace `getThumbnail()` local cache with on-the-fly resize via Next/Image or drop it
- [ ] Update `nanobanana.ts` to either pass R2 URLs to Replicate directly or fetch+inline (R2 URL is faster/cheaper)
- [ ] When Replicate returns generated image URLs, fetch and `PutObject` straight to R2 (skip local buffer dance)
- [ ] Update `/api/images/[id]` route to redirect to public R2 URL or stream signed URL
- [ ] Drop `storage/` directory and `.gitignore` entries

## Phase 5: Image Generation

### Roster simplification (cheap, do first)

- [ ] Cap `AddPersonDialog` / `PersonCard` to one reference photo per person (Nano Banana Pro is good enough with one)
- [ ] Hide the "add another photo" affordance; keep the schema (`photos` table) as-is for future
- [ ] Update copy on `/studio/roster` to "one clear photo per person"

### Background work on Vercel — Replicate polling (decided)

`startGeneration()` currently kicks off `runGeneration()` without awaiting (`src/actions/generate.ts:78`). On Vercel the function exits as soon as the action returns and the Replicate calls get killed. **Decided approach: client-driven Replicate polling.** Tackle this tomorrow as part of the generation work.

- [ ] Refactor `startGeneration()` to use Replicate's async predictions API: insert the `generations` row, create 4 predictions on Replicate, store the prediction IDs, return immediately
- [ ] Add `replicatePredictionId` (or a related table) so we can poll status per variant
- [ ] Add `GET /api/generations/<id>/status` route that fetches each prediction from Replicate; for any that finished, fetch the image and `PutObject` to R2, then insert the `images` row
- [ ] Update `/studio/generate/[id]` page to poll the status route until all 4 variants resolve (or error)
- [ ] Remove the fire-and-forget `runGeneration(...).catch(...)` call

### Pipeline correctness after migration

- [ ] Add environment validation for provider keys (fail fast on missing `REPLICATE_API_TOKEN`)
- [ ] Keep mock mode available for demos/dev
- [ ] Surface provider errors back to the UI (currently only logged)
- [ ] Confirm generation works end-to-end with R2-hosted references
- [ ] Confirm refine works with R2-hosted generated images
- [ ] Confirm upscale works after storage migration (or defer upscale to post-launch)

## Phase 6: Payments (Stripe MVP)

Single product, single price, credits model. Multi-tier and subscription can land post-launch.

- [ ] Decide MVP unit: one credit = one generation (4 variants), priced as a small pack (e.g. 5 credits / 20 credits)
- [ ] Stripe dashboard: create product + prices in test mode, then live mode
- [ ] Install `stripe` + `@stripe/stripe-js`
- [ ] Add `credits` column on the user (or a `credit_ledger` table if we want history — ledger is cleaner, do it now)
- [ ] `POST /api/stripe/checkout` — server action / route that creates a Checkout Session for the signed-in user
- [ ] `POST /api/stripe/webhook` — verify signature, on `checkout.session.completed` add credits to the buyer
- [ ] Gate `startGeneration()`: decrement credit on success; refund credit on provider error
- [ ] Pricing CTA on landing → checkout (signed-in) or sign-in then checkout (signed-out)
- [ ] Minimal `/checkout/success` and `/checkout/cancel` (can be plain text for day one)
- [ ] Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env vars

## Phase 7: Vercel Deploy

- [ ] Add Vercel env var checklist
- [ ] Configure production `DATABASE_URL`
- [ ] Configure Better Auth secret/base URL
- [ ] Configure Zoho SMTP env vars
- [ ] Configure Stripe env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- [ ] Configure R2 env vars (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`)
- [ ] Configure Replicate token
- [ ] Set `maxDuration` on generation route segment if going with Phase 5 Option A
- [ ] Deploy preview to Vercel
- [ ] Run production smoke test
- [ ] Fix deployment/runtime issues

## Phase 8: Customer QA

- [ ] Test mobile landing page
- [ ] Test desktop landing page
- [ ] Test OTP sign-in
- [ ] Test upload roster photos
- [ ] Test custom vibe with location photo
- [ ] Test generation
- [ ] Test refinement
- [ ] Test favorites/album
- [ ] Test export/download
- [ ] Test payment flow in Stripe test mode
- [ ] Final customer handoff notes
