"use client";

import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { motion } from "framer-motion";

type Step = {
  n: number;
  title: string;
  body: string;
  illustration: string;
  panel: "coral" | "sage" | "butter";
  chip: "coral" | "sage" | "butter";
};

const steps: Step[] = [
  {
    n: 1,
    title: "Your roster",
    body: "Upload a handful of reference photos of everyone — adults, little ones, the dog. We lock in their faces so every portrait looks like them.",
    illustration: "/illustrations/step-roster.svg",
    panel: "coral",
    chip: "coral",
  },
  {
    n: 2,
    title: "Pick a vibe",
    body: "Choose a theme — Golden Hour Beach, a cabin in October, a Leibovitz studio, a Pixar family. You pick the feeling; we handle the rest.",
    illustration: "/illustrations/step-vibe.svg",
    panel: "sage",
    chip: "sage",
  },
  {
    n: 3,
    title: "Yours to keep",
    body: "Favorite the ones you love. Nudge anything that isn't quite right (\"more smiling\", \"swap the navy jacket\"). Print, frame, or slip into a card.",
    illustration: "/illustrations/step-keep.svg",
    panel: "butter",
    chip: "butter",
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
              Simple enough for a toddler's nap-time. Polished enough to frame.
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
                  <div className="relative h-16 w-16 transition-transform duration-500 group-hover:-rotate-6">
                    <Image src={s.illustration} alt="" fill className="object-contain" />
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
