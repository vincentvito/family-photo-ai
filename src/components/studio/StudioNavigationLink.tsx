"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { getStudioNavigationHref, studioSearchParamsFromUrl } from "@/lib/studio-intent";

export default function StudioNavigationLink({
  href,
  ...props
}: Omit<ComponentProps<typeof LocalizedLink>, "href"> & { href: string }) {
  const searchParams = useSearchParams();
  const destination = getStudioNavigationHref(href, studioSearchParamsFromUrl(searchParams));
  return <LocalizedLink href={destination} {...props} />;
}
