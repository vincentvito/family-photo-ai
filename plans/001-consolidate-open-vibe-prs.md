# Plan 001: Consolidate and merge the six open vibe pull requests

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before you move to the next step. If a STOP condition occurs, stop and report. Do not improvise. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a5b8960..HEAD -- src/app/studio/theme/page.tsx src/components/studio/ThemeBoard.tsx src/components/landing/Gallery.tsx src/components/landing/TrendingAnnouncementBar.tsx src/data/vibes.ts src/lib/theme-detail-links.ts src/lib/theme-variations.ts src/lib/themes.ts tests/prompts.test.ts public/samples`
>
> If these files changed for a reason other than this plan, compare the live code with the pull-request patches before you proceed. Stop if the new changes alter theme IDs, discovery slugs, prompt rules, or the weekly-theme test structure.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `a5b8960`, 2026-09-04

## Why this matters

Six open pull requests add weekly vibes. All six are mergeable against the current `main` branch and have successful Vercel checks, but they edit the same catalog files. PR #34 contains the complete commit from PR #33. PRs #35 and #39 also define the same `butter-yellow-picnic` ID and slug. A single integration branch lets the executor preserve all valid work, remove the one duplicate, and run one complete verification pass.

## Current state

The local `main` branch and `origin/main` both point to `a5b8960152ba2627b3f5beccb4261a84b6dbe1a0` at plan time. The working tree is clean.

Open pull requests, from oldest to newest:

| PR                                                            | Head                                            | Main content                                                                               | Important overlap                          |
| ------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| [#33](https://github.com/vincentvito/family-photo-ai/pull/33) | `fix/vibe-card-image-mapping`                   | Corrects theme-to-cover mapping and adds matching sample files                             | Its commit is already in PR #34            |
| [#34](https://github.com/vincentvito/family-photo-ai/pull/34) | `feature/cmrizz39b-weekly-trend-vibes`          | Six July/August weekly vibes and stronger tests                                            | Contains PR #33 history                    |
| [#35](https://github.com/vincentvito/family-photo-ai/pull/35) | `coddy/cmsn0aa91-weekly-trend-vibes`            | Six weekly vibes, including `butter-yellow-picnic` and `cozy-summerween-card`              | Duplicates one ID and slug from PR #39     |
| [#39](https://github.com/vincentvito/family-photo-ai/pull/39) | `coddy/cmsx0arpb-weekly-trend-vibes-2026-08-17` | Six weekly vibes, including the newer `butter-yellow-picnic` and `summerween-pumpkin-glow` | Its picnic definition is canonical         |
| [#40](https://github.com/vincentvito/family-photo-ai/pull/40) | `coddy/cmt70ezuz-weekly-trend-vibes-2026-08-24` | Six weekly vibes, including `tiny-boo-crew` and `vintage-pumpkin-patch-postcard`           | Adjacent to, but not the same as, Plan 002 |
| [#41](https://github.com/vincentvito/family-photo-ai/pull/41) | `coddy/cmth0i7uf-weekly-trend-vibes`            | Six weekly vibes, including `lantern-glow-gathering`                                       | Latest catalog additions                   |

All six pull requests report `MERGEABLE` and `CLEAN`. Their Vercel checks pass at plan time.

Relevant repository conventions:

- `src/lib/themes.ts:5-30` says a theme spec must not contain roster counts, selected people, pet requirements, or card text. The prompt composer adds those details.
- `src/lib/theme-variations.ts` stores four slot directions for each special theme.
- `src/data/vibes.ts` supplies the discovery page and detail-page content.
- `src/lib/theme-detail-links.ts` maps theme IDs to valid discovery or card routes.
- `tests/prompts.test.ts:308-438` checks unique IDs and slugs, prompt safety, pet gating, four variations, route exposure, distinct owned cover images, and a 400 KB cover-image limit.
- Commit messages use conventional prefixes such as `feat:` and `fix:`.

## Commands you will need

| Purpose       | Command                                                                                                                                                                                                                                                                                             | Expected on success                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Baseline      | `git status --short`                                                                                                                                                                                                                                                                                | no output                                               |
| Tests         | `npm test`                                                                                                                                                                                                                                                                                          | exit 0; all tests pass                                  |
| Lint          | `npm run lint`                                                                                                                                                                                                                                                                                      | exit 0                                                  |
| Scoped format | `npx prettier --check src/app/studio/theme/page.tsx src/components/studio/ThemeBoard.tsx src/components/landing/Gallery.tsx src/components/landing/TrendingAnnouncementBar.tsx src/data/vibes.ts src/lib/theme-detail-links.ts src/lib/theme-variations.ts src/lib/themes.ts tests/prompts.test.ts` | exit 0                                                  |
| Build         | `npm run build`                                                                                                                                                                                                                                                                                     | exit 0 with the operator's configured local environment |

Do not use `npm run format`. It writes across the repository. The full `npm run format:check` has seven known failures outside this plan.

## Scope

**In scope**:

- Git history from PRs #33, #34, #35, #39, #40, and #41.
- `src/app/studio/theme/page.tsx`
- `src/components/studio/ThemeBoard.tsx`
- `src/components/landing/Gallery.tsx`
- `src/components/landing/TrendingAnnouncementBar.tsx`
- `src/data/vibes.ts`
- `src/lib/theme-detail-links.ts`
- `src/lib/theme-variations.ts`
- `src/lib/themes.ts`
- `tests/prompts.test.ts`
- The `public/samples/theme-*` image files already present in the six pull requests.

**Out of scope**:

- New Halloween concepts from Plan 002.
- New generated images that are not already in one of the six pull requests.
- Changes to billing, authentication, generation providers, database files, or general page design.
- Repository-wide formatting changes.

## Git workflow

- Branch: `codex/integrate-weekly-vibes`
- Preserve the source pull-request commits with merge commits.
- Commit only manual conflict resolution as a separate `fix:` commit if Git does not include it in a merge commit.
- Push and open the integration pull request only when the operator starts execution of this plan.
- Merge the integration pull request with **Create a merge commit**. Do not squash it.

## Steps

### Step 1: Refresh the pull-request state

1. Confirm that the working tree is clean.
2. Refresh `main` with a fast-forward-only pull.
3. Run `gh pr view` for all six pull requests. Confirm that each pull request is still open and that its head commit matches the commit inspected by this plan.
4. Record any new checks, review comments, or changed files.

Head commits inspected by this plan:

- #33: `1458b733c46f70adcb8fc0e25a02b9c728e8f77d`
- #34: `b637da40cbb07f269eb34824225fd5b5369ddaf7`
- #35: `89bf3c51494768240abeed29a95f931484d165ef`
- #39: `e2312440e6a1f2edaf8aca71750fe05e560c2f96`
- #40: `dc098ebb46625db91765f002888b6a15a667a419`
- #41: `00c58ff73984b83e07369f4497affbae4fd5af4f`

**Verify**: `git status --short` returns no output, and all six `gh pr view` calls still report open pull requests.

### Step 2: Create the integration branch and merge all source histories

1. Create `codex/integrate-weekly-vibes` from the refreshed `main` branch.
2. Fetch each pull-request head into a local temporary branch or ref.
3. Merge in this order: #33, #34, #35, #39, #40, #41.
4. Use `--no-ff` for each merge that adds commits. If the #33 commit is already reachable when #34 is merged, do not copy or re-create it.
5. Keep every unrelated `main` entry when a catalog array conflicts. These pull requests are additive.

**Verify**: `git log --graph --oneline --decorate -40` shows all six inspected head commits as ancestors of the integration branch.

### Step 3: Resolve the duplicate picnic definition once

PRs #35 and #39 both add `butter-yellow-picnic` and `butter-yellow-picnic-family-photos`. Keep exactly one of each.

Use the PR #39 version as canonical because it is newer and uses its own optimized cover image:

- Theme cover: `/samples/theme-butter-yellow-picnic.webp`
- Discovery image: `/samples/theme-butter-yellow-picnic.webp`
- Theme description and four variations: the PR #39 versions
- Asset: keep `public/samples/theme-butter-yellow-picnic.webp`

Remove the older PR #35 picnic entry that uses `/samples/theme-backyard-picnic.jpg`. Keep the other five themes from PR #35, including `cozy-summerween-card`.

**Verify**:

- `rg -n 'id: "butter-yellow-picnic"' src/lib/themes.ts` returns one match.
- `rg -n 'slug: "butter-yellow-picnic-family-photos"' src/data/vibes.ts` returns one match.
- `rg -n '^  "butter-yellow-picnic":' src/lib/theme-variations.ts` returns one match.
- The theme and discovery entry both use `/samples/theme-butter-yellow-picnic.webp`.

### Step 4: Consolidate the catalog tests and homepage lists

1. Keep one shared weekly-theme test structure in `tests/prompts.test.ts`. Extend its ID, slug, pair, and card-theme collections. Do not leave repeated `CURRENT_TASK_*` declarations from separate pull requests.
2. Keep the uniqueness assertions for every theme ID and discovery slug.
3. Keep the tests that require four variations, prompt safety text, roster-neutral spec fields, people-only pet gating, owned sample assets, matching discovery and theme images, unique new cover paths, and files at or below 400 KB.
4. In `Gallery.tsx`, retain each intended added weekly item without duplicate IDs. Keep newest items before older items when order conflicts. Do not increase the displayed 12-item limit.
5. In `TrendingAnnouncementBar.tsx`, retain the latest fallback list from the newest pull request that changed this file. Do not concatenate repeated fallback entries.
6. In `theme-detail-links.ts`, keep all valid explicit overrides from `main` and the pull requests.

**Verify**: `npm test` exits 0 and reports at least the current 61 passing tests, with no duplicate-ID or missing-route failures.

### Step 5: Run the full integration checks

Run the test, lint, scoped format, and build commands from the command table. Inspect `git diff --check` and the final changed-file list.

**Verify**:

- All tests pass.
- Lint passes.
- Scoped Prettier check passes.
- Build passes.
- `git diff --check` has no output.
- No files outside Scope changed.

### Step 6: Open and merge one integration pull request

1. Push `codex/integrate-weekly-vibes`.
2. Open one pull request to `main`. Its body must list the six source pull requests, the picnic duplicate decision, and all verification results.
3. Wait for the Vercel preview and all required checks.
4. Review the preview pages for `/`, `/vibes`, `/studio/theme`, and one detail page from each source pull request.
5. Merge with a merge commit after review approval.
6. Check the state of PRs #33, #34, #35, #39, #40, and #41. If GitHub leaves any open, add a short comment that its commits were included by the integration pull request, then close it as superseded. Do not close a pull request until its commits are in `main`.

**Verify**: `main` contains all six source head commits, the integration checks pass on `main`, and none of the six source pull requests remains open without an explanation.

## Test plan

- Use the existing weekly-theme test at `tests/prompts.test.ts:308-438` as the structure.
- Confirm all merged theme IDs and slugs are unique.
- Confirm each merged theme has four variation prompts.
- Confirm each merged discovery image matches the theme cover when the pair requires it.
- Confirm each owned sample exists and is at most 400 KB.
- Confirm a people-only prompt does not add an animal requirement.
- Confirm each new theme detail link resolves to a detail page or the correct card page.

## Done criteria

- [ ] All six source pull-request head commits are ancestors of merged `main`.
- [ ] There is one `butter-yellow-picnic` theme, one matching discovery slug, and one variation-map key.
- [ ] The canonical picnic uses `/samples/theme-butter-yellow-picnic.webp`.
- [ ] `npm test` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] The scoped Prettier check exits 0.
- [ ] `npm run build` exits 0.
- [ ] The integration pull request used a merge commit.
- [ ] Each original pull request is merged or clearly closed as superseded after its commits reached `main`.
- [ ] `plans/README.md` shows Plan 001 as DONE.

## STOP conditions

Stop and report if:

- Any inspected pull-request head commit changed.
- A pull request contains new files outside the stated scope.
- A conflict changes generation, authentication, billing, database, or provider behavior.
- A source pull request is closed or superseded by work that is not in `main`.
- The combined catalog cannot pass unique-ID and unique-slug tests without deleting a theme other than the older picnic duplicate.
- The integration requires a squash merge to pass repository policy. A squash merge will not preserve the source histories as planned.
- A verification command fails twice after a reasonable conflict correction.

## Maintenance notes

- Weekly pull requests should branch from the latest `main`, not from an older weekly branch base.
- Future weekly work should check theme IDs, discovery slugs, and cover filenames against all open pull requests before it opens a new pull request.
- A later cleanup can split the large catalog and test registries into smaller modules. That cleanup is not part of this integration.
