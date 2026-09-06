import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { removePerson, updatePerson } from "@/lib/roster-queries";
import { rosterPatchBodySchema } from "@/lib/roster-validation";
import { getTempRosterOwner, type RosterOwner } from "@/lib/temp-roster";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the My Family details and try again.";
}

async function getRosterOwner(req: NextRequest): Promise<RosterOwner | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id, temporary: false };
  return getTempRosterOwner(req);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const owner = await getRosterOwner(req);
  if (!owner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = rosterPatchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
  }
  try {
    await updatePerson({ id, userId: owner.userId, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("roster.update failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const owner = await getRosterOwner(req);
  if (!owner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const photoCount = await removePerson(owner.userId, id);
    return NextResponse.json({ photoCount });
  } catch (err) {
    console.error("roster.delete failed", err);
    return NextResponse.json({ error: "Could not delete. Please try again." }, { status: 500 });
  }
}
