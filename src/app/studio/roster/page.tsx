import { listRoster } from "@/lib/roster-queries";
import RosterPageClient from "@/components/studio/RosterPageClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { cookies } from "next/headers";
import { getTempRosterOwnerFromCookieValue, TEMP_ROSTER_COOKIE } from "@/lib/temp-roster";
import { THEMES } from "@/lib/themes";
import { getThemeDisplayName } from "@/data/theme-display-names";
import {
  getStudioIntentHref,
  parseStudioIntent,
  type StudioSearchParams,
} from "@/lib/studio-intent";

export const dynamic = "force-dynamic";

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<StudioSearchParams>;
}) {
  const params = await searchParams;
  const checkout = typeof params.checkout === "string" ? params.checkout : undefined;
  const intent = parseStudioIntent(params, THEMES);
  const selectedTheme =
    intent?.kind === "theme" ? THEMES.find((theme) => theme.id === intent.themeId) : null;
  const creationIntent = intent
    ? {
        href: getStudioIntentHref(intent),
        label: selectedTheme ? getThemeDisplayName(selectedTheme) : "your custom scene",
        ...(selectedTheme ? { image: selectedTheme.coverImage } : {}),
        ...(intent.kind === "prompt" ? { prompt: intent.prompt } : {}),
      }
    : undefined;
  const user = await getCurrentUser();
  if (user) {
    const roster = await listRoster(user.id);
    return (
      <RosterPageClient
        initialRoster={roster}
        checkoutStatus={checkout}
        canPreviewPhotos
        isAuthenticated
        creationIntent={creationIntent}
      />
    );
  }

  const cookieStore = await cookies();
  const tempOwner = getTempRosterOwnerFromCookieValue(cookieStore.get(TEMP_ROSTER_COOKIE)?.value);
  const roster = tempOwner ? await listRoster(tempOwner.userId) : [];
  return (
    <RosterPageClient
      initialRoster={roster}
      checkoutStatus={checkout}
      canPreviewPhotos={false}
      isAuthenticated={false}
      creationIntent={creationIntent}
    />
  );
}
