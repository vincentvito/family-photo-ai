import { listRoster } from "@/lib/roster-queries";
import RosterPageClient from "@/components/studio/RosterPageClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { cookies } from "next/headers";
import { getTempRosterOwnerFromCookieValue, TEMP_ROSTER_COOKIE } from "@/lib/temp-roster";

export const dynamic = "force-dynamic";

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    const roster = await listRoster(user.id);
    return (
      <RosterPageClient
        initialRoster={roster}
        checkoutStatus={checkout}
        canPreviewPhotos
        isAuthenticated
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
    />
  );
}
