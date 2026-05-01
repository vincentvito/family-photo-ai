"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-30 flex justify-center px-4 pt-4 transition-all duration-300 ${
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
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[color:var(--color-ink)]"
        >
          <span className="relative inline-flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[color:var(--color-coral)]" aria-hidden />
            <span className="relative text-[10px] font-bold tracking-[0.18em] text-white">FP</span>
          </span>
          <span className="serif hidden text-lg tracking-tight sm:inline">Family&nbsp;Photoshoot</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#gallery"
            className="text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            Gallery
          </a>
          <a
            href="#how"
            className="text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            Pricing
          </a>
        </div>

        <Link href="/studio/roster" className="btn btn-coral btn-sm hidden md:inline-flex">
          Start a shoot
        </Link>

        <button
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="spring-press inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
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
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-2 shadow-[var(--shadow-lg)] md:hidden">
            <MobileNavLink href="#gallery" onClick={() => setOpen(false)}>
              Gallery
            </MobileNavLink>
            <MobileNavLink href="#how" onClick={() => setOpen(false)}>
              How it works
            </MobileNavLink>
            <MobileNavLink href="#pricing" onClick={() => setOpen(false)}>
              Pricing
            </MobileNavLink>
            <Link
              href="/studio/roster"
              onClick={() => setOpen(false)}
              className="btn btn-coral mt-2 w-full"
            >
              Start a shoot
            </Link>
          </div>
        )}
      </div>
    </nav>
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
  return (
    <a
      href={href}
      onClick={onClick}
      className="block rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)]"
    >
      {children}
    </a>
  );
}
