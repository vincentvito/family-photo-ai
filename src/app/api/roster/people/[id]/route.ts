import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { removePerson, updatePerson } from "@/lib/roster-queries";
import { ROSTER_NAME_MAX_LENGTH, ROSTER_NOTE_MAX_LENGTH } from "@/lib/roster-constants";

export const runtime = "nodejs";

const PatchBody = z.object({
  name: z.string().trim().min(1).max(ROSTER_NAME_MAX_LENGTH).optional(),
  role: z.enum(["adult", "child", "pet"]).optional(),
  notes: z
    .string()
    .trim()
    .max(
      ROSTER_NOTE_MAX_LENGTH,
      `Optional note must be ${ROSTER_NOTE_MAX_LENGTH} characters or fewer.`,
    )
    .nullable()
    .optional(),
});

function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the roster details and try again.";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
  }
  try {
    await updatePerson({ id, userId: user.id, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("roster.update failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const photoCount = await removePerson(user.id, id);
    return NextResponse.json({ photoCount });
  } catch (err) {
    console.error("roster.delete failed", err);
    return NextResponse.json({ error: "Could not delete. Please try again." }, { status: 500 });
  }
}
