"use client";

import Reveal from "@/components/motion/Reveal";
import { motion } from "framer-motion";

type Step = {
  n: number;
  title: string;
  body: string;
  panel: "coral" | "sage" | "butter";
  chip: "coral" | "sage" | "butter";
  visual: "roster" | "vibe" | "keep";
};

const steps: Step[] = [
  {
    n: 1,
    title: "Your roster",
    body: "Upload a handful of reference photos of everyone — adults, little ones, the dog. We lock in their faces so every portrait looks like them.",
    panel: "coral",
    chip: "coral",
    visual: "roster",
  },
  {
    n: 2,
    title: "Pick a vibe",
    body: "Choose a theme — Golden Hour Beach, a cabin in October, a Leibovitz studio, a Pixar family. You pick the feeling; we handle the rest.",
    panel: "sage",
    chip: "sage",
    visual: "vibe",
  },
  {
    n: 3,
    title: "Yours to keep",
    body: "Favorite the ones you love. Nudge anything that isn't quite right (\"more smiling\", \"swap the navy jacket\"). Print, frame, or slip into a card.",
    panel: "butter",
    chip: "butter",
    visual: "keep",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <span className="chip chip-plum">
              <span className="dot dot-plum" />
              How it works
            </span>
            <h2 className="serif mx-auto mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
              Three steps. About <em className="serif-italic text-[color:var(--color-plum)]">two minutes</em>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[color:var(--color-ink-muted)]">
              Simple enough for a toddler&apos;s nap-time. Polished enough to frame.
            </p>
          </div>
        </Reveal>

        <ol className="mt-16 grid gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <motion.li
                className={`panel-${s.panel} group flex h-full flex-col p-6 sm:p-8`}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
              >
                <div className="flex items-center justify-between">
                  <span className={`chip chip-${s.chip} !bg-white/70`}>Step {String(s.n).padStart(2, "0")}</span>
                  <div className="transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-[1.04]">
                    <StepVisual kind={s.visual} />
                  </div>
                </div>
                <h3 className="serif mt-8 text-3xl leading-tight tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="mt-3 text-[color:var(--color-ink-muted)] leading-relaxed">
                  {s.body}
                </p>
              </motion.li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepVisual({ kind }: { kind: Step["visual"] }) {
  if (kind === "roster") {
    return (
      <svg className="h-20 w-24" viewBox="0 0 96 80" fill="none" aria-hidden>
        <rect x="20" y="12" width="42" height="52" rx="3" fill="#FFFFFF" stroke="#F0B4A2" />
        <rect x="25" y="18" width="32" height="28" rx="2" fill="#FFE3D6" />
        <circle cx="41" cy="29" r="8" fill="#F26B4A" />
        <path d="M28 46c4-8 22-8 26 0" stroke="#D4502F" strokeWidth="3" strokeLinecap="round" />
        <rect x="34" y="7" width="42" height="52" rx="3" fill="#FFFFFF" stroke="#D8CEC0" />
        <rect x="39" y="13" width="32" height="28" rx="2" fill="#EBF2EC" />
        <circle cx="51" cy="24" r="7" fill="#8AAE9B" />
        <circle cx="61" cy="24" r="7" fill="#4A3557" />
        <path d="M42 41c4-7 23-7 27 0" stroke="#5E8572" strokeWidth="3" strokeLinecap="round" />
        <circle cx="72" cy="16" r="8" fill="#FFD27A" />
        <path d="M72 12v8M68 16h8" stroke="#4A3557" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "vibe") {
    return (
      <svg className="h-20 w-24" viewBox="0 0 96 80" fill="none" aria-hidden>
        <path d="M22 58c12 7 36 8 52-2" stroke="#4A3557" strokeWidth="3" strokeLinecap="round" />
        <rect x="24" y="24" width="13" height="34" rx="4" fill="#F26B4A" />
        <rect x="41" y="16" width="13" height="42" rx="4" fill="#FFD27A" />
        <rect x="58" y="22" width="13" height="36" rx="4" fill="#4A3557" />
        <circle cx="30" cy="17" r="2" fill="#8AAE9B" />
        <path d="M36 10l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4z" fill="#8AAE9B" />
        <path d="M66 63l5-2 1 6" stroke="#F26B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="61" r="3" fill="#F26B4A" />
      </svg>
    );
  }

  return (
    <svg className="h-20 w-24" viewBox="0 0 96 80" fill="none" aria-hidden>
      <rect x="30" y="12" width="38" height="50" rx="4" fill="#FFFFFF" stroke="#E6B94E" />
      <rect x="36" y="19" width="26" height="28" rx="2" fill="#FFF0C9" />
      <circle cx="48" cy="30" r="7" fill="#F26B4A" />
      <path d="M39 47c4-7 18-7 22 0" stroke="#D4502F" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 65h44" stroke="#4A3557" strokeWidth="3" strokeLinecap="round" />
      <circle cx="68" cy="53" r="11" fill="#F26B4A" />
      <path
        d="M68 59s-6-3.5-7.5-7.2c-1-2.6 1-4.8 3.3-4.8 1.4 0 2.6.7 3.2 1.8.7-1.1 1.8-1.8 3.2-1.8 2.3 0 4.3 2.2 3.3 4.8C74 55.5 68 59 68 59z"
        fill="#FFFFFF"
      />
      <path d="M63 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="#8AAE9B" />
    </svg>
  );
}
