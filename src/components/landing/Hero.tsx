"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ParallaxStack from "@/components/motion/ParallaxStack";

function Polaroid({
  src,
  caption,
  tinted,
}: {
  src: string;
  caption: string;
  tinted?: "coral" | "sage" | "butter";
}) {
  const tintBg =
    tinted === "coral"
      ? "bg-[color:var(--color-coral-soft)]"
      : tinted === "sage"
      ? "bg-[color:var(--color-sage-soft)]"
      : tinted === "butter"
      ? "bg-[color:var(--color-butter-soft)]"
      : "";

  return (
    <div className="polaroid polaroid-lg relative w-[240px] sm:w-[260px]">
      <span className="tape" aria-hidden />
      <div className={`relative h-[260px] w-full overflow-hidden ${tintBg}`}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
        />
      </div>
      <p className="absolute inset-x-0 bottom-3 text-center font-[var(--font-fraunces)] italic text-sm text-[color:var(--color-ink-muted)]">
        {caption}
      </p>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      {/* Gradient wash */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 600px at 85% 0%, rgba(255,227,214,0.75), transparent 60%), radial-gradient(900px 500px at 10% 90%, rgba(214,228,219,0.55), transparent 60%), linear-gradient(180deg, #FBF8F3 0%, #FBF8F3 100%)",
        }}
      />
      {/* Scattered sparkle dots */}
      <svg
        className="pointer-events-none absolute left-[8%] top-[22%] h-5 w-5 text-[color:var(--color-butter)]"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2 l2.4 6.6 L21 11 l-6.6 2.4 L12 20 l-2.4 -6.6 L3 11 l6.6 -2.4 z" />
      </svg>
      <svg
        className="pointer-events-none absolute right-[18%] top-[18%] hidden h-4 w-4 text-[color:var(--color-sage)] sm:block"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2 l2.4 6.6 L21 11 l-6.6 2.4 L12 20 l-2.4 -6.6 L3 11 l6.6 -2.4 z" />
      </svg>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:px-8">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            New · Family portraits, in minutes
          </span>
          <h1 className="serif mt-5 text-[3.25rem] leading-[1.02] tracking-[-0.03em] sm:text-7xl md:text-[5.25rem]">
            Family photos
            <br />
            you'll <em className="serif-italic text-[color:var(--color-coral)]">actually</em> print.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
            Scattered iPhone photos in, frame-worthy family portrait out — in about two minutes. Pick a vibe, upload a few references, keep what you love.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/studio/roster" className="btn btn-coral btn-lg">
              Begin a shoot
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#gallery" className="btn btn-ghost btn-lg">
              See the gallery
            </a>
          </div>
          <div className="mt-8 flex items-center gap-5 text-sm text-[color:var(--color-ink-muted)]">
            <div className="flex -space-x-2" aria-hidden>
              {["#F26B4A", "#8AAE9B", "#FFD27A", "#4A3557"].map((c, i) => (
                <span
                  key={i}
                  className="inline-block h-7 w-7 rounded-full border-2 border-[color:var(--color-bg)]"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span>Loved by 2,400+ families this season</span>
          </div>
        </motion.div>

        {/* Polaroid stack */}
        <div className="relative mx-auto h-[520px] w-full max-w-[460px] sm:h-[560px]">
          <ParallaxStack
            className="h-full w-full"
            items={[
              {
                rotate: -8,
                offsetX: -14,
                offsetY: -4,
                depth: 14,
                zIndex: 1,
                content: <Polaroid src="/samples/g-2.jpg" caption="Autumn cabin" tinted="butter" />,
              },
              {
                rotate: 6,
                offsetX: 14,
                offsetY: 6,
                depth: 22,
                zIndex: 2,
                content: <Polaroid src="/samples/g-5.jpg" caption="Leibovitz studio" tinted="sage" />,
              },
              {
                rotate: -2,
                offsetX: 0,
                offsetY: -20,
                depth: 30,
                zIndex: 3,
                content: <Polaroid src="/samples/hero.jpg" caption="Golden hour, back porch" tinted="coral" />,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
