import type { Metadata } from "next";
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
              Ranked from real photoshoots in the app. If there is no usage data yet, we show an empty state instead of inventing trend numbers.
            </p>
          </div>
        </header>

        <section className="mx-auto mt-12 max-w-6xl px-6">
          {error ? (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="serif text-2xl tracking-[-0.02em]">Trending data is not available yet.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">{error}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="serif text-2xl tracking-[-0.02em]">No trending vibes yet.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Once families create photoshoots, this page will rank the most-used vibes from the real generation analytics table.
              </p>
            </div>
          ) : (
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row, index) => {
                const theme = THEME_BY_ID.get(row.themeId);
                const href = theme ? `/studio/theme?theme=${theme.id}` : "/studio/theme";
                return (
                  <li key={row.themeId}>
                    <Link
                      href={href}
                      className="group block h-full rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="serif text-4xl leading-none text-[color:var(--color-coral)]">
                          #{index + 1}
                        </span>
                        <span className="chip chip-sage">{categoryLabel(row.category)}</span>
                      </div>
                      <h2 className="serif mt-6 text-3xl leading-tight tracking-[-0.02em] group-hover:text-[color:var(--color-coral)]">
                        {row.name}
                      </h2>
                      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[color:var(--color-ink-muted)]">
                        <span>{row.count} photoshoot{row.count === 1 ? "" : "s"}</span>
                        <span>Last used {formatLastUsed(row.lastUsedAt)}</span>
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
