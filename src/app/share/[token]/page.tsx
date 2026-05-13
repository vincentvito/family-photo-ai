import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { getSharedImage } from "@/lib/share-queries";
import { studioDaysRemaining } from "@/lib/retention";
import PublicShareButton from "@/components/share/PublicShareButton";

export const dynamic = "force-dynamic";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const origin = await requestOrigin();
  const shared = await getSharedImage(token);
  const title = shared ? "A FamilyShoot portrait" : "This FamilyShoot link expired";
  const description = shared
    ? "A family portrait made with FamilyShoot."
    : "This shared FamilyShoot portrait is no longer available.";

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      type: "website",
      siteName: "FamilyShoot",
      title,
      description,
      url: `/share/${token}`,
      images: shared
        ? [
            {
              url: `${origin}/api/share/${token}/og`,
              width: 1200,
              height: 630,
              alt: "A portrait made with FamilyShoot.",
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: shared ? [`${origin}/api/share/${token}/og`] : undefined,
    },
  };
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const shared = await getSharedImage(token);

  if (!shared) return <UnavailableShare />;

  const daysLeft = studioDaysRemaining(shared.generation.createdAt, shared.generation.packTier);
  const imageAspect = `${shared.image.width} / ${shared.image.height}`;
  const maxFrameWidth = `min(100%, ${(shared.image.width / shared.image.height) * 82}vh)`;

  return (
    <main className="min-h-screen bg-[color:var(--color-bg)]">
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:py-12">
        <div className="relative mx-auto w-full" style={{ maxWidth: maxFrameWidth }}>
          <div className="absolute inset-x-[8%] bottom-[-1.1rem] h-12 rounded-full bg-[color:rgba(31,26,36,0.18)] blur-2xl" />
          <figure
            className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[0_18px_45px_rgba(31,26,36,0.18),0_3px_8px_rgba(31,26,36,0.08)]"
            style={{ aspectRatio: imageAspect }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/share/${token}/image`}
              alt="A portrait made with FamilyShoot"
              className="h-full w-full object-cover"
            />
          </figure>
        </div>

        <aside className="lg:pl-2">
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            Shared portrait
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.04] tracking-[-0.025em] sm:text-5xl">
            Made with <em className="serif-italic text-[color:var(--color-coral)]">FamilyShoot</em>.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
            This private share link is unlisted and expires with the studio file
            {daysLeft > 0 ? ` in ${daysLeft === 1 ? "1 day" : `${daysLeft} days`}` : ""}.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/sign-in" className="btn btn-coral">
              Make your own
              <ArrowIcon />
            </Link>
            <PublicShareButton />
            <Link href="/" className="btn btn-ghost">
              Learn more
            </Link>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[color:var(--color-ink-faint)]">
            No gallery, no search listing, no public index. Just this link.
          </p>
        </aside>
      </section>
    </main>
  );
}

function UnavailableShare() {
  return (
    <main className="min-h-screen bg-[color:var(--color-bg)] px-5 py-10 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center text-center">
        <div className="relative h-64 w-full max-w-sm sm:h-80">
          <Image src="/illustrations/share-expired.svg" alt="" fill className="object-contain" />
        </div>
        <span className="chip chip-butter mt-6">
          <span className="dot dot-butter" />
          Link unavailable
        </span>
        <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          This portrait has left the studio.
        </h1>
        <p className="mt-4 max-w-lg text-[color:var(--color-ink-muted)]">
          Shared FamilyShoot links are private, unlisted, and expire when the underlying image is
          deleted from the studio.
        </p>
        <Link href="/" className="btn btn-coral mt-7">
          Visit FamilyShoot
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
