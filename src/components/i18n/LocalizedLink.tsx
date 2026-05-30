"use client";

import Link, { type LinkProps } from "next/link";
import { useLocale } from "next-intl";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { type Locale, localizePath } from "@/lib/i18n/locales";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export default function LocalizedLink({ href, children, ...props }: Props) {
  const locale = useLocale() as Locale;
  const localizedHref = typeof href === "string" ? localizePath(href, locale) : href;
  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}
