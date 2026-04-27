import { themesByCategory } from "@/lib/themes";
import ThemeBoard from "@/components/studio/ThemeBoard";
import { providerStatusLabel } from "@/lib/providers/router";

export const dynamic = "force-dynamic";

export default function ThemePage() {
  const themes = themesByCategory();
  const status = providerStatusLabel();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div>
        <span className="chip chip-sage">
          <span className="dot dot-sage" />
          Step 02 · Vibe
        </span>
        <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          Pick a vibe — <em className="serif-italic text-[color:var(--color-sage-deep)]">or describe one</em>.
        </h1>
        <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
          Start from a curated look, or design your own. One shape picker,
          one wardrobe note — they apply to whichever vibe you launch.
        </p>
        <p className="mt-5 text-xs text-[color:var(--color-ink-faint)]">{status}</p>
      </div>

      <ThemeBoard
        photoreal={themes.photoreal}
        stylized={themes.stylized}
        cards={themes.card}
      />
    </main>
  );
}
