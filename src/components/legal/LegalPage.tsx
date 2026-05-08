import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";
import Footer from "@/components/landing/Footer";

export type LegalSection = {
  title: string;
  body: string[];
};

export default function LegalPage({
  label,
  tone,
  title,
  intro,
  lastUpdated,
  sections,
  sidebarTitle,
  sidebar,
  contactTitle,
  contactBody,
}: {
  label: string;
  tone: "coral" | "sage";
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  sidebarTitle: string;
  sidebar: ReactNode;
  contactTitle: string;
  contactBody: ReactNode;
}) {
  const chipClass = tone === "sage" ? "chip-sage" : "chip-coral";
  const dotClass = tone === "sage" ? "dot-sage" : "dot-coral";
  const contactBorder =
    tone === "sage"
      ? "border-[color:var(--color-sage-soft)]"
      : "border-[color:var(--color-coral-soft)]";
  const contactBg =
    tone === "sage"
      ? "bg-[color:var(--color-bg-tinted-sage)]"
      : "bg-[color:var(--color-bg-tinted-coral)]";

  return (
    <>
      <main className="bg-[color:var(--color-bg)]">
        <header className="px-6 py-6 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <BrandLogo href="/" />
            <Link href="/studio/roster" className="btn btn-coral btn-sm">
              Start a shoot
            </Link>
          </div>
        </header>

        <section className="px-6 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-3xl">
              <span className={`chip ${chipClass}`}>
                <span className={`dot ${dotClass}`} />
                {label}
              </span>
              <h1 className="serif mt-5 text-5xl leading-[1.02] sm:text-6xl">{title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
                {intro}
              </p>
              <p className="mt-4 text-sm font-medium text-[color:var(--color-ink-muted)]">
                Last updated: {lastUpdated}
              </p>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
              <aside className="hidden lg:block">
                <div className="sticky top-8 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
                  <p className="small-caps text-[color:var(--color-ink-muted)]">{sidebarTitle}</p>
                  {sidebar}
                </div>
              </aside>

              <div className="space-y-5">
                {sections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)] sm:p-8"
                  >
                    <h2 className="serif text-2xl leading-tight">{section.title}</h2>
                    <div className="mt-4 space-y-4">
                      {section.body.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-[0.98rem] leading-relaxed text-[color:var(--color-ink-muted)]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}

                <section
                  className={`rounded-[var(--radius-lg)] border ${contactBorder} ${contactBg} p-6 sm:p-8`}
                >
                  <h2 className="serif text-2xl leading-tight">{contactTitle}</h2>
                  <p className="mt-4 text-[0.98rem] leading-relaxed text-[color:var(--color-ink-muted)]">
                    {contactBody}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
