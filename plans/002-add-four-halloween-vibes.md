# Plan 002: Add four distinct Halloween portrait vibes

> **Executor instructions**: Start only after Plan 001 is merged. Follow this plan step by step. Run every verification command and confirm the expected result before you move to the next step. If a STOP condition occurs, stop and report. Do not improvise. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a5b8960..HEAD -- src/components/landing/Gallery.tsx src/components/landing/TrendingAnnouncementBar.tsx src/data/vibes.ts src/lib/theme-variations.ts src/lib/themes.ts tests/prompts.test.ts public/samples`
>
> Plan 001 is expected to change these paths. First confirm that Plan 001 is DONE and that its integration pull request is in `main`. Then inspect the live catalog structure. Stop if the four IDs or slugs in this plan already exist, or if the prompt-spec contract has changed.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-consolidate-open-vibe-prs.md`
- **Category**: direction
- **Planned at**: commit `a5b8960`, 2026-09-04

## Why this matters

The request calls for four clear Halloween looks with different customer uses. The current catalog has one general Halloween greeting card. The open pull requests add cute pumpkin and early-Halloween options, but none supplies the requested 1995 direct-flash look, formal haunted manor, action documentary scene, or mid-century costume studio. Four separate shoot vibes keep those concepts distinct and let customers combine them in one four-shot session.

## Current state

- `src/lib/themes.ts:1858-1876` defines `card-halloween`. It is a 2:3 greeting-card theme with pumpkin light, fog, coordinated costumes, and optional card text.
- `src/lib/theme-variations.ts:520-524` gives that card four porch and doorway layouts.
- `src/data/cards.ts:151-160` exposes the existing Halloween card page.
- After Plan 001, the catalog will also contain adjacent seasonal themes such as `cozy-summerween-card`, `summerween-pumpkin-glow`, `tiny-boo-crew`, and `vintage-pumpkin-patch-postcard`. Do not rename or copy them.
- `src/lib/themes.ts:5-30` requires theme specs to stay roster-neutral. Do not put family size, people counts, named roles, selected pets, or supplied card text into a theme spec.
- `src/lib/theme-variations.ts` uses exactly four distinct slot prompts for each custom theme.
- `tests/prompts.test.ts:14-20` requires sample cover files to exist and stay at or below 400 KB.
- The normal shoot flow automatically shows themes with category `photoreal` or `stylized`. Card themes belong to a separate output mode.

## Target catalog contract

| ID                       | Display name           | Category    | Ratio | Art direction                                                                                                                                            |
| ------------------------ | ---------------------- | ----------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `halloween-night-95`     | Halloween Night ’95    | `photoreal` | `3:2` | 1990s consumer 35mm color film, hard on-camera flash, blue-hour suburb, porch lights, homemade generic costumes, plastic pumpkin buckets                 |
| `haunted-family-manor`   | Haunted Family Manor   | `photoreal` | `2:3` | Formal gothic portrait, candle-like practical light, ancestral-style paintings, carved wood, deep burgundy and black, elegant and frame-ready            |
| `trick-or-treat-chaos`   | Trick-or-Treat Chaos   | `photoreal` | `3:2` | Blue-hour documentary action, children running, candy spill, masks slipping, adults following, safe sidewalk setting                                     |
| `vintage-costume-studio` | Vintage Costume Studio | `stylized`  | `2:3` | Original 1920s–1950s Halloween greeting-card studio aesthetic, paper moon, flat black arched-back silhouette cutouts, painted backdrop, light print wear |

All four themes use provider `nanobanana`, set `supportsPets: true`, and do not set `acceptsCardText`. The user asked for vibes, not editable greeting cards.

Discovery slugs:

- `halloween-night-95-family-photos`
- `haunted-family-manor-family-photos`
- `trick-or-treat-chaos-family-photos`
- `vintage-costume-studio-family-photos`

Cover files:

- `public/samples/theme-halloween-night-95.webp`
- `public/samples/theme-haunted-family-manor.webp`
- `public/samples/theme-trick-or-treat-chaos.webp`
- `public/samples/theme-vintage-costume-studio.webp`

## Commands you will need

| Purpose       | Command                                                                                                                                                                                                    | Expected on success                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Tests         | `npm test`                                                                                                                                                                                                 | exit 0; all tests pass                                  |
| Lint          | `npm run lint`                                                                                                                                                                                             | exit 0                                                  |
| Scoped format | `npx prettier --check src/components/landing/Gallery.tsx src/components/landing/TrendingAnnouncementBar.tsx src/data/vibes.ts src/lib/theme-variations.ts src/lib/themes.ts tests/prompts.test.ts`         | exit 0                                                  |
| Build         | `npm run build`                                                                                                                                                                                            | exit 0 with the operator's configured local environment |
| Size check    | `Get-ChildItem public/samples/theme-halloween-night-95.webp,public/samples/theme-haunted-family-manor.webp,public/samples/theme-trick-or-treat-chaos.webp,public/samples/theme-vintage-costume-studio.webp | Select-Object Name,Length`                              | four files; each length is at most 409600 bytes |

