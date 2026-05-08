# FamilyShoot Pro Subscription Handoff

Status note updated: 2026-05-08

## Product Goal

Add a monthly FamilyShoot Pro subscription for photographers, creators, and repeat users, while keeping the existing one-time packs for normal family buyers.

This file is intended as a handoff checklist for the next agent/developer.

## Final Requirements To Build

- FamilyShoot Pro monthly plan: $39/month.
- The monthly plan must be visible on the public landing page pricing section.
- The monthly plan must appear alongside the existing pricing options, not hidden only inside the logged-in studio.
- Keep existing one-time packs: Single Keepsake, Three-pack, and Eight-pack.
- Pro includes 25 shoots per billing month. Each shoot creates 4 downloadable starting images.
- Pro includes 8 regenerations per shoot.
- Pro includes commercial usage rights copy.
- Pro includes 90-day image storage.
- Pro users can continue using saved family/client profiles through the existing roster/profile system unless product later asks for a separate client-management feature.
- Pro includes premium Pro style presets, if/when those presets are defined.
- Pro keeps print-ready downloads.
- Account/billing area must show subscription status, current available shoots, monthly included shoots, renewal/end date, and a clear link to manage the subscription in Stripe.
- Users must be able to manage or cancel their subscription through the Stripe Customer Portal.

## Explicitly Not Applicable

- No watermark entitlement: the app does not currently add watermarks, so there is no watermark-removal work to do.
- No priority generation queue: the app does not currently have queue priority infrastructure, so this should not block the subscription launch.
- Annual plan: optional future work only. Do not implement unless Vlad/product explicitly approves it.

## Clarification: Extra Credits

Discounted Pro-only extra-credit packs are intentionally not part of launch. They complicate pricing, code paths, Stripe setup, and launch testing while Pro already includes 25 monthly shoots.

Launch behavior:

- Pro subscribers receive 25 shoots per billing month.
- If a Pro subscriber wants more before renewal, they can buy the normal one-time packs.
- Normal one-time packs keep their own per-shoot regeneration caps.

## Implemented So Far

