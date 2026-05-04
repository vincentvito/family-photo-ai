import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-helpers";
import AccountMenu from "@/components/auth/AccountMenu";
import StudioStepper from "@/components/studio/StudioStepper";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-[color:var(--color-ink)]">
            <span className="relative inline-flex h-8 w-8 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full bg-[color:var(--color-coral)]"
                aria-hidden
              />
              <span className="relative text-[10px] font-bold tracking-[0.18em] text-white">
                FP
              </span>
            </span>
            <span className="serif text-lg tracking-tight hidden sm:inline">
              Family&nbsp;Photoshoot
            </span>
          </Link>
          <StudioStepper />
          <div className="flex items-center gap-3">
            <AccountSlot session={session} />
            <Link href="/studio/album" className="btn btn-ghost btn-sm">
              Album
            </Link>
          </div>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}

function AccountSlot({
  session,
}: {
  session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
}) {
  const role = (session.user as { role?: string | null }).role ?? "";
  const admin = role
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .includes("admin");
  return <AccountMenu email={session.user.email} isAdmin={admin} />;
}
