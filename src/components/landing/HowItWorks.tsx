"use client";

import Reveal from "@/components/motion/Reveal";
import { motion } from "framer-motion";

type Step = {
  n: number;
  title: string;
  body: string;
  chip: "coral" | "sage" | "butter";
  visual: "roster" | "vibe" | "keep";
};

const steps: Step[] = [
  {
    n: 1,
    title: "Your roster",
    body: "Upload a handful of reference photos of everyone - adults, little ones, and any selected family pets. We use them as visual guides so each portrait stays close to the people you love.",
    chip: "coral",
    visual: "roster",
  },
  {
    n: 2,
    title: "Pick a vibe",
    body: "Choose a theme - Golden Hour Beach, a cabin in October, a Leibovitz studio, a Pixar family. You pick the feeling; we handle the rest.",
    chip: "sage",
    visual: "vibe",
  },
  {
    n: 3,
    title: "Yours to keep",
    body: 'Favorite the ones you love. Nudge anything that isn\'t quite right ("more smiling", "swap the navy jacket"). Print, frame, or slip into a card.',
    chip: "butter",
    visual: "keep",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden px-6 py-20 sm:px-8 sm:py-28">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[58%] bg-[linear-gradient(180deg,rgba(235,242,236,0.68),rgba(251,248,243,0))]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid gap-5 md:grid-cols-[1fr_0.72fr] md:items-end">
            <div>
              <span className="chip chip-plum">
                <span className="dot dot-plum" />
                How it works
              </span>
              <h2 className="serif mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                Three steps. About{" "}
                <em className="serif-italic text-[color:var(--color-plum)]">two minutes</em>.
              </h2>
            </div>
            <p className="max-w-md text-[color:var(--color-ink-muted)] md:justify-self-end md:text-right">
              Simple enough for a toddler&apos;s nap-time. Polished enough to frame.
            </p>
          </div>
        </Reveal>

        <ol className="mt-12 grid gap-5 lg:grid-cols-[1.04fr_0.92fr_1.04fr] lg:items-stretch">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <motion.li
                className="group flex h-full min-h-[560px] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]"
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
              >
                <StepVisual kind={s.visual} />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className={`chip chip-${s.chip} w-fit`}>
                    Step {String(s.n).padStart(2, "0")}
                  </span>
                  <h3 className="serif mt-6 text-3xl leading-tight tracking-[-0.02em]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[color:var(--color-ink-muted)] leading-relaxed">
                    {s.body}
                  </p>
                </div>
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
    const selfies = [
      {
        label: "selfie_01.jpg",
        className: "left-6 top-10 h-52 w-[38%] -rotate-5",
        position: "5% 50%",
      },
      {
        label: "selfie_02.jpg",
        className: "right-6 top-7 h-36 w-[43%] rotate-4",
        position: "96% 8%",
      },
      {
        label: "selfie_03.jpg",
        className: "right-9 bottom-10 h-40 w-[42%] -rotate-2",
        position: "94% 94%",
      },
    ];

    return (
      <div className="relative h-[310px] overflow-hidden bg-[color:var(--color-bg-tinted-coral)]">
        {selfies.map((selfie, index) => (
          <SelfieUpload
            key={selfie.label}
            label={selfie.label}
            className={`absolute ${selfie.className} ${
              index === 0 ? "shadow-[var(--shadow-xl)]" : "shadow-[var(--shadow-lg)]"
            }`}
            position={selfie.position}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,240,232,0),rgba(255,240,232,0.96))]" />
        <span className="chip chip-coral absolute bottom-5 left-5 bg-[color:rgba(255,255,255,0.86)] backdrop-blur">
          3 selfies uploaded
        </span>
      </div>
    );
  }

  if (kind === "vibe") {
    return (
      <div className="relative h-[310px] overflow-hidden bg-[color:var(--color-bg-tinted-sage)]">
        <div className="absolute inset-y-8 -left-10 flex w-[calc(100%+80px)] gap-3 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:-translate-x-5">
          {[
            "/samples/theme-golden-hour-beach.jpg",
            "/samples/theme-leibovitz.jpg",
            "/samples/theme-autumn-cabin.jpg",
            "/samples/theme-pixar.jpg",
          ].map((src, i) => (
            <div
              key={src}
              className="h-full min-w-[42%] overflow-hidden rounded-[18px] border border-[color:rgba(255,255,255,0.7)] bg-cover bg-center shadow-[var(--shadow-md)]"
              style={{
                backgroundImage: `url(${src})`,
                transform: `translateY(${i % 2 === 0 ? "10px" : "-6px"}) rotate(${
                  i % 2 === 0 ? "-2deg" : "2deg"
                })`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(235,242,236,0),rgba(235,242,236,0.98))]" />
        <span className="chip chip-sage absolute bottom-5 left-5 bg-[color:rgba(255,255,255,0.86)] backdrop-blur">
          Moodboard locked
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-[310px] overflow-hidden bg-[color:var(--color-bg-tinted-butter)]">
      <div className="absolute left-1/2 top-6 w-[72%] -translate-x-1/2 rotate-2 bg-white p-3 pb-11 shadow-[var(--shadow-xl)] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:rotate-0 group-hover:scale-[1.03]">
        <div
          className="aspect-[4/3] bg-cover bg-center"
          style={{ backgroundImage: "url(/samples/after-watercolor-family.jpg)" }}
        />
        <p className="absolute inset-x-0 bottom-4 text-center font-[var(--font-fraunces)] text-sm italic text-[color:var(--color-ink-muted)]">
          Print-ready favorite
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,246,225,0),rgba(255,246,225,0.98))]" />
      <span className="chip chip-butter absolute bottom-5 left-5 bg-[color:rgba(255,255,255,0.86)] backdrop-blur">
        Final portrait out
      </span>
    </div>
  );
}

function SelfieUpload({
  label,
  className,
  position,
}: {
  label: string;
  className: string;
  position: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[22px] border-[6px] border-white bg-white ${className}`}>
      <div
        className="h-[calc(100%-34px)] bg-cover"
        style={{
          backgroundImage: "url(/samples/before-watercolor-family.jpg)",
          backgroundPosition: position,
          backgroundSize: "225%",
        }}
      />
      <div className="flex h-[34px] items-center justify-between px-3 text-[0.68rem] font-semibold text-[color:var(--color-ink-muted)]">
        <span>{label}</span>
        <span className="h-2 w-2 rounded-full bg-[color:var(--color-coral)]" aria-hidden />
      </div>
    </div>
  );
}
