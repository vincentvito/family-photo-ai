"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/brand/BrandLogo";

type NavLink = {
  href: string;
  label: string;
};

const defaultLinks: NavLink[] = [
  { href: "#gallery", label: "Gallery" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export default function Nav({ links = defaultLinks }: { links?: NavLink[] }) {
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
        <BrandLogo href="/" />

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavAnchor key={link.href} href={link.href}>
              {link.label}
            </NavAnchor>
          ))}
        </div>

        <Link href="/sign-in" className="btn btn-coral btn-sm hidden md:inline-flex">
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
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-2 shadow-[var(--shadow-lg)] md:hidden">
            {links.map((link) => (
              <MobileNavLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </MobileNavLink>
            ))}
            <Link
              href="/sign-in"
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

function NavAnchor({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
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
      <Link href={href} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  );
}
