import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { PASSPORT_VISA_SPECS } from "@/lib/passport-visa-specs";

export const metadata = {
  title: "Passport & Visa Photo Generator | FamilyShoot",
  description:
    "Generate passport and visa photo options for each family member with country/document size presets and a clean white background.",
};

export default function PassportVisaPhotosPage() {
  const countries = Array.from(new Set(PASSPORT_VISA_SPECS.map((spec) => spec.countryName)));
  const featured = PASSPORT_VISA_SPECS.slice(0, 6);

  return (
    <>
      <Nav />
      <main>
        <section className="px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="chip chip-sage">
                <span className="dot dot-sage" />
                Passport & visa photo generator
              </span>
              <h1 className="serif mt-5 max-w-4xl text-5xl leading-[0.98] tracking-[-0.035em] sm:text-7xl">
                Official-style photos for the whole family.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
                Select a destination country and document type first, then generate clean
                white-background headshots for one adult or child at a time. Repeat for every family
                member.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/studio/passport-visa" className="btn btn-coral">
                  Start passport/visa photos
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
                </Link>
                <Link href="/studio/roster" className="btn btn-sage">
                  Add family references
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
                Presets are practical guides, not a legal guarantee. Always check the latest
                government or embassy requirements before submitting.
              </p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-lg)] sm:p-7">
              <div className="aspect-[4/5] rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-gradient-to-b from-white to-[color:var(--color-bg-tinted-butter)] p-8">
                <div className="mx-auto flex h-full max-w-[280px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[color:var(--color-line-strong)] bg-white shadow-[var(--shadow-sm)]">
                  <div className="h-24 w-24 rounded-full bg-[color:var(--color-bg-tinted-sage)]" />
                  <div className="mt-5 h-20 w-44 rounded-t-full bg-[color:var(--color-bg-tinted-butter)]" />
                  <div className="mt-8 rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                    35 x 45 mm
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg)] p-4">
                  <strong className="block">White background</strong>
                  <span className="text-[color:var(--color-ink-muted)]">
                    Neutral, even, shadow-free prompt.
                  </span>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg)] p-4">
                  <strong className="block">Size preset</strong>
                  <span className="text-[color:var(--color-ink-muted)]">
                    Country/document sizing carried into generation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <span className="chip chip-butter">
                  <span className="dot dot-butter" />
                  Included presets
                </span>
                <h2 className="serif mt-4 text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">
                  Choose a destination before the shoot.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Current presets include {countries.join(", ")}. More countries can be added in the
                catalog without a database migration.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((spec) => (
                <article
                  key={spec.id}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-faint)]">
                    {spec.countryName}
                  </p>
                  <h3 className="serif mt-2 text-2xl tracking-[-0.02em]">{spec.documentLabel}</h3>
                  <p className="mt-3 text-sm text-[color:var(--color-ink-muted)]">
                    {spec.sizeLabel} · {spec.outputPixels}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
                    {spec.printableSheet}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
