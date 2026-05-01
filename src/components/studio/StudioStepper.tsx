"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const steps: {
  id: string;
  label: string;
  href: string;
  matches: RegExp;
  color: "coral" | "sage" | "butter" | "plum" | "ink";
}[] = [
  {
    id: "roster",
    label: "Roster",
    href: "/studio/roster",
    matches: /^\/studio\/roster/,
    color: "coral",
  },
  { id: "theme", label: "Vibe", href: "/studio/theme", matches: /^\/studio\/theme/, color: "sage" },
  {
    id: "create",
    label: "Create",
    href: "/studio/theme",
    matches: /^\/studio\/generate/,
    color: "butter",
  },
  {
    id: "refine",
    label: "Refine",
    href: "/studio/album",
    matches: /^\/studio\/refine/,
    color: "plum",
  },
  { id: "keep", label: "Keep", href: "/studio/album", matches: /^\/studio\/album/, color: "ink" },
];

export default function StudioStepper() {
  const pathname = usePathname() ?? "";
  const activeIdx = steps.findIndex((s) => s.matches.test(pathname));

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
                href={canClick ? s.href : "#"}
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
                {String(i + 1).padStart(2, "0")} · {s.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
