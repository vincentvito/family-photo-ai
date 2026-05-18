import PassportVisaBoard from "@/components/studio/PassportVisaBoard";
import type { RosterMember } from "@/components/studio/ThemeBoard";
import { getDefaultModel } from "@/lib/admin-queries";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { getCreditBalance } from "@/lib/billing-queries";
import { canStartFreePreview } from "@/lib/generate-queries";
import { PASSPORT_VISA_SPECS } from "@/lib/passport-visa-specs";
import { listRoster } from "@/lib/roster-queries";

export const dynamic = "force-dynamic";

export default async function PassportVisaStudioPage() {
  const user = await getCurrentUser();
  const [admin, defaultModel, creditBalance, canPreview, rosterRows] = await Promise.all([
    isAdmin(),
    getDefaultModel(),
    user ? getCreditBalance(user.id) : Promise.resolve(0),
    user ? canStartFreePreview(user.id) : Promise.resolve(false),
    user ? listRoster(user.id) : Promise.resolve([] as Awaited<ReturnType<typeof listRoster>>),
  ]);

  const roster: RosterMember[] = rosterRows.map(({ person, photos }) => ({
    id: person.id,
    name: person.name,
    role: person.role as "adult" | "child" | "pet",
    hasReference: photos.length > 0,
    photoId: photos[0]?.id ?? null,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="chip chip-sage">
            <span className="dot dot-sage" />
            Passport & visa photo studio
          </span>
          <h1 className="serif mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            Pick the document size before we generate the photo.
          </h1>
          <p className="mt-4 max-w-2xl text-[color:var(--color-ink-muted)]">
            Choose a country/document preset, select one family member, and generate official-style
            headshots on a clean white background. For family coverage, run one person at a time.
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-4 text-sm text-[color:var(--color-ink-muted)] shadow-[var(--shadow-sm)]">
          <strong className="block text-[color:var(--color-ink)]">Compliance note</strong>
          Presets are size guides only. Verify current government rules before submission.
        </div>
      </div>

      <PassportVisaBoard
        specs={[...PASSPORT_VISA_SPECS]}
        roster={roster}
        isAdmin={admin}
        defaultModel={defaultModel}
        creditBalance={creditBalance}
        canStartFreePreview={canPreview}
      />
    </main>
  );
}