- [x] Added `FamilyShoot Pro` plan constants with $39/month, 25 monthly shoots, and Pro tier metadata in `src/lib/pricing-packs.ts`.
- [x] Added Pro regeneration cap of 8 per shoot.
- [x] Added Pro plan to landing pricing beside existing one-time packs.
- [x] Extended checkout button/component flow to support either a one-time pack or a subscription plan.
- [x] Added Stripe Checkout subscription session creation for FamilyShoot Pro.
- [x] Added Stripe metadata to Checkout and subscription creation.
- [x] Added Stripe webhook handling for subscription lifecycle events.
- [x] Added monthly Pro credit grant handling from Stripe checkout/invoice events.
- [x] Added `subscriptions` database table to Drizzle schema.
- [x] Added `db/migrations/0006_subscriptions.sql`.
- [x] Added subscription lookup helpers in `src/lib/billing-queries.ts`.
- [x] Added `/studio/account` billing page with Pro status, current shoots, monthly included shoots, renewal/end date, Pro benefits, and one-time pack link.
- [x] Added Stripe Customer Portal API route at `/api/stripe/portal`.
- [x] Added `ManageBillingButton` for opening the Stripe Customer Portal.
- [x] Added `Billing` link to the account menu.
- [x] Documented `STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY` in `.env.example`.
- [x] Added `npm run stripe:setup` to create/verify the Pro Stripe Prices and optional Customer Portal configuration.
- [x] Documented optional `STRIPE_PORTAL_CONFIGURATION_ID` in `.env.example` and wired it into `/api/stripe/portal`.
- [x] Updated `README.md` to reflect the current Next 16/Postgres stack, Pro retention, migration, and Stripe setup workflow.
- [x] Extended `npm run stripe:setup -- --create --portal --webhook` to create the required Stripe webhook endpoint and print `STRIPE_WEBHOOK_SECRET`.
- [x] Added `npm run db:apply-subscriptions` to apply `db/migrations/0006_subscriptions.sql` directly to the configured Postgres database.
- [x] Added `npm run vercel:env:subscriptions` to verify/create subscription Stripe env vars in Vercel when `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are available.
- [x] Added `npm run subscriptions:readiness` to verify local env, Stripe resources, webhook events, DB table, and Vercel sync credentials.
- [x] Added `npm run subscriptions:verify-flow` to verify a real test user's subscription DB rows, Stripe state, and recent webhook event evidence after owner-led checkout/cancel tests.
- [x] Added current billing-period usage to `/studio/account`.
- [x] Added account-page UX for `past_due`, `unpaid`, and `incomplete` subscription states.
- [x] Implemented 90-day retention for Pro-funded shoots, while keeping 14-day retention for one-time packs.
- [x] Kept active Pro roster/profile uploads out of the 14-day cleanup path.
- [x] Removed unavailable watermark and premium-preset entitlement copy from Pro surfaces.
- [x] Defined premium Pro card style presets and gated them to active Pro subscribers in UI and generation validation.
- [x] Verified `npm run build` passes.
- [x] Verified `npm run lint` passes, with one pre-existing warning in `src/lib/db.ts`.
- [x] Updated the Control Center task with implementation notes and moved it to `doing`.

## Still To Finish

- [x] Create the Stripe Product and monthly recurring Price for FamilyShoot Pro at $39/month.
- [x] Set `STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY` in the local environment.
- [ ] Set `STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY` in Vercel environments.
- [x] Remove discounted Pro extra-credit packs from launch scope.
- [x] Add a repo-native setup command for Stripe Products, Prices, and Customer Portal configuration: `npm run stripe:setup -- --create --portal`.
- [x] Add a repo-native setup command for the Stripe webhook endpoint: `npm run stripe:setup -- --create --webhook`.
- [x] Add a repo-native command for applying the subscription migration: `npm run db:apply-subscriptions`.
- [x] Add a repo-native command for Vercel env var propagation: `npm run vercel:env:subscriptions -- --create`.
- [x] Add a repo-native readiness verifier: `npm run subscriptions:readiness`.
- [x] Add a repo-native verifier for owner-led Stripe checkout/cancel flow evidence: `npm run subscriptions:verify-flow -- --email=<test-user-email>`.
- [x] Run/apply `db/migrations/0006_subscriptions.sql` in the target database.
- [x] Configure Stripe Customer Portal settings so users can manage/cancel their subscription.
- [ ] Confirm `/studio/account` opens the Stripe portal successfully for subscribed users.
- [x] Verify webhook idempotency for subscription credit grants in code: subscription checkout grants conflict on Checkout Session ID; renewal grants conflict on Stripe invoice ID.
- [x] Add production handling/UX for failed invoices, unpaid subscriptions, and payment recovery states.
- [x] Confirm how to display shoots used within the current billing period. Current implementation shows shoots used during the Stripe subscription period.
- [x] Decide whether discounted Pro extra-credit packs are part of launch. Removed from launch scope; Pro users can buy normal packs if needed.
- [x] Define premium Pro style presets before enforcing or showing them as a distinct feature.
- [x] Implement 90-day Pro storage behavior, or document that all users currently share the same storage policy if launch should not wait.

## Entitlement Status

- [x] Monthly allowance: implemented as 25-credit grants on subscription checkout and renewal.
- [x] Regeneration count: implemented through the Pro pack tier mapping to 8 regenerations.
- [x] Stripe subscription management link: API route and button are implemented; still needs Stripe portal configuration/testing.
- [x] 90-day Pro storage: Pro-funded shoots retain generated storage for 90 days; one-time packs retain 14 days.
- [ ] Commercial usage rights: copy appears in Pro surfaces; legal/product copy should be reviewed.
- [x] Premium Pro style presets: implemented as Pro-only card art presets.
- [x] Discounted Pro extra-credit packs: removed from launch scope to keep pricing and testing simpler.
- [x] Current billing-period usage view: implemented on `/studio/account`.

## Verification Notes

- `npm run build` passed after implementation.
- `npm run lint` passed with one existing warning: unused `receiver` parameter in `src/lib/db.ts`.
- 2026-05-07 follow-up verification: `npm run lint` passed with the same existing `src/lib/db.ts` warning.
- 2026-05-07 follow-up verification: `npm run build` passed after restoring Linux optional native packages with `npm install`.
- 2026-05-07 follow-up verification: `npm run stripe:setup` ran in verify-only mode and reported missing Stripe Price env vars, as expected in this local environment.
- 2026-05-07 follow-up verification after Pro style preset implementation: `npm run lint` passed with the same existing `src/lib/db.ts` warning, and `npm run build` passed.
- 2026-05-07 follow-up verification: `npm run db:apply-subscriptions` applied `db/migrations/0006_subscriptions.sql` to the configured Postgres database.
- 2026-05-07 follow-up verification: `npm run stripe:setup -- --create --portal --webhook` created/verified the FamilyShoot Pro monthly Price and Stripe Customer Portal configuration in Stripe test mode. Pro extra-credit Prices were later removed from launch scope.
- 2026-05-07 follow-up verification: `STRIPE_WEBHOOK_ENDPOINT_URL=https://familyshoot.com/api/stripe/webhook npm run stripe:setup -- --create --webhook` verified the existing Stripe webhook endpoint and updated it to include all required subscription/credit events.
- 2026-05-07 final local verification: `npm run lint` passed with the same existing `src/lib/db.ts` warning, and `npm run build` passed.
- 2026-05-07 follow-up verification: `npm run vercel:env:subscriptions` fails fast with missing `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`, confirming Vercel env propagation is blocked by credentials rather than code.
- 2026-05-07 final verification after Vercel helper: `npm run lint` passed with the same existing `src/lib/db.ts` warning, and `npm run build` passed.
- 2026-05-07 readiness verification: `STRIPE_WEBHOOK_ENDPOINT_URL=https://familyshoot.com/api/stripe/webhook npm run subscriptions:readiness` passed local env, Stripe Price, Customer Portal, webhook-event, and Postgres subscription-table checks; it failed only on missing `VERCEL_TOKEN` / `VERCEL_PROJECT_ID`.
- 2026-05-07 final verification after readiness helper: `npm run lint` passed with the same existing `src/lib/db.ts` warning, and `npm run build` passed.
- 2026-05-07 follow-up verification: `npm run subscriptions:verify-flow -- --help` passed, documenting how to verify owner-led test checkout/cancel evidence for a specific user.
- 2026-05-07 final verification after flow verifier: `npm run lint` passed with the same existing `src/lib/db.ts` warning, and `npm run build` passed.
- Local visual smoke test was attempted after starting `next dev` with approval. The app served `/`, but `expect-cli` browser automation failed: the headless agent timed out and direct open failed to start its daemon.

