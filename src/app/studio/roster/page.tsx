import { listRoster } from "@/lib/roster-queries";
import RosterPageClient from "@/components/studio/RosterPageClient";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const roster = await listRoster();
  return <RosterPageClient initialRoster={roster} />;
}
