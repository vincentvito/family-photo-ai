# Deferred login until free preview reveal

## Goal

Remove FamilyShoot's upfront sign-in barrier. A new visitor should be able to build the roster, choose or design a vibe, and start exactly one free preview generation before login. When results are ready, unauthenticated guests must see blurred result tiles behind a login gate. After login, the same generation is revealed using the existing watermarked free-preview behavior.

## Guardrails

- No production deploy.
- No merge without Vlad or Matteo approval.
- Do not delete data.
- Do not rotate, expose, or hardcode secrets.
- Keep the existing logged-in paid flow, credits, watermarking, unlock, and retention behavior intact.

## Required architecture

- Use a signed HTTP-only anonymous studio owner cookie, not public query params.
- Synthetic guest owner id format: `guest:<nanoid>`.
- Reuse existing `people` and `generations` ownership because `userId` is text and not a foreign key.
- Keep `/api/images/*` authenticated. Guests must never receive raw generated image bytes.
- Guest can create roster, upload references, choose curated/card/custom vibe, and start exactly one `freePreview` generation.
- On login, claim/migrate guest people/generations to the Better Auth user and clear the guest cookie.
- If the logged-in account already has a free preview, do not delete or overwrite either generation. Surface a safe conflict state.

## Guest permissions

Allowed before login:

- Load `/studio/roster` without redirecting to sign-in.
- Add roster members.
- Upload reference photos.
- Pick curated/custom/card vibe.
- Start exactly one free preview generation.
- Watch generation progress.
- See blurred placeholders plus a strong login CTA when results are ready.

Blocked before login:

- Fetch raw generated image bytes from `/api/images/*`.
- Refine.
- Upscale.
- Export/download.
- Favorite.
- Share.
- Use album features.
- Buy credits.
- Start more than one guest free preview.

## Acceptance criteria

- `/studio/roster` loads in incognito without redirecting to sign-in.
- Guest can add roster members and upload reference photos.
- Guest can pick curated, custom, or card vibe and start one free preview.
- Guest generation page shows progress, then blurred placeholders and “Sign in to reveal your free previews” CTA.
- Network tab does not request `/api/images/*` while guest is unauthenticated.
- After OTP or Google login, the same `/studio/generate/[id]` shows the existing watermarked preview images.
- Guest cannot refine, upscale, export, favorite, share, use album, buy credits, or fetch image bytes.
- Existing logged-in flow, paid credits, watermarks, unlock, and retention still work.

## Delivery requirements

- Branch: `feat/deferred-login-preview` from freshly updated `main`.
- PR title: `feat: defer sign-in until free preview reveal`.
- Run:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
- If local build is blocked by env-only `BETTER_AUTH_URL` or `NEXT_PUBLIC_APP_URL`, document it and still push/open the PR.
- PR body must include:
  - summary
  - security notes
  - manual QA matrix
  - command results
  - Vercel preview URL if available
  - blockers/risks

## Control Center update format

Append to task `cmpgde92c000004joub9t5kqg` with:

- PR URL
- Vercel preview URL if available
- command results
- manual QA matrix
- security/abuse notes
- blockers/risks
