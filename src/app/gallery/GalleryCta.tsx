"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

function getVibeHref(themeId: string, isLoggedIn: boolean) {
  if (isLoggedIn) return `/studio/theme?theme=${encodeURIComponent(themeId)}`;
  return "/studio/roster";
}

export default function GalleryCta({ themeId }: { themeId: string }) {
  const { data } = authClient.useSession();
  const href = getVibeHref(themeId, Boolean(data?.user));

  return (
    <Link href={href} className="btn btn-coral btn-lg w-full justify-center">
      Use this Vibe
    </Link>
  );
}
