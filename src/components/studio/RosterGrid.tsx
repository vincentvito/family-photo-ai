import PersonCard from "./PersonCard";
import type { RosterEntry } from "@/lib/roster-queries";

export default function RosterGrid({
  roster,
  onChanged,
}: {
  roster: RosterEntry[];
  onChanged?: () => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {roster.map(({ person, photos }) => (
        <PersonCard key={person.id} person={person} photos={photos} onChanged={onChanged} />
      ))}
    </div>
  );
}
