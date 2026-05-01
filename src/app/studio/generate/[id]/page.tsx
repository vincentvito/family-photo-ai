import { notFound } from "next/navigation";
import { getGenerationState } from "@/actions/generate";
import { resolveTheme } from "@/lib/themes";
import GenerationBoard from "@/components/studio/GenerationBoard";

export const dynamic = "force-dynamic";

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const state = await getGenerationState(id);
  if (!state) notFound();

  const theme = resolveTheme(state.generation);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div>
        <span className="chip chip-butter">
          <span className="dot dot-butter" />
          Step 03 · Your shoot
        </span>
        <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          {theme.name}
          <em className="serif-italic text-[color:var(--color-coral)]">.</em>
        </h1>
        <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
          Four variations. Hover any to keep it, refine it, or send it to print.
        </p>
      </div>

      <GenerationBoard generationId={id} aspectRatio={theme.aspectRatio} initialState={state} />
    </main>
  );
}
