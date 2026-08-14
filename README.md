# Family Photoshoot AI

Local prototype of a web app that turns a family's reference photos into cohesive, gallery-quality AI portraits. Next.js 16 + Postgres/Drizzle + Google Nano Banana Pro + Replicate.

## Quick start

```bash
npm install
cp .env.example .env
# Paste your DATABASE_URL and REPLICATE_API_TOKEN into .env
npm run db:push       # apply the Drizzle schema to Postgres
npm run samples       # generate landing + theme sample images via Nano Banana Pro
npm run dev
```

Open http://localhost:3010.

## Rolino Blog delivery

FamilyShoot keeps its existing local articles and can also read published articles from Rolino.
Configure these server-only values locally and in Vercel:

- `ROLINO_URL=https://getrolino.com`
- `ROLINO_BLOG_SITE_ID`
- `ROLINO_BLOG_DELIVERY_TOKEN`
- `ROLINO_BLOG_WEBHOOK_SECRET`

Get the site ID, delivery token, and webhook secret from the FamilyShoot site connection in
Rolino Blog Settings. Set its production revalidation endpoint to
`https://familyshoot.com/api/rolino/revalidate`. Do not expose any of these values with a
`NEXT_PUBLIC_` prefix.

Without these values, FamilyShoot continues to serve its local Blog content. With them, `/blog`,
`/blog/[slug]`, and `sitemap.xml` also include published Rolino articles. Signed publication events
refresh the affected cache tags through `/api/rolino/revalidate` without a new deployment.

### Trying it with no API key

Set `NEXT_PUBLIC_MOCK_MODE=1` in `.env`. The app produces warm placeholder cards
instead of real generations so you can walk the full flow — roster, theme,
generate, refine, album, export — without spending a cent.

### One token for everything

The prototype uses **Replicate** for every model, so a single
`REPLICATE_API_TOKEN` unlocks the whole app. Grab one at
https://replicate.com/account/api-tokens.

| Operation                                                                                                               | Model                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Photoreal family generation                                                                                             | [`google/nano-banana-pro`](https://replicate.com/google/nano-banana-pro) (Gemini 3 Pro Image Preview) |
| Stylized themes (Pixar, Manga, Superhero, Ghibli, Simpson, Lego, Watercolor, Renaissance Oil, Saturday-morning Cartoon) | `google/nano-banana-pro`                                                                              |
| Holiday / occasion cards with text                                                                                      | `google/nano-banana-pro`                                                                              |
| Refinement ("more smiling", jacket swap)                                                                                | `google/nano-banana-pro`                                                                              |
| Print-ready upscaling (8×10, 16×20)                                                                                     | `philz1337x/clarity-upscaler` → falls back to `nightmareai/real-esrgan`                               |

## Flow

1. **Roster** — upload a few reference photos of each family member (adults, kids, pets). Drag a photo, drop it onto the person's card.
2. **Vibe** — pick a theme. Photographic (Golden Hour Beach, Autumn Cabin…), stylized (Pixar, Manga, Superhero), or an occasion card (Christmas, Easter, Birthday).
3. **Create** — four starting images appear as they're developed. Favorite any, refine any.
4. **Refine** — tell your art director what to change ("more smiling", "swap the navy jacket for a camel one"). Each edit keeps identity anchored to the original references.
5. **Keep** — download a zipped album, or export any frame as an 8×10 or 16×20 print-ready file.

## Retention and account cleanup

- Generated photos and reference uploads are stored for 14 days on one-time packs. Pro-funded shoots stay available for 90 days.
- The landing FAQ also explains the planned inactive-account policy: accounts with no shoots left may be deleted after 30 days of inactivity, following a reminder email.
- Manual deletes should be honored sooner wherever the product exposes them.

## Database

```bash
npm run db:push
```

`drizzle.config.ts` uses `DIRECT_URL` first, then `DATABASE_URL`. Use the direct database URL for schema changes when your production runtime uses a pooled connection.

For the Pro subscription launch, apply [db/migrations/0006_subscriptions.sql](./db/migrations/0006_subscriptions.sql) to the target database before enabling Stripe webhooks.

## Stripe Setup

Use Stripe test mode first.

```bash
npm run stripe:setup
npm run stripe:setup -- --create --portal --webhook
npx stripe listen --forward-to localhost:3010/api/stripe/webhook
npm run vercel:env:subscriptions
npm run vercel:env:subscriptions -- --create
npm run subscriptions:readiness
npm run subscriptions:verify-flow -- --email=test@example.com
```

The first command verifies configured Stripe Price IDs. The second creates the missing FamilyShoot Pro monthly Price, an optional Customer Portal configuration, and the Stripe webhook endpoint, then prints the env vars to set locally and in Vercel.

For local testing, copy the `whsec_...` value printed by `stripe listen` into
`STRIPE_WEBHOOK_SECRET`, restart `npm run dev`, and make sure Stripe CLI is
forwarding to `/api/stripe/webhook`, not `/api/auth/stripe/webhook`.

Required subscription env vars:

- `STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY`
- `STRIPE_WEBHOOK_SECRET`
- Optional: `STRIPE_WEBHOOK_ENDPOINT_URL`
- Optional: `STRIPE_PORTAL_CONFIGURATION_ID`

The webhook endpoint subscribes to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `invoice.payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.refunded`

`npm run vercel:env:subscriptions -- --create` syncs the subscription Stripe env vars into Vercel when `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are available. It targets `production,preview` by default; add `--targets=production,preview,development` if you also want development env vars.

After a real Stripe test-mode checkout or cancellation, `npm run subscriptions:verify-flow -- --email=<test-user-email>` checks the app database, Stripe subscription state, and recent Stripe event evidence for that user. Add `--expect-cancellation` after testing cancel/delete flows.

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run start` — production
- `npm run db:push` — apply Drizzle schema to Postgres
- `npm run db:apply-subscriptions` — apply only the Pro subscription migration SQL
- `npm run db:studio` — browse the DB in Drizzle Studio
- `npm run stripe:setup` — verify or create Stripe subscription prices and portal configuration
- `npm run vercel:env:subscriptions` — verify or create Vercel subscription env vars
- `npm run subscriptions:readiness` — verify local env, Stripe resources, webhook events, DB table, and Vercel sync credentials
- `npm run subscriptions:verify-flow` — verify a real test user’s subscription checkout/webhook evidence
- `npm run samples` — (re)generate landing sample images (passes `--force` if you add it) via Nano Banana Pro. Swap in real photography whenever you have it.

## R2 cleanup

`npm run storage:orphans` checks R2 for image objects under `generations/` that are no longer referenced by `familyphotoai.images`. It is a dry run by default.

Useful variants:

```bash
npm run storage:orphans -- --json
npm run storage:orphans -- --prefix=generations/<generationId>/
npm run storage:orphans -- --delete
```

## Tests

A one-shot smoke test exists at `scripts/smoke-test.mjs`. It clears local data, seeds a 4-subject roster, kicks off a mock generation, refines one image, and exports the album — proving the plumbing end-to-end without any API credits.

```bash
npx tsx scripts/smoke-test.mjs
```

## Notes

- Photos are stored locally under `./storage/uploads/<personId>/`. EXIF is stripped on upload. Max 20 MB per file.
- Refinement is always stateless: the original reference photos are re-passed on every turn so identity and color don't drift across multi-turn edits.
- All copy avoids SaaS / AI jargon — no "generate", "render", "prompt", "parameters". The product speaks in terms of "shoots", "vibes", "refine", "keep".
