"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES, type Locale, localizePath } from "@/lib/i18n/locales";

export default function LocaleSwitcher() {
  const router = useRouter();
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const t = useTranslations("LocaleSwitcher");
  const pendingSwitchRef = useRef<{ href: string; locale: Locale } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const pendingSwitch = pendingSwitchRef.current;
    if (!pendingSwitch) return;
    if (pendingSwitch.locale === activeLocale) {
      pendingSwitchRef.current = null;
      return;
    }

    const currentHref = `${window.location.pathname}${window.location.search}`;
    if (currentHref !== pendingSwitch.href) return;

    router.refresh();
  }, [activeLocale, pathname, query, router]);

  function switchLocale(href: string, locale: Locale) {
    pendingSwitchRef.current = { href, locale };
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1 text-xs font-semibold">
      <span className="sr-only">{t("label")}</span>
      {LOCALES.map((locale) => {
        const href = `${localizePath(pathname, locale)}${query ? `?${query}` : ""}`;
        const active = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            onClick={(event) => {
              if (active) return;
              event.preventDefault();
              switchLocale(href, locale);
            }}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)]"
                : "text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
            }`}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