Do not use `npm run format`. The repository-wide format check has known unrelated failures.

## Suggested executor toolkit

- Read `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md` before code changes, as required by this repository's Next.js rules.
- Use the `imagegen` skill for the four original cover images if it is available. Inspect each result, crop it to the theme ratio, convert it to WebP, and keep it under 400 KB.

## Scope

**In scope**:

- `src/lib/themes.ts`
- `src/lib/theme-variations.ts`
- `src/data/vibes.ts`
- `src/components/landing/Gallery.tsx`
- `src/components/landing/TrendingAnnouncementBar.tsx`
- `tests/prompts.test.ts`
- The four cover files listed in Target catalog contract.

**Out of scope**:

- `src/data/cards.ts` and the existing Halloween card page.
- Renaming, removing, or rewriting any seasonal theme merged by Plan 001.
- Card text support for the four new vibes.
- Changes to prompt composition, provider logic, roster logic, or generation APIs.
- Famous character costumes, franchise references, brand logos, gore, weapons, occult ritual imagery, or readable candy branding.
- A new dedicated landing-page layout. The shared discovery detail route is sufficient.

## Git workflow

- Start from updated `main` after Plan 001.
- Branch: `codex/halloween-vibes`
- Suggested commit: `feat: add four Halloween family vibes`
- Do not push or open a pull request unless the operator starts execution and asks for that external action.

## Steps

### Step 1: Add four roster-neutral themes

Add the four exact IDs from Target catalog contract to `THEMES` in `src/lib/themes.ts`.

For each theme, supply `blurb`, `scene`, `camera`, `composition`, `lighting`, `style`, and `safety`. Keep each field in its assigned role. Do not repeat crop and pose details in the stable spec when a variation should own them.

Required safety points for all four:

- Original, generic costumes only.
- No famous characters, franchise marks, logos, or readable brand labels.
- No gore, injury, weapon, threatening action, or occult ritual content.
- No extra people or living animals implied by the scene text.
- The scene must remain suitable for a family keepsake.

Special direction:

- `halloween-night-95`: direct on-camera flash is the main visual signal. Keep the blue-hour suburb and warm porch lights visible. Use a generic 1990s consumer-film look. Do not copy a named photographer.
- `haunted-family-manor`: make the mood elegant, not horror-heavy. Paintings must show fictional, non-identifiable ancestors. Use enclosed candle-like practical fixtures or safely placed candles as set dressing.
- `trick-or-treat-chaos`: use a sidewalk or front path with no street traffic. Motion must look playful. Adults remain part of the scene direction only when the selected roster contains adults; do not hard-code parent or child counts in the stable spec.
- `vintage-costume-studio`: use an original hand-painted card aesthetic. Use static paper silhouettes so the prompt does not require an unselected live animal. Do not use readable vintage-card text.

**Verify**: `rg -n 'id: "(halloween-night-95|haunted-family-manor|trick-or-treat-chaos|vintage-costume-studio)"' src/lib/themes.ts` returns four matches, and `npm test` has no roster-neutrality failure.

### Step 2: Add four distinct variation sets

Add one four-item array per new ID in `src/lib/theme-variations.ts`.

The four slots for each theme must cover these compositions:

- Halloween Night ’95: doorway group with flash; sidewalk movement; candy-bucket inspection; close porch snapshot.
- Haunted Family Manor: formal drawing-room portrait; carved staircase arrangement; candlelit hall scene; tight burgundy-and-black portrait.
- Trick-or-Treat Chaos: wide sidewalk run; safe candy-spill recovery; doorstep handoff; trailing-adult documentary frame. Word each direction so it adapts to the selected roster and does not require fixed roles.
- Vintage Costume Studio: paper-moon portrait; painted-backdrop lineup; flat silhouette-prop scene; close worn-print keepsake.

Do not use the same camera distance and body crop in all four slots.

**Verify**: a small Node or test assertion using `getThemeVariationPrompts` reports exactly four prompts for each new ID.

### Step 3: Add discovery entries and route links

Add four entries to `src/data/vibes.ts` with the exact slugs and matching cover paths from Target catalog contract.

Each entry must include:

- One clear primary keyword.
- At least three secondary keywords.
- A short description that does not promise a card or editable greeting.
- At least three valid related routes.
- The same image path as its theme cover.

Use related routes that exist after Plan 001. Good candidates include the existing Halloween card, `noughties-family-throwback-photos`, `film-noir-family-photos`, `vintage-polaroid-family-photos`, `vintage-pumpkin-patch-postcard-family-photos`, and the other new Halloween vibe slugs. Confirm every chosen route in the live `VIBES` or `CARDS` arrays before use.

The standard `getThemeDetailHref` candidates should resolve all four IDs through `<id>-family-photos`. Do not add an override unless a test proves that standard resolution fails.

