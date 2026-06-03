import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale } from "@/lib/i18n/locales";

export async function getRequestLocale() {
  const requestHeaders = await headers();
  const value = requestHeaders.get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
