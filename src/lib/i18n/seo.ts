import { DEFAULT_LOCALE, LOCALES, type Locale, localizePath } from "@/lib/i18n/locales";

export const LOCALIZED_INDEX_PATHS = ["/"] as const;

export function absoluteLocalizedUrl(pathname: string, locale: Locale, siteUrl: string) {
  return new URL(localizePath(pathname, locale), siteUrl).toString();
}

export function languageAlternates(pathname: string, siteUrl: string) {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((locale) => [locale, absoluteLocalizedUrl(pathname, locale, siteUrl)]),
  );

  languages["x-default"] = absoluteLocalizedUrl(pathname, DEFAULT_LOCALE, siteUrl);
  return languages;
}
