# Vibe image reference setup

The default method remains **Current prompts**. This release adds a separate method for built-in portrait vibes. Cards and custom scenes always use Current prompts.

## Before a local test

1. Apply `db/migrations/0017_vibe_reference_generation.sql` to the **local or staging database only**. The migration adds a default method setting, a saved method, and saved reference inputs. Old shoots read as Current prompts.
2. Set the existing R2 environment values for the same test environment, including `CLOUDFLARE_PUBLIC_URL`.
3. Make a test environment file that points to a **test bucket** and its public URL. Run `node --env-file=<test-env-file> scripts/upload-generation-demos.mjs`. This checks the source hashes and image dimensions, uploads missing versioned demo files, and checks each public URL. Do not run it against production until release approval.
4. Start the app with the same test database and bucket. Use an admin account to choose **Vibe image reference** for one built-in portrait shoot. The app checks that each planned demo and selfie exists before it uses a credit.

The manifest is `src/lib/generation-demo-manifest.json`. It has a fixed R2 key, SHA-256 hash, and short direction for each built-in portrait vibe. Marketing cover images can change without changing existing generation inputs. To update a demo, add a new version and key; keep old objects until the shoots that use them expire. The normal generation retention cleanup removes saved selfie copies under `generations/<id>/references/`.

## Test both methods

Admins can select a built-in portrait vibe and click **Review prompts** in the floating bar. In the confirmation window, select the people or pets and click **Load prompts**. The window shows the resolved method and the exact prompt for each of the four images. An admin can edit each prompt before **Start shoot**. With the panel open, the shown method and prompts are used for this shoot. The prompts are sent without further additions and saved for retries. **Restore generated prompts** removes the edits. If the selected subjects or other shoot inputs change, load the prompts again. The editor does not appear for customers, cards, or custom scenes. Prompt loading does not use a credit or start a provider job.

1. In **Admin → Settings**, keep **Current prompts** as the app default. Check that the model setting is separate.
2. In **Studio → Vibe**, use the admin method control to make a built-in photographic portrait with **Current prompts**. Note the model, subjects, shape, wardrobe, and vibe.
3. Use the same choices with **Vibe image reference**. Choose an illustrated vibe too. The reference method uses one demo and one selfie per selected subject for each output.
4. Test one, two, three, and four selected vibes. Check that each output uses its planned vibe. For one vibe, all four outputs use the same demo.
5. Replace a selfie or change the default only after a reference shoot has started. If a slot fails and retries, the retry must use the saved prompt, model, demo version, and ordered selfie copies.
6. Check cards and custom scenes. They must use Current prompts, including when the app default is changed in a test environment.

These steps use image generation and may cost money. Automated tests use a mock provider request and make no paid image calls.

## Interrupted launches

Each provider job ID is saved as soon as Replicate returns it. If the request ends before all four IDs are saved, the shoot stays pending for up to 10 minutes. Opening the shoot or Album after that time marks it as failed, returns its credit, and tries to cancel each known provider job. It never starts a replacement job for a missing ID.

The recovery database test is `tests/generation-recovery-db.test.ts`. Set `TEST_DATABASE_URL` to a dedicated local PostgreSQL database whose name contains `recovery_test`, then run `node --import tsx --test tests/generation-recovery-db.test.ts`. The test creates the two tables it needs, uses unique test rows, and removes those rows when it ends. It will not run without that URL or against a non-local host. The normal `npm test` run skips this database test when `TEST_DATABASE_URL` is not set.

For a customer who does not return, an operator can run `node --env-file=<environment-file> --import tsx scripts/recover-stale-generation-launches.mjs` to count stale shoots without changing them. After checking the environment file, add `--apply` to return their credits and try to cancel known jobs. A provider job may still have been accepted just before the request ended without its ID reaching the app. The customer gets a refund in that case, but the provider may still charge for that job.

## Release limits

- Both generation methods allow up to eight selected people or pets per shoot for admins and customers. The reference method adds one demo image, so each output sends at most nine images. Nano Banana supports up to 14 input images. The current Replicate GPT Image schemas do not state a maximum; the app keeps a provisional limit of 10 input images for those models.
- Source schemas: [Nano Banana 2](https://replicate.com/google/nano-banana-2/api/schema), [Nano Banana Pro](https://replicate.com/google/nano-banana-pro/api/schema), [GPT Image 2](https://replicate.com/openai/gpt-image-2/api/schema), and [GPT Image 2.5 Flare](https://replicate.com/openai/gpt-image-2.5-flare/api/schema). Check these again before raising the app limits.
- The first version does not force four different poses when one vibe is selected.
- Demo assets must be in a public R2 bucket that the provider can reach. Missing assets cause a clear error before a chargeable shoot starts.
