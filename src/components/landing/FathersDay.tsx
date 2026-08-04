"use client";

import Link from "@/components/i18n/LocalizedLink";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { useTranslations } from "next-intl";

const sourceImages = [
  {
    src: "/landing/fathers-day/fathers-day-dad-selfie.webp",
  },
  {
    src: "/landing/fathers-day/fathers-day-kids-selfie.webp",
  },
  {
    src: "/landing/fathers-day/fathers-day-grandma-selfie.webp",
  },
  {
    src: "/landing/fathers-day/fathers-day-pet-selfie.webp",
  },
];

export default function FathersDay() {
  const t = useTranslations("Landing.FathersDay");
  const translatedTiles = t.raw("tiles") as { label: string; alt: string }[];
  const sourceTiles = sourceImages.map((image, index) => ({ ...image, ...translatedTiles[index] }));
  return (
    <section className="px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="fathers-day-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[var(--radius-2xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
        <Reveal>
          <div>
            <span className="chip chip-butter">
              <span className="dot dot-butter" />
              {t("chip")}
            </span>
            <h2
              id="fathers-day-heading"
              className="serif mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl"
            >
              {t("title")}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[color:var(--color-ink-muted)] sm:text-lg">
              {t("body")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/studio/roster" className="btn btn-coral btn-lg spring-press">
                {t("cta")}
              </Link>
              <span className="text-sm font-semibold text-[color:var(--color-ink-muted)]">
                {t("preview")}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-butter)] p-4 shadow-[var(--shadow-md)] sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[0.86fr_auto_1.08fr] sm:items-center">
              <div className="grid grid-cols-2 gap-3">
                {sourceTiles.map((tile, index) => (
                  <figure
                    key={tile.label}
                    className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[color:rgba(31,26,36,0.12)] bg-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                  >
                    <Image
                      src={tile.src}
                      alt={tile.alt}
                      fill
                      sizes="(min-width: 1024px) 110px, (min-width: 640px) 18vw, 38vw"
                      className="object-cover"
                    />
                    <figcaption className="absolute inset-x-2 bottom-2 flex">
                      <span className="rounded-full bg-[color:rgba(31,26,36,0.76)] px-2.5 py-1 text-[0.68rem] font-semibold leading-none text-[color:var(--color-bg)] shadow-[var(--shadow-sm)] backdrop-blur">
                        {index + 1}. {tile.label}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-coral)] text-white shadow-[var(--shadow-md)] sm:rotate-0 rotate-90">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="h-5 w-5"
                >
                  <path d="M5 12h14" strokeLinecap="round" />
                  <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <figure className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:rgba(31,26,36,0.12)] bg-[color:rgba(251,248,243,0.92)] shadow-[var(--shadow-lg)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-bg)]">
                  <Image
                    src="/landing/fathers-day/fathers-day-final.webp"
                    alt={t("finalAlt")}
                    fill
                    sizes="(min-width: 1024px) 260px, (min-width: 640px) 42vw, 82vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-[color:rgba(31,26,36,0.09)] bg-[color:rgba(251,248,243,0.96)] p-4">
                  <p className="small-caps text-[color:var(--color-coral-deep)]">
                    {t("cardLabel")}
                  </p>
                  <p className="serif mt-1 text-xl leading-tight sm:text-2xl">{t("cardCaption")}</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
