"use client";

import Reveal from "@/components/motion/Reveal";

type Pillar = {
  title: string;
  body: string;
  icon: "lock" | "trash" | "shield";
};

const pillars: Pillar[] = [
  {
    title: "Your photos, yours alone",
    body: "Reference photos live only on your account. They are never used to train public models, ever.",
    icon: "lock",
  },
  {
    title: "Deleted means gone",
    body: "Delete any face, any shoot, any album at any time. Purged from our systems within minutes — not months.",
    icon: "trash",
  },
  {
    title: "Extra care for kids",
    body: "Children's faces are encrypted at rest, accessed only to produce your portraits, and purged on request.",
    icon: "shield",
  },
];

function Icon({ kind }: { kind: Pillar["icon"] }) {
  if (kind === "lock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <rect x="4" y="10" width="16" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
        <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "trash") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M3.5 6h17M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M5.5 6l1 14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2l1-14" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function TrustPrivacy() {
  return (
    <section
      className="relative px-6 py-24 sm:px-8 sm:py-32"
      style={{
        background:
          "linear-gradient(180deg, rgba(235,242,236,0.9) 0%, rgba(214,228,219,0.55) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="max-w-3xl">
            <span className="chip chip-sage">
              <span className="dot dot-sage" />
              On privacy
            </span>
            <h2 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
              Your family is yours. <em className="serif-italic text-[color:var(--color-sage-deep)]">Full stop</em>.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-[var(--radius-lg)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-md)] border border-[color:var(--color-sage-soft)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-sage-soft)] text-[color:var(--color-sage-deep)]">
                  <Icon kind={p.icon} />
                </div>
                <h3 className="serif mt-5 text-2xl leading-tight">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] text-[color:var(--color-ink-muted)] leading-relaxed">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
