import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, stripLocalePrefix } from "@/lib/i18n/locales";

const AI_HOSTS = new Set(["familyshoot.ai", "www.familyshoot.ai"]);
const COM_ORIGIN = "https://familyshoot.com";

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname, search } = request.nextUrl;

  if (!AI_HOSTS.has(host)) return localeProxy(request);

  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = "/cards";
    return NextResponse.rewrite(url);
  }

  return NextResponse.redirect(`${COM_ORIGIN}${pathname}${search}`, 301);
}

function localeProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const maybeLocale = pathname.split("/")[1];
  const requestHeaders = new Headers(request.headers);

  if (!isLocale(maybeLocale)) {
    requestHeaders.set(LOCALE_HEADER, DEFAULT_LOCALE);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  requestHeaders.set(LOCALE_HEADER, maybeLocale);

  const url = request.nextUrl.clone();
  url.pathname = stripLocalePrefix(pathname);
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  // Run on everything except Next internals and the public assets the
  // landing itself needs to load.
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|ai-landing|familyshoot-logo\\.svg|icon\\.svg|apple-touch-icon\\.png).*)",
  ],
};
