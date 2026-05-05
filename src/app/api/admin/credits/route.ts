import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { user as userTable } from "@/../db/auth-schema";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";

const Body = z.object({
  email: z.string().trim().email(),
  credits: z.number().int().min(-100).max(100).refine((value) => value !== 0),
  reason: z.string().trim().max(240).optional(),
});

export async function POST(req: Request) {
  const adminUser = await getCurrentUser();
  if (!adminUser || !(await isAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const [targetUser] = await db
    .select({ id: userTable.id, email: userTable.email })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "No user found for that email." }, { status: 404 });
  }

  await db.insert(schema.creditGrants).values({
    userId: targetUser.id,
    credits: parsed.data.credits,
    reason: parsed.data.reason || null,
    grantedByUserId: adminUser.id,
  });

  return NextResponse.json({ ok: true });
}
