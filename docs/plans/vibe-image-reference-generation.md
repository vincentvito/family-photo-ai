# Vibe image reference generation plan

Status: Agreed design; implementation has not started.
Date: 2026-09-21

## Objective

Add a separate generation method that uses a vibe demo image and a short prompt, followed by one selfie for each selected person or pet. Keep the current generation method available with its existing behavior.

Admins can select the default method for the app and override the method for their own shoots. Method selection and model selection are independent.

The purpose is to test whether the new method improves face likeness. The user's experiments support this approach, but the app must not claim a measured improvement until comparison tests are complete.

## Scope for the first version

- Support built-in portrait vibes, including photographic and illustrated vibes.
- Keep cards and custom scenes on the current method. Show this scope in the admin controls.
- Keep one selfie per selected person or pet.
- Keep the existing customer steps, four-output selection rules, model choices, credits, free previews, progress display, ratings, album, and downloads.
- Keep the current method as the initial app default.
- Do not add image editing, a second-selfie requirement, automatic face scoring, or a new customer method selector.
- Do not change the existing long prompts or their composition rules as part of this work.

## Current code and integration points

| Area | Current code | Planned use |
| --- | --- | --- |
| Generation entry and retries | `src/lib/generate-queries.ts` | Resolve the method, prepare each output, persist inputs, and route retries |
| Current prompt builder | `src/lib/prompts.ts` | Preserve current behavior |
| Provider requests and variant prompts | `src/lib/replicate/generate.ts` | Keep existing method; let the new method send an exact final prompt without long-prompt additions |
| Vibe catalog | `src/lib/themes.ts` | Map each supported vibe to a generation demo and short direction |
| Four-output planning | `src/lib/vibe-selection-plan.ts` | Keep existing selection and recommendation rules |
| App settings | `src/lib/admin-queries.ts`, `db/schema.ts` | Add the default method independently of the default model |
| Global model control | `src/app/admin/DefaultModelPicker.tsx`, `src/app/api/admin/default-model/route.ts` | Follow the existing admin setting pattern |
| Studio admin controls | `src/components/studio/ThemeBoard.tsx`, `src/app/studio/theme/page.tsx` | Add a method override beside model selection |

Before implementation, read the applicable local Next.js guides in `node_modules/next/dist/docs/` and check the current repository state. Preserve unrelated work.

## Method selection

Use stable internal identifiers, such as `current-prompt` and `vibe-reference`, with user-facing labels `Current prompts` and `Vibe image reference`.

### App default

- Store `defaultGenerationMethod` in app settings.
- Only admins can change it through an authenticated server endpoint.
- Follow the existing global model control's save and confirmation behavior.
- State that the setting applies to new built-in portrait shoots. Cards and custom scenes continue to use the current method.
- Keep the model default separate. Changing a method must not change the model.

### Admin test override

- Add `Use app default`, `Current prompts`, and `Vibe image reference` to the Studio admin controls.
- An explicit choice affects that admin shoot only and does not update app settings.
- Resolve `Use app default` on the server when the shoot starts, rather than sending a stale page value as an override.
- Check admin authority on the server. Ignore a non-admin method override, consistent with the existing model override policy.
- For cards and custom scenes, show that the current method applies and disable the unsupported reference choice.
- Include the resolved method and model in admin shoot details so test results can be identified later.

### Resolution order

1. Validate the selected output and subjects using the existing rules.
2. For cards and custom scenes, resolve to the current method regardless of the portrait default.
3. For supported portrait shoots, use an authorized explicit admin override; otherwise use the app default.
4. Resolve the model independently through the existing model policy.
5. Validate all required demos and model input limits before creating a chargeable generation or provider request.

## New reference method

### Per-output inputs

Each output receives its own ordered input list:

1. The demo image for that output's vibe.
2. The first selected subject's selfie.
3. The second selected subject's selfie, continuing through the selected roster.

Build the short prompt and image list from the same ordered subject data. The demo is never counted as a selected subject. Use server-owned demo mappings, not arbitrary demo URLs supplied by the browser.

The provider input adapter can remain shared, but the new method must bypass the current `buildVariantPrompt` step. It must not append the current composition modes, scene-pressure instructions, or expression overrides.

### Prompt design

Use the successful experiment as the starting template:

> Recreate the portrait in image 1 using only the four people shown in images 2–5. Preserve their recognizable faces and ages, and match image 1's black-and-white photography, soft lighting, close framing, and affectionate group pose. Include each person once, with no additional people or animals.

Store a short, reviewed direction for each vibe. Do not reconstruct the existing long specification or use the full marketing description. Keep visual details appropriate to photographic and illustrated demos.

Generate only the brief additions needed for the actual shoot:

- Correct image numbers, subject count, and singular or plural wording.
- Correct people and pet descriptions. Selected pets must remain animals; prohibit only additional subjects.
- Preservation of recognizable features and ages.
- Adaptation of the demo arrangement when the selected group size differs from the demo.
- Adaptation to the requested aspect ratio without dropping or duplicating subjects.
- A short wardrobe instruction when supplied. That explicit change takes precedence over the demo's clothing.
- Clear separation between the demo's visual direction and the subjects' identities.

