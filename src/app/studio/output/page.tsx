import Link from "next/link";

const choices = [
  {
    id: "photoshoot",
    label: "Photoshoot",
    href: "/studio/theme?output=photoshoot",
    chip: "Studio portraits",
    title: "Create a set of family photos.",
    body: "Choose a photographic or stylized vibe, or describe your own scene. Best for frameable portraits, album shots, and trying different looks.",
    color: "coral",
  },
  {
    id: "card",
    label: "Card",
    href: "/studio/theme?output=card",
    chip: "Greeting ready",
    title: "Make a card-style keepsake.",
    body: "Pick an occasion layout with room for optional greeting text. Best for holidays, announcements, invitations, and shareable family cards.",
    color: "butter",
  },
] as const;

export default function OutputPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div>
        <span className="chip chip-butter">
          <span className="dot dot-butter" />
          Step 02 - Format
        </span>
        <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          What are we{" "}
          <em className="serif-italic" style={{ color: "#8a6a1f" }}>
            making
          </em>
          ?
        </h1>
        <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
          Choose the kind of output first. Photoshoots give you portrait sets; cards use occasion
          layouts and can include a greeting.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {choices.map((choice) => (
          <Link
            key={choice.id}
            href={choice.href}
            className="group flex min-h-[18rem] flex-col justify-between rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-md)] transition-all hover:-translate-y-1 hover:border-[color:var(--color-ink)] hover:shadow-[var(--shadow-lg)] focus:outline-none focus:shadow-[var(--shadow-ring-coral)] sm:p-8"
          >
            <div>
              <span className={`chip chip-${choice.color}`}>
                <span className={`dot dot-${choice.color}`} />
                {choice.chip}
              </span>
              <h2 className="serif mt-5 text-3xl leading-tight tracking-[-0.02em] text-[color:var(--color-ink)]">
                {choice.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                {choice.body}
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm font-semibold text-[color:var(--color-ink)]">
                {choice.label}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-bg)] transition-transform group-hover:translate-x-1">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
