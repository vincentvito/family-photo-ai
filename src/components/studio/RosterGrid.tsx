import PersonCard from "./PersonCard";
import type { Person, Photo } from "@/../db/schema";

type RosterEntry = { person: Person; photos: Photo[] };

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
