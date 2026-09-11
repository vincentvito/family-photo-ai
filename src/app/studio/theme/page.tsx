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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTempRosterOwnerFromCookieValue, TEMP_ROSTER_COOKIE } from "@/lib/temp-roster";
import { getThemeStudioHref } from "@/lib/theme-links";
import {
  getStudioIntentDestination,
  getStudioIntentHref,
  parseStudioIntent,
} from "@/lib/studio-intent";
import { localizePath } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type OutputMode = "photoshoot" | "card";

export default async function ThemePage({
  searchParams,
}: {
  searchParams: Promise<{
    output?: string | string[];
    card?: string | string[];
    theme?: string | string[];
    prompt?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const { output, card } = params;
  const locale = await getRequestLocale();
  const themes = themesByCategory();
  const allThemes = [...themes.photoreal, ...themes.stylized, ...themes.card];
  const intent = parseStudioIntent(params, allThemes);
  const selected =
    intent?.kind === "theme"
      ? (allThemes.find((entry) => entry.id === intent.themeId) ?? null)
      : null;
  const outputMode: OutputMode = intent?.output ?? (output === "card" ? "card" : "photoshoot");
  const selectedCard = selected?.category === "card" ? selected : null;
  const selectedTheme = selected && selected.category !== "card" ? selected : null;
  const initialPrompt = intent?.kind === "prompt" ? intent.prompt : "";

  if (selectedCard && (card !== selectedCard.id || output !== "card")) {
    redirect(localizePath(getThemeStudioHref(selectedCard), locale));
  }
  const user = await getCurrentUser();
  const cookieStore = user ? null : await cookies();
  const tempOwner = user
    ? null
    : getTempRosterOwnerFromCookieValue(cookieStore?.get(TEMP_ROSTER_COOKIE)?.value);
  const rosterOwnerId = user?.id ?? tempOwner?.userId ?? null;
  const [admin, defaultModel, creditBalance, canPreview, rosterRows, subscription] =
    await Promise.all([
      isAdmin(),
      getDefaultModel(),
      user ? getCreditBalance(user.id) : Promise.resolve(0),
      user ? canStartFreePreview(user.id) : Promise.resolve(false),
      rosterOwnerId
        ? listRoster(rosterOwnerId)
        : Promise.resolve([] as Awaited<ReturnType<typeof listRoster>>),
      user ? getCurrentSubscription(user.id) : Promise.resolve(null),
    ]);
  const isProSubscriber = isActiveSubscriptionStatus(subscription?.status);

  if (intent) {
    const destination = getStudioIntentDestination(intent, rosterRows);
    if (destination !== getStudioIntentHref(intent)) {
      redirect(localizePath(destination, locale));
    }
  }

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
        key={intent ? getStudioIntentHref(intent) : outputMode}
        photoreal={themes.photoreal}
        stylized={themes.stylized}
        cards={themes.card}
        isAdmin={admin}
        defaultModel={defaultModel}
        creditBalance={creditBalance}
        canStartFreePreview={canPreview}
        roster={roster}
        outputMode={outputMode}
        isProSubscriber={isProSubscriber}
        subscriptionRenewalDate={subscription?.currentPeriodEnd?.toISOString() ?? null}
        isAuthenticated={Boolean(user)}
        initialThemeId={selectedTheme?.id ?? null}
        initialCardId={selectedCard?.id ?? null}
        initialPrompt={initialPrompt}
      />
    </main>
  );
}
