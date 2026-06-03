import de from "@/messages/de.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import ru from "@/messages/ru.json";
import uk from "@/messages/uk.json";

export const LOCALES = ["en", "de", "uk", "ru", "es"] as const;
export const DEFAULT_LOCALE = "en";
export const LOCALE_HEADER = "x-familyshoot-locale";

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  uk: "Українська",
  ru: "Русский",
  es: "Español",
};

const messages = { en, de, uk, ru, es };

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (!isLocale(maybeLocale)) return pathname || "/";
  const stripped = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

export function localizePath(pathname: string, locale: Locale) {
  if (!pathname.startsWith("/")) return pathname;
  const stripped = stripLocalePrefix(pathname);
  if (locale === DEFAULT_LOCALE) return stripped;
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}
