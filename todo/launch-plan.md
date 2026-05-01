# Family Photoshoot AI Launch Plan

Working checklist for getting the app customer-ready on Vercel.

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

## Phase 2: App Data Model And Supabase

- [ ] Confirm Supabase storage bucket names
- [ ] Convert app Drizzle schema from SQLite to Postgres
- [ ] Add user ownership columns referencing Better Auth users
- [ ] Add payment/entitlement tables only if Better Auth Stripe plugin does not cover the MVP needs
- [ ] Update Drizzle config for Supabase Postgres
- [ ] Generate and apply app migrations
- [ ] Remove production dependency on `better-sqlite3`

## Phase 3: Authorization Boundaries

- [ ] Add `getCurrentUser()` or equivalent auth helper
- [ ] Scope `listRoster()` to current user
- [ ] Scope person/photo mutations to current user
- [ ] Scope generation/refinement state to current user
- [ ] Scope album/favorite/export actions to current user
- [ ] Protect upload routes
- [ ] Protect image serving routes
- [ ] Protect upscale/export routes

## Phase 4: Storage

- [ ] Add Supabase Storage client
- [ ] Move reference uploads from local disk to Supabase Storage
- [ ] Move location references to Supabase Storage
- [ ] Move generated images to Supabase Storage
- [ ] Move thumbnail/upscale cache strategy off local disk
- [ ] Update image API routes to stream from storage
- [ ] Remove Vercel local filesystem tracing warning

## Phase 5: Image Generation

- [ ] Confirm Replicate token and model access
- [ ] Add environment validation for provider keys
- [ ] Keep mock mode available for demos/dev
- [ ] Add clearer provider error messages
- [ ] Confirm generation works with Supabase-hosted reference images
- [ ] Confirm refine works with Supabase-hosted generated images
- [ ] Confirm upscale works after storage migration

## Phase 6: Payments

- [ ] Choose payment model for MVP
- [ ] Install Stripe package
- [ ] Add checkout route/action
- [ ] Add Stripe webhook route
- [ ] Store purchases/credits/entitlements in database
- [ ] Gate `startGeneration()` behind active entitlement or credits
- [ ] Add pricing CTA wired to checkout
- [ ] Add post-checkout success/cancel pages or states

## Phase 7: Vercel Deploy

- [ ] Add Vercel env var checklist
- [ ] Configure production `DATABASE_URL`
- [ ] Configure Better Auth secret/base URL
- [ ] Configure Zoho SMTP env vars
- [ ] Configure Stripe env vars
- [ ] Configure Supabase Storage env vars
- [ ] Configure Replicate token
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
