import { listRoster } from "@/lib/roster-queries";
import RosterPageClient from "@/components/studio/RosterPageClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGuestOwnerId } from "@/lib/guest-owner";

export const dynamic = "force-dynamic";

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await getGuestOwnerId());
  if (!ownerId) return <RosterPageClient initialRoster={[]} checkoutStatus={checkout} />;
  const roster = await listRoster(ownerId);
  return (
    <RosterPageClient
      initialRoster={roster}
      checkoutStatus={checkout}
      hideReferenceImages={!user}
    />
  );
}
