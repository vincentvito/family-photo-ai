# Production review — 29 September 2026

## Result

Local checks pass. Production release still needs the deployment checks below.

The branch `codex/open-ai-integtration` and the fetched `origin/main` both point to `1b32bb7`. The reviewed feature changes are uncommitted.

## Corrections

- Updated Next.js and its ESLint package from 16.3.0 to 16.3.7. Updated Sharp from 0.35.3 to 0.35.5. These updates address the reported critical and high security findings. Updated affected Browserslist, baseline-browser-mapping, and js-yaml dependencies.
- Changed OpenAI recovery selection so active workers cannot block queued shoots. Jobs with a missing start time now use their creation time for recovery.
- Protected pending generation files from the storage cleanup script. The script checks the database again before each generation file deletion.
- Corrected cleanup in two model picker tests so browser work can finish before the test removes the browser environment.

Security references: [Next.js Windows advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36), [Next.js image advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [Sharp advisory](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c).

## Checks

- Full test suite: 146 passed, 0 failed, 1 skipped. The skipped Replicate recovery test needs a local `TEST_DATABASE_URL`. OpenAI database tests passed with PGlite.
- Production build, including TypeScript: passed with Next.js 16.3.7.
- ESLint: no errors; four existing navigation warnings.
- Formatting checks for the review edits and `git diff --check`: passed.
- Local sign-in page: loaded in a browser. Next.js reported no compilation or runtime errors. Authenticated admin and shoot flows still need a live test.
- Local access checks: signed-out requests received 403 for recovery and admin model changes, and 401 for generation status, generation creation, and refinement.
- Dependency audit: no high or critical findings remain. Four moderate findings remain in the Drizzle Kit/esbuild dependency chain. Drizzle Kit is a development dependency and an optional peer of Better Auth, so these also appear in `npm audit --omit=dev`. The audit proposes a breaking downgrade. No forced downgrade was applied.

## Before production release

1. Migration 0018 is confirmed in both locally configured database connections (`DATABASE_URL` and `DIRECT_URL`). A read-only check on 29 September 2026 verified all 12 columns, the primary key, both indexes, the foreign key, and both check constraints. No migration rerun is needed for these connections. Confirm that production uses this database; if it uses a separate database, check that target before selecting a direct OpenAI model.
2. Confirm that production has `OPENAI_API_KEY` and `CRON_SECRET`. Confirm the Vercel plan supports the five-minute schedule and the 300-second route duration.
3. Run paid test shoots with both direct models. Check both prompt methods, cards, custom scenes, and refinements. Confirm saved outputs, face likeness, elapsed time, and actual cost.
4. Confirm that the production scheduler recovers an interrupted worker and returns the credit for a partial or failed shoot.
5. Keep the existing global model default until these checks pass. To stop new direct shoots, restore a Replicate default. Keep the jobs table and recovery worker available for existing direct shoots.

Production environment settings, paid provider calls, and production scheduler runs were not verified. The migration schema was verified through the locally configured database connections after the initial review.
