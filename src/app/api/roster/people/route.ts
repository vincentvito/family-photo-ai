import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createGuestOwnerId, getGuestOwnerId, setGuestOwnerCookie } from "@/lib/guest-owner";
import { addPerson, hideRosterPhotoStorage, listRoster } from "@/lib/roster-queries";
import { rosterCreateBodySchema } from "@/lib/roster-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the roster details and try again.";
}

export async function GET() {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await getGuestOwnerId());
  if (!ownerId) return NextResponse.json({ roster: [] });
  try {
    const roster = await listRoster(ownerId);
    return NextResponse.json({ roster: user ? roster : hideRosterPhotoStorage(roster) });
  } catch (err) {
    console.error("roster.list failed", err);
    return NextResponse.json(
      { error: "Could not load roster. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const existingGuestOwnerId = user ? null : await getGuestOwnerId();
  const ownerId = user?.id ?? existingGuestOwnerId ?? createGuestOwnerId();
  const json = await req.json().catch(() => null);
  const parsed = rosterCreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
  }
  try {
    const person = await addPerson({ ...parsed.data, userId: ownerId });
    const response = NextResponse.json({ person });
    if (!user && !existingGuestOwnerId) setGuestOwnerCookie(response, ownerId);
    return response;
  } catch (err) {
    console.error("roster.create failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
