"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "@/components/i18n/LocalizedLink";
import Reveal from "@/components/motion/Reveal";

const STEPS = ["create", "download", "print"] as const;

export default function PrintKeepsakes() {
  const t = useTranslations("Landing.PrintKeepsakes");

  return (
    <section
      id="prints-and-gifts"
      className="relative isolate overflow-hidden px-6 py-20 sm:px-8 sm:py-28"
    >
      <div
        className="absolute inset-0 -z-20 bg-[color:var(--color-bg-tinted-sage)]"
        aria-hidden
      />
      <div
        className="absolute -right-28 top-20 -z-10 h-80 w-80 rounded-full bg-[color:rgba(240,162,144,0.2)] blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 left-[8%] -z-10 h-72 w-72 rounded-full bg-[color:rgba(242,211,122,0.24)] blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16">
        <Reveal>
          <div className="max-w-xl">
            <span className="chip chip-sage">
              <span className="dot dot-sage" />
              {t("chip")}
            </span>

            <h2 className="serif mt-5 text-4xl leading-[1.03] tracking-[-0.03em] sm:text-6xl">
              {t("titleBefore")}{" "}
              <em className="serif-italic text-[color:var(--color-coral-deep)]">
                {t("titleEmphasis")}
              </em>
              .
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-[color:var(--color-ink-muted)]">
              {t("body")}
            </p>

            <ol className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {STEPS.map((step, index) => (
                <li key={step} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-bg-elevated)] text-xs font-bold text-[color:var(--color-coral-deep)] shadow-[var(--shadow-sm)]"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[color:var(--color-ink)]">
                      {t("steps." + step + ".title")}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[color:var(--color-ink-muted)]">
                      {t("steps." + step + ".body")}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/studio/roster" className="btn btn-coral">
                {t("cta")}
                <ArrowIcon />
              </Link>
              <span className="max-w-[17rem] text-xs leading-5 text-[color:var(--color-ink-muted)]">
                {t("fulfillment")}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mx-auto w-full max-w-[46rem] pb-10 sm:pb-16">
            <figure className="group relative ml-auto w-[88%] overflow-hidden rounded-[clamp(1.25rem,3vw,2.5rem)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-xl)] sm:w-[82%]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/merch/family-portrait-framed-print.webp"
                  alt={t("images.frame")}
                  fill
                  sizes="(min-width: 1024px) 42vw, (min-width: 640px) 70vw, 88vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.025]"
                />
              </div>
              <figcaption className="absolute bottom-4 left-4 hidden rounded-full bg-[color:rgba(251,248,243,0.92)] px-3 py-1.5 text-xs font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur-sm sm:block">
                {t("labels.wallArt")}
              </figcaption>
            </figure>

            <figure className="group absolute -bottom-1 left-0 w-[47%] rotate-[-3deg] overflow-hidden rounded-[clamp(1rem,2vw,1.75rem)] border-[6px] border-[color:var(--color-bg-tinted-sage)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-xl)] transition-transform duration-500 ease-[var(--ease-out-soft)] hover:rotate-0 sm:w-[45%]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/merch/family-portrait-mug-tote.webp"
                  alt={t("images.mugTote")}
                  fill
                  sizes="(min-width: 1024px) 22vw, 38vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
                />
              </div>
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-[color:rgba(251,248,243,0.92)] px-2.5 py-1 text-[0.68rem] font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur-sm">
                {t("labels.mugsTotes")}
              </figcaption>
            </figure>

            <figure className="group absolute -bottom-6 right-[4%] w-[40%] rotate-[4deg] overflow-hidden rounded-[clamp(1rem,2vw,1.75rem)] border-[6px] border-[color:var(--color-bg-tinted-sage)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-xl)] transition-transform duration-500 ease-[var(--ease-out-soft)] hover:rotate-0 sm:w-[38%]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/merch/family-portrait-shirt-cards.webp"
                  alt={t("images.shirtCards")}
                  fill
                  sizes="(min-width: 1024px) 19vw, 34vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
                />
              </div>
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-[color:rgba(251,248,243,0.92)] px-2.5 py-1 text-[0.68rem] font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur-sm">
                {t("labels.shirtsCards")}
              </figcaption>
            </figure>

            <div
              className="absolute right-2 top-6 hidden rotate-3 rounded-[var(--radius-md)] bg-[color:var(--color-butter)] px-4 py-3 shadow-[var(--shadow-md)] sm:block"
              aria-hidden
            >
              <p className="serif text-lg italic text-[color:var(--color-ink)]">{t("keepsakeNote")}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
