/**
 * Browser-side helpers that orchestrate presigned-PUT uploads to R2:
 *   1. ask the server to sign a PUT for a temp key,
 *   2. upload bytes directly to R2 (bypasses Vercel's 4.5 MB function cap),
 *   3. ask the server to finalize (read, normalize, persist).
 */

async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}) as { error?: string });
  return data.error || `${fallback} (${res.status})`;
}

async function putToR2(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Direct upload failed (${res.status})`);
  }
}

export async function uploadRosterPhoto(personId: string, file: File): Promise<unknown> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personId,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!signRes.ok) throw new Error(await readError(signRes, "Could not start upload"));
  const { uploadUrl, tempKey } = (await signRes.json()) as {
    uploadUrl: string;
    tempKey: string;
  };

  await putToR2(uploadUrl, file);

  const finalizeRes = await fetch("/api/upload/finalize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ personId, tempKey }),
  });
  if (!finalizeRes.ok) throw new Error(await readError(finalizeRes, "Upload failed"));
  const { photo } = (await finalizeRes.json()) as { photo: unknown };
  return photo;
}

export async function uploadLocationReference(
  file: File,
): Promise<{ path: string; width: number; height: number }> {
  const signRes = await fetch("/api/upload-location/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!signRes.ok) throw new Error(await readError(signRes, "Could not start upload"));
  const { uploadUrl, tempKey } = (await signRes.json()) as {
    uploadUrl: string;
    tempKey: string;
  };

  await putToR2(uploadUrl, file);

  const finalizeRes = await fetch("/api/upload-location/finalize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tempKey }),
  });
  if (!finalizeRes.ok) throw new Error(await readError(finalizeRes, "Upload failed"));
  return (await finalizeRes.json()) as { path: string; width: number; height: number };
}
