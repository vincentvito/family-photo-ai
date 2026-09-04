"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getThemeStudioHref } from "@/lib/theme-links";
import type { ThemeCategory } from "@/lib/themes";

function getVibeHref(themeId: string, themeCategory: ThemeCategory, isLoggedIn: boolean) {
  if (isLoggedIn) return getThemeStudioHref({ id: themeId, category: themeCategory });
  return "/studio/roster";
}

export default function GalleryCta({
  themeId,
  themeCategory,
}: {
  themeId: string;
  themeCategory: ThemeCategory;
}) {
  const { data } = authClient.useSession();
  const href = getVibeHref(themeId, themeCategory, Boolean(data?.user));

  return (
    <Link href={href} className="btn btn-coral btn-lg w-full justify-center">
      Use this Vibe
    </Link>
  );
}
