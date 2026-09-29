# Direct OpenAI image generation

## Setup

1. Apply `db/migrations/0018_openai_image_jobs.sql` to the target database.
2. Add `OPENAI_API_KEY` to the server environment. The key needs funded access to GPT Image 2.5. OpenAI can require organization verification.
3. Restart the app.
4. In the admin shoot controls, find **OpenAI direct · Medium quality**. Select **Sunburst** or **Flare**.

The admin overview has the same controls for the global default. Saving a direct model requires a key and the jobs table. The app does not change the current default during setup. Keep the current default while testing.

## Comparison settings

Both direct choices use `/v1/images/edits`, one image per request, `quality=medium`, `moderation=low`, and PNG output. A shoot has four requests with separate prompts.

| Shape     | Size        |
| --------- | ----------- |
| Square    | 1024 × 1024 |
| Landscape | 1536 × 1024 |
| Portrait  | 1024 × 1536 |

Use the same subjects, prompts, generation method, and shape for both models. Review the original output files. Admin thumbnails and free previews have additional image processing. The existing Replicate Sunburst and Flare choices still use high quality. Comparing them with direct medium quality does not isolate the provider effect.

The app copies all input images into the shoot folder before it queues requests. This includes demo and location images. Each job saves the exact prompt, model, quality, size, output format, and reference order. Refinements use this saved request plus the refinement notes. They continue to generate from the original references, as in the existing flow. Upscaling uses Replicate.

## Job processing and recovery

The database holds four jobs for each direct shoot. Next.js `after()` starts a worker after the initial response. Authenticated shoot status requests also schedule the worker. A conditional database update claims each queued job once. The worker saves outputs to deterministic R2 paths, then records the images. The generation and status routes have a 300-second duration limit. The OpenAI HTTP request has a 210-second timeout.

A worker can recover an output saved in R2 before a process stopped. Running jobs become eligible for this check after 10 minutes. If no file exists, the worker marks the job failed. It does not repeat a paid request after a timeout or provider error. OpenAI could have billed an interrupted request. A shoot with at least one saved output completes; a shoot with fewer than four saved outputs returns its full photo credit once. Users keep any successful images. Only a complete four-image shoot uses a credit.

For unattended recovery, configure a scheduler to call `GET /api/admin/openai-jobs` with `Authorization: Bearer <CRON_SECRET>`, for example every five minutes. Each call processes at most two pending shoots. An admin can also call this endpoint. `vercel.json` schedules this endpoint every five minutes after production deployment. This frequency requires a paid Vercel plan and `CRON_SECRET` in the production environment. Before setting a customer-wide default, configure the scheduler and confirm the host supports the route duration. Status polling alone only resumes work when a user returns.

The scheduler selects queued jobs, stale running jobs, and old shoots that need a final status. Active workers do not use the two recovery slots. Storage cleanup preserves pending shoots, including outputs that do not yet have an image row.

Request IDs and provider usage are saved on `familyphotoai.image_jobs`. Prices are shown as variable because reference inputs and output usage affect the total. Do not use the old Replicate per-image price as the direct OpenAI price.

## Validation before a global switch

- Run `npm test` and `npx tsc --noEmit`.
- Confirm both model buttons send the selected direct model at medium quality.
- Test both prompt methods, cards, custom scenes, and refinements with paid test shoots.
- Compare face likeness, scene accuracy, detail, completion time, and total cost.
- Confirm the selected OpenAI account can handle four requests per shoot at the expected traffic level.

Automated tests use mock image requests and a temporary in-memory Postgres database. They do not call paid image APIs or change the configured database.

Sources: [OpenAI image guide](https://developers.openai.com/api/docs/guides/image-generation), [Images edit API](https://developers.openai.com/api/reference/cli/resources/images/methods/edit), [Sunburst](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst).
