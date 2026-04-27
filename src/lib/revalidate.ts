import { revalidatePath as nextRevalidatePath } from "next/cache";

/**
 * revalidatePath() only works inside a Next request context
 * (server component, server action, route handler). Calling it from a
 * standalone script throws "Invariant: static generation store missing".
 * This wrapper swallows that error so the same action code is usable
 * from both request contexts and scripts.
 */
export function safeRevalidatePath(path: string) {
  try {
    nextRevalidatePath(path);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("static generation store")
    ) {
      return;
    }
    throw err;
  }
}
