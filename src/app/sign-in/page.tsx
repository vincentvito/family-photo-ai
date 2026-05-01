import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OtpSignInForm from "@/components/auth/OtpSignInForm";
import { auth } from "@/lib/auth";

const frames = [
  {
    src: "/samples/hero.jpg",
    caption: "Golden hour",
    className: "left-0 top-10 rotate-[-6deg]",
  },
  {
    src: "/samples/theme-autumn-cabin.jpg",
    caption: "Cabin season",
    className: "right-0 top-20 rotate-[7deg]",
  },
  {
    src: "/samples/theme-card-christmas.jpg",
    caption: "Card ready",
    className: "left-1/2 top-0 -translate-x-1/2 rotate-[-2deg]",
  },
];

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) redirect("/studio/roster");

  return (
    <main className="min-h-screen overflow-hidden bg-[color:var(--color-bg)]">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(900px 520px at 14% 18%, rgba(255,227,214,0.78), transparent 62%), radial-gradient(760px 480px at 86% 84%, rgba(214,228,219,0.7), transparent 58%), linear-gradient(180deg, #FBF8F3 0%, #FBF8F3 100%)",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-[color:var(--color-ink)]">
          <span className="relative inline-flex h-9 w-9 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full bg-[color:var(--color-coral)]"
              aria-hidden
            />
            <span className="relative text-[10px] font-bold tracking-[0.18em] text-white">FP</span>
          </span>
          <span className="serif hidden text-lg tracking-tight sm:inline">
            Family&nbsp;Photoshoot
          </span>
        </Link>

        <Link href="/" className="btn btn-ghost btn-sm">
          Back home
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-4 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:pb-24 lg:pt-10">
        <div className="grid gap-10 lg:gap-14">
          <div className="max-w-xl">
            <span className="chip chip-sage">
              <span className="dot dot-sage" />
              Your private album starts here
            </span>
            <h2 className="serif mt-5 text-5xl leading-[1.02] tracking-[-0.03em] sm:text-6xl xl:text-7xl">
              Keep the faces.
              <br />
              Change the <em className="serif-italic text-[color:var(--color-coral)]">world</em>.
            </h2>
            <p className="mt-5 max-w-sm text-[color:var(--color-ink-muted)]">
              Upload everyday snapshots, choose a mood, and turn the people you love into portraits
              worth framing.
            </p>
          </div>

          <div className="relative h-[300px] max-w-[560px] sm:h-[360px]">
            {frames.map((frame) => (
              <figure
                key={frame.src}
                className={`polaroid absolute w-[170px] shadow-[var(--shadow-xl)] sm:w-[220px] ${frame.className}`}
              >
                <div className="relative h-[190px] overflow-hidden bg-[color:var(--color-bg-tinted-coral)] sm:h-[240px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${frame.src})` }}
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-3 text-center font-[var(--font-fraunces)] text-sm italic text-[color:var(--color-ink-muted)]">
                  {frame.caption}
                </figcaption>
              </figure>
            ))}

            <div className="absolute bottom-4 right-2 hidden rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 py-2 text-sm text-[color:var(--color-ink-muted)] shadow-[var(--shadow-md)] sm:block">
              OTP only. No password drawer.
            </div>
          </div>
        </div>

        <OtpSignInForm />
      </section>
    </main>
  );
}
