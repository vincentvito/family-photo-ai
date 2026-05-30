"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import BrandLogo from "@/components/brand/BrandLogo";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { type Locale, localizePath } from "@/lib/i18n/locales";

type NavLink = {
  href: string;
  label: string;
};

export default function Nav({
  links,
  topOffsetClass = "top-0",
}: {
  links?: NavLink[];
  topOffsetClass?: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navLinks =
    links ??
    [
      { href: "#gallery", label: t("gallery") },
      { href: "/trending", label: `${t("trending")} 🔥` },
      { href: "#how", label: t("how") },
      { href: "#pricing", label: t("pricing") },
      { href: "#faq", label: t("faq") },
    ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 ${topOffsetClass} z-30 flex justify-center px-4 pt-4 transition-all duration-300 ${
        scrolled ? "pt-3" : "pt-6"
      }`}
    >
      <div
        className={`relative flex w-full max-w-6xl items-center justify-between gap-3 rounded-full px-3 py-2.5 transition-all duration-300 sm:gap-6 sm:px-5 ${
          scrolled
            ? "bg-[color:var(--color-bg-elevated)]/85 shadow-md backdrop-blur-md border border-[color:var(--color-line)]"
            : "bg-transparent border border-transparent"
        }`}
      >
        <BrandLogo href={localizePath("/", locale)} />

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavAnchor key={link.href} href={link.href}>
              {link.label}
            </NavAnchor>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LocaleSwitcher />
          <LocalizedLink href="/sign-in" className="btn btn-coral btn-sm">
            {t("startShoot")}
          </LocalizedLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="spring-press inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] md:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
        >
          <span className="sr-only">{open ? t("closeMenuShort") : t("openMenuShort")}</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-2 shadow-[var(--shadow-lg)] md:hidden">
            <div className="px-2 pb-2">
              <LocaleSwitcher />
            </div>
            {navLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </MobileNavLink>
            ))}
            <LocalizedLink
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="btn btn-coral mt-2 w-full"
            >
              {t("startShoot")}
            </LocalizedLink>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavAnchor({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]";

  if (href.startsWith("/")) {
    return (
      <LocalizedLink href={href} className={className}>
        {children}
      </LocalizedLink>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick: () => void;
}) {
  const className =
    "block rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)]";

  if (href.startsWith("/")) {
    return (
      <LocalizedLink href={href} onClick={onClick} className={className}>
        {children}
      </LocalizedLink>
    );
  }

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
