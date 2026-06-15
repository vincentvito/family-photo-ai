import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { getThemeRanking, type ThemeRankingRow } from "@/lib/admin-queries";
import { THEMES } from "@/lib/themes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending AI Family Photo Vibes 🔥 | FamilyShoot",
  description:
    "See the FamilyShoot vibes families are using most, ranked from real in-app photoshoot data. No fake trend counts or invented usage.",
  alternates: { canonical: `${SITE_URL}/trending` },
};

async function loadTrendingVibes(): Promise<{ rows: ThemeRankingRow[]; error: string | null }> {
  try {
    return { rows: await getThemeRanking(12), error: null };
  } catch (error) {
    console.error("Unable to load trending vibes", error);
    return {
      rows: [],
      error:
        "Trending data is connected to the in-app generation analytics table, but it is not reachable in this environment yet.",
    };
  }
}

function categoryLabel(category: ThemeRankingRow["category"]) {
  if (category === "photoreal") return "Photographic";
  if (category === "stylized") return "Stylized";
  if (category === "card") return "Card";
  if (category === "custom") return "Custom";
  return "Catalog";
}

function formatLastUsed(date: Date | null) {
  if (!date) return "No recent timestamp";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function themeImage(row: ThemeRankingRow) {
  return THEME_BY_ID.get(row.themeId)?.coverImage ?? "/samples/hero.jpg";
}

function themeDescription(row: ThemeRankingRow) {
  if (row.category === "custom") return "User-described custom vibe from a real in-app shoot.";
  return (
    THEME_BY_ID.get(row.themeId)?.blurb ?? "A real in-app vibe from recent FamilyShoot photoshoots."
  );
}

export default async function TrendingPage() {
  const { rows, error } = await loadTrendingVibes();

  return (
    <>
      <Nav
        links={[
          { href: "/trending", label: "Trending 🔥" },
          { href: "/vibes", label: "Vibes" },
          { href: "/gallery", label: "Gallery" },
          { href: "/cards", label: "Cards" },
        ]}
      />
      <main className="bg-[color:var(--color-bg)] pb-20 pt-28">
        <header className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Trending 🔥
            </span>
            <h1 className="serif mt-5 text-5xl leading-[1.02] tracking-[-0.03em] sm:text-7xl">
              Most-used family photo vibes.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              Ranked from real photoshoots in the app. If there is no usage data yet, we show an
              empty state instead of inventing trend numbers.
            </p>
          </div>
        </header>

        <section className="mx-auto mt-12 max-w-6xl px-6">
          {error ? (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="serif text-2xl tracking-[-0.02em]">
                Trending data is not available yet.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                {error}
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="serif text-2xl tracking-[-0.02em]">No trending vibes yet.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Once families create photoshoots, this page will rank the most-used vibes from the
                real generation analytics table.
              </p>
            </div>
          ) : (
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row, index) => {
                const theme = THEME_BY_ID.get(row.themeId);
                const href = theme ? `/studio/theme?theme=${theme.id}` : "/studio/theme";
                return (
                  <li key={row.themeId}>
                    <Link
                      href={href}
                      className="group block h-full overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-bg-tinted-sage)]">
                        <Image
                          src={themeImage(row)}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                          <span className="rounded-full bg-[color:var(--color-bg-elevated)]/92 px-3 py-1 font-[var(--font-fraunces)] text-2xl leading-none text-[color:var(--color-coral)] shadow-[var(--shadow-sm)] backdrop-blur">
                            #{index + 1}
                          </span>
                          <span className="chip chip-sage bg-[color:var(--color-bg-elevated)]/92 backdrop-blur">
                            {categoryLabel(row.category)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col p-5">
                        <h2 className="serif text-3xl leading-tight tracking-[-0.02em] group-hover:text-[color:var(--color-coral)]">
                          {row.name}
                        </h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                          {themeDescription(row)}
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[color:var(--color-ink-muted)]">
                          <span className="font-semibold text-[color:var(--color-ink)]">
                            {row.count} photoshoot{row.count === 1 ? "" : "s"}
                          </span>
                          <span aria-hidden>{"\u2022"}</span>
                          <span>Last used {formatLastUsed(row.lastUsedAt)}</span>
                        </div>
                        <span className="mt-5 inline-flex items-center gap-2 font-semibold text-[color:var(--color-coral)]">
                          Try this vibe
                          <span aria-hidden>{"\u2192"}</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