## Vlad / Owner Verification Required

These checks require access to the real Stripe account, configured webhook endpoint, deployed environment variables, or live/test Stripe dashboard actions. The agent should not mark these as completed unless Vlad/owner confirms them.

### Must-Run Launch Tests

- [ ] Readiness: run `STRIPE_WEBHOOK_ENDPOINT_URL=https://familyshoot.com/api/stripe/webhook npm run subscriptions:readiness`. Expected: Stripe Price, portal, webhook events, and Postgres subscription table pass. Vercel env sync may fail locally if `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` are not set.
- [x] Local webhook forwarding: run `npx stripe listen --forward-to localhost:3010/api/stripe/webhook`, copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`, and restart `npm run dev`. Expected: webhook responses are `200`, not `404`.
- [ ] Vercel env: confirm production and preview have `STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY`, `STRIPE_WEBHOOK_SECRET`, and optionally `STRIPE_PORTAL_CONFIGURATION_ID`. Use `npm run vercel:env:subscriptions` or verify directly in Vercel.
- [x] New Pro checkout: sign in as a fresh test user, click `Subscribe monthly`, complete Stripe test-mode checkout, and return to `/studio/account`. Expected: status is active, available shoots increased by 25, monthly shoots shows 25, renewal date appears.
- [ ] Initial webhook evidence: run `npm run subscriptions:verify-flow -- --email=<test-user-email>`. Expected: DB subscription row exists, DB Pro credit grants show at least 25 credits, Stripe subscription exists, and recent Stripe checkout/invoice/subscription events are seen.
- [x] Pro entitlement: with an active Pro user, confirm Pro-only card style presets are selectable and a new shoot created from a subscription credit gets the Pro tier behavior: 8 total regenerations and 90-day album/generation retention copy.
- [x] Non-Pro gate: with a user that has only a normal pack and no subscription, confirm Pro-only card style presets are disabled in the UI and server generation rejects a Pro-only style if attempted.
- [x] Normal pack purchase while subscribed: with an active Pro user, buy `Single keepsake`, `Three-pack`, or `Eight-pack` from the normal pricing section. Expected: Stripe one-time checkout succeeds and the account shoot balance increases by the normal pack amount; no Pro-only discounted pack appears anywhere.
- [x] Out-of-credits subscriber path: exhaust or manually reduce a Pro test user's available shoots to zero, then buy a normal one-time pack and start a shoot. Expected: the app allows normal pack purchase and the new shoot uses the normal pack tier cap, not a removed Pro-extra-credit code path.
- [ ] Renewal grant: in Stripe test mode, advance the subscription billing cycle or trigger a renewal invoice. Expected: `invoice.payment_succeeded` grants another 25 Pro credits once; replaying the event does not duplicate credits.
- [ ] Payment failure / recovery: simulate a failed subscription payment. Expected: `/studio/account` shows payment attention for `past_due`, `unpaid`, or `incomplete`, and the Stripe portal lets the user update payment method.
- [x] Customer Portal: from `/studio/account`, open `Manage billing`. Expected: Stripe Customer Portal opens, shows invoice/payment method management, and lets the user cancel at period end.
- [x] Cancel at period end: cancel through the portal. Expected: `/studio/account` shows the subscription ending date after webhook delivery, existing remaining shoots are still available, and `npm run subscriptions:verify-flow -- --email=<test-user-email> --expect-cancellation` passes.
- [x] Subscription deleted/canceled: after the period ends or after forcing a deletion in Stripe test mode, confirm the DB subscription row updates to canceled/deleted state and Pro-only style access is removed.
- [x] Legacy one-time pack regression: as a non-subscriber, buy a normal one-time pack and create/refine/download a shoot. Expected: existing pack checkout, credit grant, generation, album, image download, and ZIP export still work.

## Production Blockers

- Vlad/product approval is required before final Stripe pricing goes live.
- Stripe monthly Price ID must be configured in Vercel.
- Stripe Customer Portal configuration ID should be configured in Vercel if the app should use the created portal configuration instead of Stripe's default.
- Stripe webhook signing secret must match the existing `https://familyshoot.com/api/stripe/webhook` endpoint and be configured in Vercel.
- Subscription checkout, renewal, cancellation, and billing portal flows need owner-led test-mode verification.
