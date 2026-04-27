"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

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
        className={`flex w-full max-w-6xl items-center justify-between gap-6 rounded-full px-5 py-2.5 transition-all duration-300 ${
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
          <span className="serif text-lg tracking-tight">Family&nbsp;Photoshoot</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
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

        <Link href="/studio/roster" className="btn btn-coral btn-sm">
          Start a shoot
        </Link>
      </div>
    </nav>
  );
}
