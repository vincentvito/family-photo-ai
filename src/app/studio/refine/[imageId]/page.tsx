import Link from "next/link";
import { notFound } from "next/navigation";
import { getRefineState } from "@/actions/refine";
import { resolveTheme } from "@/lib/themes";
import RefineStage from "@/components/studio/RefineStage";

export const dynamic = "force-dynamic";

export default async function RefinePage({ params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await params;
  const state = await getRefineState(imageId);
  if (!state) notFound();

  const theme = state.generation ? resolveTheme(state.generation) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip chip-plum">
            <span className="dot dot-plum" />
            Step 04 · Refine
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            Anything we should{" "}
            <em className="serif-italic text-[color:var(--color-plum)]">change</em>?
          </h1>
          {theme && (
            <p className="mt-3 text-sm text-[color:var(--color-ink-muted)]">
              {theme.name} · aspect {theme.aspectRatio}
            </p>
          )}
        </div>
        {state.generation && (
          <Link href={`/studio/generate/${state.generation.id}`} className="btn btn-ghost btn-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Back to shoot
          </Link>
        )}
      </div>

      <RefineStage initialState={state} />
    </main>
  );
}
