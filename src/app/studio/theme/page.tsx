import { themesByCategory } from "@/lib/themes";
import ThemeBoard, { type RosterMember } from "@/components/studio/ThemeBoard";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { getDefaultModel } from "@/lib/admin-queries";
import {
  getCreditBalance,
  getCurrentSubscription,
  isActiveSubscriptionStatus,
} from "@/lib/billing-queries";
import { canStartFreePreview } from "@/lib/generate-queries";
import { listRoster } from "@/lib/roster-queries";
import { getGuestOwnerId } from "@/lib/guest-owner";

export const dynamic = "force-dynamic";

type OutputMode = "photoshoot" | "card";

export default async function ThemePage({
  searchParams,
}: {
  searchParams: Promise<{ output?: string; card?: string }>;
}) {
  const { output, card } = await searchParams;
  const outputMode: OutputMode = output === "card" ? "card" : "photoshoot";
  const themes = themesByCategory();
  const selectedCard =
    outputMode === "card" && card ? themes.card.find((theme) => theme.id === card) : null;
  const user = await getCurrentUser();
  const guestOwnerId = user ? null : await getGuestOwnerId();
  const ownerId = user?.id ?? guestOwnerId;
  const [admin, defaultModel, creditBalance, canPreview, rosterRows, subscription] =
    await Promise.all([
      isAdmin(),
      getDefaultModel(),
      user ? getCreditBalance(user.id) : Promise.resolve(0),
      ownerId ? canStartFreePreview(ownerId) : Promise.resolve(false),
      ownerId ? listRoster(ownerId) : Promise.resolve([] as Awaited<ReturnType<typeof listRoster>>),
      user ? getCurrentSubscription(user.id) : Promise.resolve(null),
    ]);
  const isProSubscriber = isActiveSubscriptionStatus(subscription?.status);

  const roster: RosterMember[] = rosterRows.map(({ person, photos }) => ({
    id: person.id,
    name: person.name,
    role: person.role as "adult" | "child" | "pet",
    hasReference: photos.length > 0,
    photoId: user ? (photos[0]?.id ?? null) : null,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div>
        <span className="chip chip-sage">
          <span className="dot dot-sage" />
          {selectedCard ? "Step 04 - Card style" : "Step 03 - Vibe"}
        </span>
        <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          {selectedCard ? (
            <>
              Finish{" "}
              <em className="serif-italic text-[color:var(--color-sage-deep)]">
                {selectedCard.name}
              </em>
              .
            </>
          ) : outputMode === "card" ? (
            <>
              Pick an occasion{" "}
              <em className="serif-italic text-[color:var(--color-sage-deep)]">layout</em>.
            </>
          ) : (
            <>
              Pick a vibe -{" "}
              <em className="serif-italic text-[color:var(--color-sage-deep)]">or describe one</em>.
            </>
          )}
        </h1>
        <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
          {selectedCard
            ? "Choose the art treatment, optional greeting, and who appears before generating the four card designs."
            : outputMode === "card"
              ? "Cards use occasion-ready compositions with space for optional greeting text."
              : "Start from a curated look, or design your own. One shape picker, one wardrobe note - they apply to whichever vibe you launch."}
        </p>
      </div>

      <ThemeBoard
        photoreal={themes.photoreal}
        stylized={themes.stylized}
        cards={themes.card}
        isAdmin={admin}
        defaultModel={defaultModel}
        creditBalance={creditBalance}
        canStartFreePreview={canPreview}
        roster={roster}
        outputMode={outputMode}
        isAuthenticated={Boolean(user)}
        isProSubscriber={isProSubscriber}
        subscriptionRenewalDate={subscription?.currentPeriodEnd?.toISOString() ?? null}
      />
    </main>
  );
}
