import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { user as userTable } from "@/../db/auth-schema";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

const ROLE_MANAGER_EMAILS = new Set(["vlad.palacio@gmail.com"]);

const Body = z.object({
  userId: z.string().trim().min(1),
  admin: z.boolean(),
});

function parseRoles(role: string | null | undefined) {
  return new Set(
    (role || "user")
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
}

function serializeRoles(roles: Set<string>) {
  if (roles.size === 0) roles.add("user");
  return Array.from(roles).join(",");
}

export async function POST(req: Request) {
  const adminUser = await getCurrentUser();
  if (!adminUser || !(await isAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!ROLE_MANAGER_EMAILS.has(adminUser.email.toLowerCase())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (parsed.data.userId === adminUser.id) {
    return NextResponse.json(
      { error: "You cannot change your own admin role here." },
      { status: 400 },
    );
  }

  const [targetUser] = await db
    .select({ id: userTable.id, role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, parsed.data.userId))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "No user found." }, { status: 404 });
  }

  const roles = parseRoles(targetUser.role);
  if (parsed.data.admin) {
    roles.add("admin");
  } else {
    roles.delete("admin");
    roles.add("user");
  }

  await db
    .update(userTable)
    .set({ role: serializeRoles(roles), updatedAt: new Date() })
    .where(eq(userTable.id, targetUser.id));

  return NextResponse.json({ ok: true });
}
