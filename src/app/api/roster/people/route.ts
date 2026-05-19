import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { addPerson, listRoster } from "@/lib/roster-queries";
import { ROSTER_NAME_MAX_LENGTH } from "@/lib/roster-constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(1).max(ROSTER_NAME_MAX_LENGTH),
  role: z.enum(["adult", "child", "pet"]),
});

function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the roster details and try again.";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const roster = await listRoster(user.id);
    return NextResponse.json({ roster });
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
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
  }
  try {
    const person = await addPerson({ ...parsed.data, userId: user.id });
    return NextResponse.json({ person });
  } catch (err) {
    console.error("roster.create failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
