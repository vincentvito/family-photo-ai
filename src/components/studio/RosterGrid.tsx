import PersonCard from "./PersonCard";
import type { Person, Photo } from "@/../db/schema";

type RosterEntry = { person: Person; photos: Photo[] };

export default function RosterGrid({ roster }: { roster: RosterEntry[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {roster.map(({ person, photos }) => (
        <PersonCard key={person.id} person={person} photos={photos} />
      ))}
    </div>
  );
}