**Verify**: add or extend a test that calls `getThemeDetailHref` for all four themes and expects the exact discovery paths.

### Step 4: Create and optimize four owned cover images

Create one original image for each new vibe. Do not reuse the existing Halloween card or any pull-request cover.

Quality checks:

- The image clearly matches its theme before text labels are read.
- Faces and hands are plausible enough for a customer-facing sample.
- The image has no text, watermark, logo, famous costume, or trademarked candy wrapper.
- Landscape themes use 3:2. Portrait themes use 2:3.
- Final file type is WebP.
- Each file is at most 400 KB.
- The four files are visually distinct and have different paths.

**Verify**: run the Size check command and inspect all four images at full size.

### Step 5: Feature the seasonal set on the homepage

In `Gallery.tsx`, put `halloween-night-95` first in `WEEKLY_TREND_ITEMS` because it is the strongest mass-market option. Add the other three directly after it. Use short seasonal badges. Keep the 12-card display limit and remove duplicate IDs if an integrated weekly list already contains one.

In `TrendingAnnouncementBar.tsx`, make the four new themes the first four fallback entries during the Halloween campaign. Keep two current late-season entries after them so the ticker has six distinct entries.

Do not change layout, animation, translation structure, or the dynamic database-backed trending behavior.

**Verify**: tests or a direct source assertion confirm the four exact IDs are present once in the homepage weekly list and fallback ticker.

### Step 6: Add regression tests

Extend the existing weekly-theme structure in `tests/prompts.test.ts`. Do not create another repeated `CURRENT_TASK_*` registry if Plan 001 already consolidated it.

Tests must prove:

- Four unique theme IDs and four unique discovery slugs exist.
- All categories and ratios match Target catalog contract.
- All themes use `nanobanana`, support pets, and do not accept card text.
- Each theme has exactly four variations.
- Stable theme specs contain no hard-coded roster counts, roles, pets, or supplied text.
- A people-only generated prompt does not require a live pet or animal.
- IP and family-safety blocked terms are absent.
- Each cover exists, is unique, matches its discovery entry, and is at most 400 KB.
- Each theme detail link resolves to its exact discovery slug.
- `halloween-night-95` is first in the static weekly homepage list.

Use the existing weekly tests at `tests/prompts.test.ts:308-438` as the model.

**Verify**: `npm test` exits 0 and all new Halloween assertions pass.

### Step 7: Run final checks and inspect the product flow

1. Run tests, lint, scoped format, build, and `git diff --check`.
2. Run the app in its normal local development setup.
3. Inspect `/`, `/vibes`, all four new detail routes, and `/studio/theme` at desktop and mobile widths.
4. Start a mock shoot with one Halloween vibe and then with all four selected. Confirm the existing four-slot selection rules work without code changes.
5. Confirm the existing `card-halloween` flow still works and remains separate.

**Verify**: all commands pass, all pages load, all four covers render, and the mock shoot receives the selected theme IDs.

## Test plan

- Extend `tests/prompts.test.ts`; do not add a separate test framework.
- Model catalog checks on the existing weekly-theme test at lines 308-438.
- Test one-person, people-only, and pet-selected prompt cases where current helpers make this practical.
- Test the exact IDs, slugs, category, ratio, provider, cover, and route mapping.
- Test cover byte size and file existence.
- Test homepage ordering with a source-level assertion only if the static arrays are not exported.

## Done criteria

- [ ] The four exact theme IDs exist once.
- [ ] The four exact discovery slugs exist once.
- [ ] Each theme has four distinct variation prompts.
- [ ] Each discovery image matches its theme cover.
- [ ] Four original WebP cover files exist and each is at most 400 KB.
- [ ] `halloween-night-95` is the first static weekly homepage item.
- [ ] The existing Halloween card and Plan 001 themes are unchanged.
- [ ] `npm test` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] The scoped Prettier check exits 0.
- [ ] `npm run build` exits 0.
- [ ] `git diff --check` has no output.
- [ ] No files outside Scope changed.
- [ ] `plans/README.md` shows Plan 002 as DONE.

## STOP conditions

Stop and report if:

- Plan 001 is not merged into `main`.
- Any target ID, slug, or cover filename already exists after Plan 001.
- Product direction requires one or more concepts to accept custom greeting text. That changes category and flow decisions.
- The request requires named copyrighted costumes or a named living photographer's style.
- A cover cannot meet the 400 KB limit without visible quality loss.
- A theme needs a change to prompt composition, roster rules, or provider behavior.
- A verification command fails twice after a reasonable correction.

## Maintenance notes

- Keep `halloween-night-95` first only for the seasonal campaign. After Halloween, move the four entries below current weekly themes instead of deleting them.
- The catalog already has several soft pumpkin looks after Plan 001. Reviewers should reject prompt or cover drift that makes these four collapse into another cute pumpkin-porch set.
- `Vintage Costume Studio` uses static silhouette props so a people-only selection does not cause an extra live animal. Keep that distinction in future prompt edits.
