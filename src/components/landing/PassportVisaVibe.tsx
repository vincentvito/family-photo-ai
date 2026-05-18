import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function PassportVisaVibe() {
  return (
    <section id="passport-visa" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-lg)]">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-gradient-to-br from-white via-[color:var(--color-bg-tinted-butter)] to-[color:var(--color-bg-tinted-sage)] p-8 sm:p-10">
                <div className="mx-auto flex aspect-[4/5] max-w-sm items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-line-strong)] bg-white/88 shadow-[var(--shadow-sm)]">
                  <div className="text-center">
                    <div className="mx-auto h-24 w-24 rounded-full bg-[color:var(--color-bg-tinted-sage)]" />
                    <div className="mx-auto mt-5 h-16 w-40 rounded-t-full bg-[color:var(--color-bg-tinted-butter)]" />
                    <p className="mt-8 rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                      Passport · visa
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 sm:p-10 lg:p-12">
                <span className="chip chip-sage">
                  <span className="dot dot-sage" />
                  New vibe · document photos
                </span>
                <h2 className="serif mt-5 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                  Passport and visa photos need a different flow.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-base">
                  Pick the destination country and passport/visa type before generation, then create
                  white-background official-style photos for one family member at a time.
                </p>
                <div className="mt-6 grid gap-3 text-sm text-[color:var(--color-ink-muted)] sm:grid-cols-3">
                  <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg)] p-4">
                    <strong className="block text-[color:var(--color-ink)]">Country presets</strong>
                    US, UK, Schengen, Canada, India, Australia, China, Japan.
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg)] p-4">
                    <strong className="block text-[color:var(--color-ink)]">
                      White background
                    </strong>
                    Neutral expression, no glasses/hats/shadows prompt constraints.
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg)] p-4">
                    <strong className="block text-[color:var(--color-ink)]">Family workflow</strong>
                    Generate one adult or child, then repeat for the next.
                  </div>
                </div>
                <Link href="/passport-visa-photos" className="btn btn-coral mt-8">
                  Try passport/visa photos
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
