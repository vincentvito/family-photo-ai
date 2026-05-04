import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Read the current Better Auth session from the request cookies. Returns null
 * for unauthenticated requests. Use this from server components, route
 * handlers, and server actions.
 */
// Memoized per-request: layout + page + nested server components share one
// Better Auth roundtrip instead of each issuing their own.
export const getCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Convenience wrapper that returns just the user, or null when unauthenticated.
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * True if the current user has the "admin" role per the Better Auth admin plugin.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  // The admin plugin stores roles as a comma-separated string ("admin" or "admin,user").
  const role = (user as { role?: string | null }).role;
  if (!role) return false;
  return role
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .includes("admin");
}

/**
 * Throw if the current user isn't an admin. Use at the top of admin-only
 * server actions / route handlers.
 */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Admin only");
  }
}
