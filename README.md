# Family Photoshoot AI

Local prototype of a web app that turns a family's reference photos into cohesive, gallery-quality AI portraits. Next.js 15 + SQLite + Google Nano Banana Pro + Replicate FLUX.

## Quick start

```bash
npm install
cp .env.example .env
# Paste your REPLICATE_API_TOKEN into .env
npm run db:push       # create the SQLite tables
npm run samples       # generate landing + theme sample images via Nano Banana Pro
npm run dev
```

Open http://localhost:3000 (or whichever port Next.js picks).

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
3. **Create** — four variations appear as they're developed. Favorite any, refine any.
4. **Refine** — tell your art director what to change ("more smiling", "swap the navy jacket for a camel one"). Each edit keeps identity anchored to the original references.
5. **Keep** — download a zipped album, or export any frame as an 8×10 or 16×20 print-ready file.

## Reset

```bash
rm -f storage.sqlite
rm -rf storage
npm run db:push
```

The storage folder and SQLite file are gitignored.

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run start` — production
- `npm run db:push` — apply Drizzle schema to SQLite
- `npm run db:studio` — browse the DB in Drizzle Studio
- `npm run samples` — (re)generate landing sample images (passes `--force` if you add it) via Nano Banana Pro. Swap in real photography whenever you have it.

## Tests

A one-shot smoke test exists at `scripts/smoke-test.mjs`. It clears local data, seeds a 4-subject roster, kicks off a mock generation, refines one image, and exports the album — proving the plumbing end-to-end without any API credits.

```bash
npx tsx scripts/smoke-test.mjs
```

## Notes

- Photos are stored locally under `./storage/uploads/<personId>/`. EXIF is stripped on upload. Max 20 MB per file.
- Refinement is always stateless: the original reference photos are re-passed on every turn so identity and color don't drift across multi-turn edits.
- All copy avoids SaaS / AI jargon — no "generate", "render", "prompt", "parameters". The product speaks in terms of "shoots", "vibes", "refine", "keep".
