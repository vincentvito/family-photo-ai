import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGuestOwnerId } from "@/lib/guest-owner";
import { removePerson, updatePerson } from "@/lib/roster-queries";
import { rosterPatchBodySchema } from "@/lib/roster-validation";

export const runtime = "nodejs";

function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the roster details and try again.";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await getGuestOwnerId());
  if (!ownerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = rosterPatchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
  }
  try {
    await updatePerson({ id, userId: ownerId, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("roster.update failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await getGuestOwnerId());
  if (!ownerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const photoCount = await removePerson(ownerId, id);
    return NextResponse.json({ photoCount });
  } catch (err) {
    console.error("roster.delete failed", err);
    return NextResponse.json({ error: "Could not delete. Please try again." }, { status: 500 });
  }
}
