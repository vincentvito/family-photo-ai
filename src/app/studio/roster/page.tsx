import { listRoster } from "@/lib/roster-queries";
import RosterPageClient from "@/components/studio/RosterPageClient";
import { getCurrentUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const user = await getCurrentUser();
  if (!user) return <RosterPageClient initialRoster={[]} />;
  const roster = await listRoster(user.id);
  return <RosterPageClient initialRoster={roster} />;
}
