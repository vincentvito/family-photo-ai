"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { type Locale, localizePath, stripLocalePrefix } from "@/lib/i18n/locales";

const steps: {
  id: string;
  labelKey: "roster" | "format" | "vibe" | "create" | "regenerate" | "keep";
  href: string;
  matches: RegExp;
  color: "coral" | "sage" | "butter" | "plum" | "ink";
}[] = [
  {
    id: "roster",
    labelKey: "roster",
    href: "/studio/roster",
    matches: /^\/studio\/roster/,
    color: "coral",
  },
  {
    id: "output",
    labelKey: "format",
    href: "/studio/output",
    matches: /^\/studio\/output/,
    color: "butter",
  },
  {
    id: "theme",
    labelKey: "vibe",
    href: "/studio/output",
    matches: /^\/studio\/theme/,
    color: "sage",
  },
  {
    id: "create",
    labelKey: "create",
    href: "/studio/output",
    matches: /^\/studio\/generate/,
    color: "coral",
  },
  {
    id: "refine",
    labelKey: "regenerate",
    href: "/studio/album",
    matches: /^\/studio\/refine/,
    color: "plum",
  },
  { id: "keep", labelKey: "keep", href: "/studio/album", matches: /^\/studio\/album/, color: "ink" },
];

export default function StudioStepper() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Studio");
  const pathname = usePathname() ?? "";
  const activeIdx = steps.findIndex((s) => s.matches.test(stripLocalePrefix(pathname)));

  return (
    <nav className="hidden md:block">
      <ol className="flex items-center gap-1.5 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1 shadow-[var(--shadow-sm)]">
        {steps.map((s, i) => {
          const active = i === activeIdx;
          const past = activeIdx >= 0 && i < activeIdx;
          const canClick = past || active;

          return (
            <li key={s.id} className="relative">
              <Link
                href={canClick ? localizePath(s.href, locale) : "#"}
                aria-current={active ? "step" : undefined}
                className={`relative z-10 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.04em] transition-colors ${
                  active
                    ? "text-white"
                    : past
                      ? "text-[color:var(--color-ink)] hover:text-[color:var(--color-coral-deep)]"
                      : "text-[color:var(--color-ink-faint)] pointer-events-none"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="stepper-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-[color:var(--color-ink)]"
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  />
                )}
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    active
                      ? "bg-[color:var(--color-coral)]"
                      : past
                        ? `bg-[color:var(--color-${s.color === "ink" ? "coral" : s.color})]`
                        : "bg-[color:var(--color-line-strong)]"
                  }`}
                  aria-hidden
                />
                {String(i + 1).padStart(2, "0")} · {t(s.labelKey)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