The selected subjects determine who appears. The demo determines the look and arrangement, subject to requested shape and wardrobe changes.

### Four outputs

| Selection | Behavior |
| --- | --- |
| One vibe | Four independent requests with the same demo and short prompt |
| Two or three vibes | Preserve the current recommended-vibe additions; use the corresponding demo for each output |
| Four vibes | Use the selected demo for each corresponding output |

Do not add forced pose changes in the first version. Natural variation is acceptable. Four outputs from one demo may have less composition variety than the current method.

## Demo asset preparation

- Inventory the built-in portrait demos referenced by `coverImage`.
- Check that each file exists, can be decoded, has useful resolution, and represents the intended vibe.
- Create a dedicated, versioned generation-demo mapping. Existing cover images can supply the initial files, but later marketing asset changes must not silently alter generation inputs.
- Publish stable copies at provider-accessible URLs, using the existing storage system where suitable. Local admin tests must also use reachable assets.
- Do not use browser thumbnail URLs or temporary preview-server URLs as durable inputs.
- Ensure every supported planned output, including recommended vibes, has a valid mapping before enabling the method globally.
- A missing or unusable demo must fail clearly before provider submission. Do not silently run the current method for a supported reference shoot.
- Check current provider schemas for the total image limit. Count the demo as one input in addition to all selected subjects. Do not assume that every listed model accepts the same number of images.

## Persistence and retries

Add an additive generation method field with the current method as the legacy/default value. Existing records must remain readable.

For new reference outputs, persist a versioned input record containing:

- Resolved method and model.
- Output index and vibe ID.
- Exact final prompt.
- Ordered image references.
- Demo asset ID and version.
- Requested aspect ratio and relevant provider settings.

Store the prepared reference inputs before starting provider requests where practical, then attach prediction IDs using the existing tracking mechanism. Use durable references rather than expiring signed URLs in saved records.

Reference retries must reuse saved inputs. They must not rebuild prompts from the current catalog, consult new global defaults, or append current-method variation instructions.

Keep current-method retry behavior unchanged. Treat legacy records without a method field as current-method records. Preserve existing cancellation, retry limits, partial-success handling, and credit refund rules.

The existing selfie replacement process can delete an older selfie. During implementation, verify reference availability during pending shoots and retries. If needed, retain shoot-specific reference copies for the new method within the app's existing deletion and retention rules.

## Implementation sequence

1. **Record the baseline.** Run existing relevant checks and capture representative final current-method prompts and image order for regression tests.
2. **Add settings and data fields.** Add method types, an additive migration, global read/write functions, and legacy defaults. Keep the global default on current prompts.
3. **Prepare demo assets.** Build the versioned mapping, short vibe directions, and asset validation. Verify supported model input limits.
4. **Add reference request preparation.** Build per-output short prompts and ordered images separately from the existing prompt builder.
5. **Connect launch and retry handling.** Resolve the method centrally, save exact reference inputs, and route initial requests and retries without modifying current prompt behavior.
6. **Add admin controls.** Add the global method setting and per-shoot override. Show the effective scope and method in admin testing and result details.
7. **Verify both methods.** Run focused tests, existing regression checks, and browser checks for admin and customer flows.
8. **Compare generated results.** Test both methods with the same model, subjects, vibe, aspect ratio, and wardrobe input. Review several outputs for each case.
9. **Enable deliberately.** Change the global default only after review of the comparison results. Revert the default to current prompts if needed; pending shoots keep their saved method.

## Acceptance checks

- Existing current-method prompt content, reference order, model settings, and output planning remain unchanged for the same inputs.
- The new method sends the demo first and the selected selfies afterward for every output.
- The new method sends only the final short prompt, with none of the old variant or expression instructions.
- Single-person, multiple-person, child, pet, and mixed rosters receive correct counts and labels.
- Different demo and roster group sizes are handled without instructing the model to add subjects.
- Each selected or recommended vibe uses the correct demo.
- Shape and wardrobe choices remain effective.
- Missing demos and excessive reference counts fail before credits are consumed or provider requests start.
- An admin can test either method without changing the global setting; a non-admin cannot override it.
- Switching method does not change the selected model.
- A global change affects new eligible shoots, including requests from an already-open customer page.
- Cards and custom scenes continue on the current method, with scope clearly stated in admin.
- A retry keeps its saved method, model, prompt, and reference order after global settings or catalog data change.
- Existing records and pending current-method shoots still work.
- Credits, preview watermarks, partial results, errors, ratings, and downloads retain their existing behavior.

## Comparison and release decision

Record method, model, vibe, subject count, final prompt, and demo version with each test shoot. Review face likeness separately from scene accuracy and overall image quality.

Include photographic and illustrated vibes, different group sizes, children, and selected pets. Check for copied demo identities, missing or repeated subjects, wrong ages, and poor adaptation to the requested shape.

Use the existing generation records and ratings as the starting point for comparison. A new comparison dashboard is outside this first version.

The release decision is based on observed likeness, scene accuracy, failure rate, generation time, and cost. Do not assume an extra reference has no effect on cost or latency. Keep the current method available for immediate rollback of the default.
