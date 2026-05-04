/**
 * Pre-launch gate. When LOGIN_ALLOWLIST is set, sign-in is restricted to those
 * emails server-side (see src/lib/auth.ts) AND the landing-page CTAs swap to
 * "Coming soon" so visitors don't waste a click. Unset the env var to open up.
 */
export function isLaunchGated(): boolean {
  return !!process.env.LOGIN_ALLOWLIST?.trim();
}
