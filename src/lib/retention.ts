export const STUDIO_RETENTION_DAYS = 14;
export const PRO_STUDIO_RETENTION_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

// Retention should purge generated files, not generation rows. Credit usage
// references generation ids as immutable billing history.

export function studioRetentionDays(packTier?: string | null) {
  return packTier === "pro" ? PRO_STUDIO_RETENTION_DAYS : STUDIO_RETENTION_DAYS;
}

export function studioCutoffDate(now = new Date(), packTier?: string | null) {
  return new Date(now.getTime() - studioRetentionDays(packTier) * DAY_MS);
}

export function studioExpiresAt(createdAt: Date | string, packTier?: string | null) {
  return new Date(new Date(createdAt).getTime() + studioRetentionDays(packTier) * DAY_MS);
}

export function studioDaysRemaining(
  createdAt: Date | string,
  packTier?: string | null,
  now = new Date(),
) {
  const expiresAt = studioExpiresAt(createdAt, packTier);
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
}
