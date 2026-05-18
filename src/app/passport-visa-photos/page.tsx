import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { PASSPORT_VISA_SPECS } from "@/lib/passport-visa-specs";

export const metadata = {
  title: "Passport & Visa Photo Generator | FamilyShoot",
  description:
    "Generate passport and visa photo options for each family member with country/document size presets and a clean white background.",
};

const workflow = [
  "Choose destination + document",
  "Queue one family member",
  "Generate white-background options",
  "Export exact size or printable sheet",
];

export default function PassportVisaPhotosPage() {
  const countries = Array.from(new Set(PASSPORT_VISA_SPECS.map((spec) => spec.countryName)));
  const featured = PASSPORT_VISA_SPECS.slice(0, 8);
  const heroSpec = PASSPORT_VISA_SPECS.find((spec) => spec.id === "uk-passport") ?? PASSPORT_VISA_SPECS[0];

  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden px-6 py-16 sm:px-8 sm:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[color:var(--color-bg-tinted-butter)] blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-28 h-72 w-72 rounded-full bg-[color:var(--color-bg-tinted-sage)] blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="chip chip-sage">
                <span className="dot dot-sage" />
                Document photo studio
              </span>
              <h1 className="serif mt-5 max-w-4xl text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
                Passport and visa photos, built for family admin.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
                A separate, compliance-minded workflow from the creative shoots: pick the country and
                document first, process one adult or child at a time, then preview official-style
                white-background photos with sizing and print guidance attached.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/studio/passport-visa" className="btn btn-coral">
                  Start document photos
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

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
                {workflow.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-full border border-[color:var(--color-line)] bg-white/70 px-4 py-3 text-sm shadow-[var(--shadow-sm)] backdrop-blur"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
                Presets are practical guides, not a legal guarantee. Always check the latest
                government or embassy requirements before submitting.
              </p>
            </div>

            <div className="rounded-[32px] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-4 shadow-[var(--shadow-lg)] sm:p-6">
              <div className="rounded-[28px] border border-[color:var(--color-line)] bg-gradient-to-br from-white via-[color:var(--color-bg)] to-[color:var(--color-bg-tinted-butter)] p-4 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[color:var(--color-ink)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                    {heroSpec.countryCode}
                  </span>
                  <span className="rounded-full border border-[color:var(--color-line-strong)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]">
                    {heroSpec.documentLabel}
                  </span>
                  <span className="rounded-full border border-[color:var(--color-line-strong)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]">
                    {heroSpec.sizeLabel}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[0.74fr_1fr] md:items-stretch">
                  <div className="rounded-[24px] border border-[color:var(--color-line)] bg-white p-4 shadow-[var(--shadow-sm)]">
                    <p className="small-caps text-[color:var(--color-ink-muted)]">Family queue</p>
                    <div className="mt-4 space-y-3">
                      {["Mia", "Noah", "Luca"].map((name, index) => (
                        <div
                          key={name}
                          className={`flex items-center justify-between rounded-[18px] px-3 py-3 ${
                            index === 0
                              ? "bg-[color:var(--color-bg-tinted-sage)]"
                              : "bg-[color:var(--color-bg)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold shadow-[var(--shadow-sm)]">
                              {name[0]}
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{name}</p>
                              <p className="text-xs text-[color:var(--color-ink-muted)]">
                                {index === 0 ? "Generating now" : "Next in queue"}
                              </p>
                            </div>
                          </div>
                          {index === 0 && <span className="dot dot-sage" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[color:var(--color-line-strong)] bg-white p-5 shadow-[var(--shadow-md)]">
                    <div className="mx-auto flex aspect-[35/45] max-w-[245px] flex-col items-center justify-end overflow-hidden rounded-[18px] border border-[color:var(--color-line)] bg-white px-8 pt-8 shadow-inner">
                      <div className="h-24 w-24 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-sage)]" />
                      <div className="mt-4 h-28 w-44 rounded-t-full bg-[color:var(--color-bg-tinted-butter)]" />
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <span className="rounded-full bg-[color:var(--color-ink)] px-3 py-1.5 text-xs font-semibold text-white">
                        White background
                      </span>
                      <span className="rounded-full border border-[color:var(--color-line-strong)] px-3 py-1.5 text-xs font-semibold">
                        {heroSpec.outputPixels}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[22px] border border-[color:var(--color-line)] bg-white/80 p-4">
                  <p className="small-caps text-[color:var(--color-ink-muted)]">Printable output</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[heroSpec.sizeLabel, "4 x 6 sheet", "300 DPI", "Multiple copies"].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-[color:var(--color-bg-tinted-butter)] px-3 py-1.5 text-xs font-semibold"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
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
                  Country/document presets
                </span>
                <h2 className="serif mt-4 max-w-3xl text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">
                  Size, background, and print sheet stay attached to the document.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Current presets include {countries.join(", ")}. The catalog can grow without changing
                the generation flow.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {featured.map((spec) => (
                <article
                  key={spec.id}
                  className="group rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[color:var(--color-bg-tinted-sage)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
                      {spec.countryCode}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-faint)]">
                      {spec.documentType}
                    </span>
                  </div>
                  <h3 className="serif mt-4 text-2xl tracking-[-0.02em]">{spec.countryName}</h3>
                  <p className="mt-1 text-sm font-semibold">{spec.documentLabel}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[color:var(--color-ink)] px-3 py-1 text-xs font-semibold text-white">
                      {spec.sizeLabel}
                    </span>
                    <span className="rounded-full border border-[color:var(--color-line-strong)] px-3 py-1 text-xs font-semibold">
                      {spec.outputPixels.split(" at ")[0]}
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
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
