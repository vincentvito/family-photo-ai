import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { setImageRating } from "@/lib/album-queries";

export const runtime = "nodejs";

const Body = z.object({
  imageId: z.string().min(1),
  rating: z.enum(["up", "down"]).nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  try {
    return NextResponse.json(
      await setImageRating(user.id, parsed.data.imageId, parsed.data.rating),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status =
      message === "Image not found" ? 404 : message === "This shoot has expired." ? 410 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
