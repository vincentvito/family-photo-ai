/**
 * Location references are uploaded into a user-scoped prefix. Never accept an
 * arbitrary storage key from the client: doing so could attach another user's
 * private reference image to an AI-provider request.
 */
export function isOwnedLocationReferencePath(path: string, userId: string): boolean {
  return (
    path.startsWith(`locations/${userId}/`) &&
    /^locations\/[^/]+\/[A-Za-z0-9_-]{10}\.jpg$/.test(path)
  );
}
