import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Admin · Family Photoshoot",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 404 instead of redirect — don't leak that an admin area exists.
  if (!(await isAdmin())) notFound();

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)]">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Admin
            </span>
            <span className="serif text-lg tracking-[-0.01em]">Platform overview</span>
          </div>
          <Link href="/studio/roster" className="btn btn-ghost btn-sm">
            Back to studio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
