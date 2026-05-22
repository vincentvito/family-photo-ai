import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getGenerationState } from "@/lib/generate-queries";
import { resolveTheme } from "@/lib/themes";
import { studioDaysRemaining, studioRetentionDays } from "@/lib/retention";
import GenerationBoard from "@/components/studio/GenerationBoard";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGuestGenerationConflict, getGuestOwnerId } from "@/lib/guest-owner";

export const dynamic = "force-dynamic";

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const guestOwnerId = user ? null : await getGuestOwnerId();
  const ownerId = user?.id ?? guestOwnerId;
  if (!ownerId) notFound();
  const state = await getGenerationState(id, ownerId, { guest: Boolean(guestOwnerId) });
  const conflict = !state && user ? await getGuestGenerationConflict(user.id, id) : null;
  if (conflict) return <FreePreviewConflict userPreviewId={conflict.userPreviewId} />;
  if (!state) notFound();

  const theme = resolveTheme(state.generation);
  const retentionDays = studioRetentionDays(state.generation.packTier);
  const daysLeft = studioDaysRemaining(state.generation.createdAt, state.generation.packTier);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div>
        <span className="chip chip-butter">
          <span className="dot dot-butter" />
          Step 03 · Your shoot
        </span>
        <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          {theme.name}
          <em className="serif-italic text-[color:var(--color-coral)]">.</em>
        </h1>
        <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
          {state.revealRequiresSignIn
            ? "Your free previews are ready. Sign in to reveal this exact shoot with the standard preview watermark."
            : state.isPreview
              ? "Four watermarked preview images. Open any image to view it larger, then unlock this exact shoot when it feels right. "
              : "Four starting images. Open any image to view it larger, or heart your keepers for the album. "}
          This shoot stays available for{" "}
          {daysLeft === 1 ? "1 more day" : `${Math.min(daysLeft, retentionDays)} days`}.
        </p>
      </div>

      <Suspense>
        <GenerationBoard generationId={id} aspectRatio={theme.aspectRatio} initialState={state} />
      </Suspense>
    </main>
  );
}

function FreePreviewConflict({ userPreviewId }: { userPreviewId: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <span className="chip chip-butter">
        <span className="dot dot-butter" />
        Free preview already used
      </span>
      <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
        This guest preview cannot be claimed automatically.
      </h1>
      <p className="mt-4 text-[color:var(--color-ink-muted)]">
        This account already has a free preview, so we kept both shoots separate instead of
        overwriting either one.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/studio/generate/${userPreviewId}`} className="btn btn-coral">
          Open account preview
        </Link>
        <Link href="/studio/roster" className="btn btn-ghost">
          Back to studio
        </Link>
      </div>
    </main>
  );
}
