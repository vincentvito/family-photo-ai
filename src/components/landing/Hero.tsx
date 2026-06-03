"use client";

import { motion, useReducedMotion } from "framer-motion";
import ParallaxStack from "@/components/motion/ParallaxStack";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LocalizedLink from "@/components/i18n/LocalizedLink";

const customerFaces = [
  "/avatars/hero-customer-1.webp",
  "/avatars/hero-customer-2.webp",
  "/avatars/hero-customer-3.webp",
  "/avatars/hero-customer-4.webp",
];

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

function AwardBadge() {
  const t = useTranslations("Hero");

  return (
    <div
      className="relative w-full max-w-[220px] sm:max-w-[250px]"
      aria-label={t("awardLabel")}
    >
      <div
        className="absolute inset-x-12 bottom-4 h-5 rounded-full bg-[color:rgba(242,107,74,0.1)] blur-xl"
        aria-hidden
      />
      <div className="relative flex min-h-[108px] items-center justify-center">
        <Image
          src="/laurel-hero.svg"
          alt=""
          width={300}
          height={245}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[102px] w-[250px] -translate-x-1/2 -translate-y-1/2 scale-x-[1.32] object-contain opacity-70 [filter:brightness(0)_saturate(100%)_invert(9%)_sepia(10%)_saturate(1350%)_hue-rotate(231deg)_brightness(88%)_contrast(90%)] sm:h-[112px] sm:w-[272px] sm:scale-x-[1.36]"
          aria-hidden
          priority
        />
        <div className="relative z-10 flex -translate-y-2 flex-col items-center pt-1 text-center">
          <span className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-[color:var(--color-coral-deep)]">
            {t("awardEyebrow")}
          </span>
          <span className="serif mt-0.5 text-[1.35rem] leading-none text-[color:var(--color-ink)]">
            {t("awardRank")}
          </span>
          <span className="mt-1 max-w-[5.9rem] text-[0.57rem] font-semibold leading-tight text-[color:var(--color-ink-muted)]">
            {t("awardText")}
          </span>
          <div className="mt-1.5 flex items-center gap-0.5 text-[color:var(--color-coral)] drop-shadow-[0_1px_1px_rgba(31,26,36,0.14)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg
                key={index}
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2.5 14.9 8.6l6.7.9-4.9 4.7 1.2 6.6L12 17.6l-5.9 3.2 1.2-6.6-4.9-4.7 6.7-.9L12 2.5Z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBar({ className = "" }: { className?: string }) {
  const t = useTranslations("Hero");

  return (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[color:var(--color-ink-muted)] ${className}`}
    >
      <div className="flex -space-x-2" aria-hidden>
        {customerFaces.map((src, i) => (
          <span
            key={src}
            className="relative inline-block h-7 w-7 overflow-hidden rounded-full border-2 border-[color:var(--color-bg)] bg-[color:var(--color-bg-soft)]"
          >
            <Image src={src} alt="" fill sizes="28px" className="object-cover" priority={i === 0} />
          </span>
        ))}
      </div>
      <span>{t("customers")}</span>
      <span className="hidden h-1 w-1 rounded-full bg-[color:var(--color-ink-muted)] sm:inline-block" />
      <span>{t("rating")}</span>
      <span className="hidden h-1 w-1 rounded-full bg-[color:var(--color-ink-muted)] sm:inline-block" />
      <LocalizedLink
        href="/gallery"
        className="font-semibold text-[color:var(--color-coral)] underline decoration-[color:rgba(242,107,74,0.35)] underline-offset-4 transition-colors hover:text-[color:var(--color-coral-deep)]"
      >
        {t("seeCreated")}
      </LocalizedLink>
    </div>
  );
}

function TestimonialMarquee() {
  const t = useTranslations("Hero");
  const testimonials = t.raw("testimonials") as string[];
  const testimonialMarqueeItems = [...testimonials, ...testimonials];

  return (
    <section
      className="border-y border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] py-5"
      aria-label={t("marqueeLabel")}
    >
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex w-max gap-4 px-4 [--marquee-duration:72s]">
          {testimonialMarqueeItems.map((quote, index) => (
            <figure
              key={`${quote}-${index}`}
              className="w-[min(82vw,560px)] shrink-0 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-5 py-4 shadow-[var(--shadow-sm)]"
            >
              <blockquote className="text-sm leading-relaxed text-[color:var(--color-ink)] sm:text-base">
                &quot;{quote}&quot;
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const t = useTranslations("Hero");

  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-40 sm:pb-28 sm:pt-48">
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
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="chip chip-coral w-fit">
                <span className="dot dot-coral" />
                {t("chip")}
              </span>
              <AwardBadge />
            </div>
            <h1 className="serif mt-5 text-[3.05rem] leading-[1.02] tracking-[-0.03em] sm:text-7xl md:text-[5rem]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              {t("body")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LocalizedLink href="/studio/roster" className="btn btn-coral btn-lg">
                {t("primaryCta")}
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
              </LocalizedLink>
              <a href="#gallery" className="btn btn-ghost btn-lg">
                {t("secondaryCta")}
              </a>
            </div>
            <p className="mt-3 text-sm font-medium text-[color:var(--color-ink-muted)]">
              No credit card required. Add an email only when you are ready to generate.
            </p>
            <StatsBar className="mt-8 hidden sm:flex" />
          </motion.div>

          {/* Polaroid stack */}
          <div>
            <div className="relative mx-auto h-[520px] w-full max-w-[460px] sm:h-[560px]">
              <ParallaxStack
                className="h-full w-full"
                items={[
                  {
                    label: t("polaroids.autumnLabel"),
                    rotate: -8,
                    offsetX: -14,
                    offsetY: -4,
                    depth: 14,
                    zIndex: 1,
                    content: (
                      <Polaroid
                        src="/samples/g-2.jpg"
                        caption={t("polaroids.autumnCaption")}
                        tinted="butter"
                      />
                    ),
                  },
                  {
                    label: t("polaroids.studioLabel"),
                    rotate: 6,
                    offsetX: 14,
                    offsetY: 6,
                    depth: 22,
                    zIndex: 2,
                    content: (
                      <Polaroid
                        src="/samples/g-5.jpg"
                        caption={t("polaroids.studioCaption")}
                        tinted="sage"
                      />
                    ),
                  },
                  {
                    label: t("polaroids.goldenLabel"),
                    rotate: -2,
                    offsetX: 0,
                    offsetY: -20,
                    depth: 30,
                    zIndex: 3,
                    content: (
                      <Polaroid
                        src="/samples/hero.jpg"
                        caption={t("polaroids.goldenCaption")}
                        tinted="coral"
                      />
                    ),
                  },
                ]}
              />
            </div>
            <StatsBar className="mx-auto mt-2 sm:hidden" />
          </div>
        </div>
      </section>
      <TestimonialMarquee />
    </>
  );
}
