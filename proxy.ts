import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AI_HOSTS = new Set(['familyshoot.ai', 'www.familyshoot.ai']);
const COM_ORIGIN = 'https://familyshoot.com';

export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];

  if (!AI_HOSTS.has(host)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;

  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone();
    url.pathname = '/cards-landing';
    return NextResponse.rewrite(url);
  }

  return NextResponse.redirect(`${COM_ORIGIN}${pathname}${search}`, 301);
}

export const config = {
  // Run on everything except Next internals and the public assets the
  // landing itself needs to load.
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|ai-landing|familyshoot-logo\\.svg|icon\\.svg|apple-touch-icon\\.png).*)',
  ],
};
