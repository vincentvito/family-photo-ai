export const STUDIO_RETENTION_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

// Retention should purge generated files, not generation rows. Credit usage
// references generation ids as immutable billing history.

export function studioCutoffDate(now = new Date()) {
  return new Date(now.getTime() - STUDIO_RETENTION_DAYS * DAY_MS);
}

export function studioExpiresAt(createdAt: Date | string, days = STUDIO_RETENTION_DAYS) {
  return new Date(new Date(createdAt).getTime() + days * DAY_MS);
}

export function studioDaysRemaining(createdAt: Date | string, now = new Date()) {
  const expiresAt = studioExpiresAt(createdAt);
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
}
