import { getRequestConfig } from "next-intl/server";
import { getMessages } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/server";

export default getRequestConfig(async () => {
  const locale = await getRequestLocale();

  return {
    locale,
    messages: getMessages(locale),
  };
});
