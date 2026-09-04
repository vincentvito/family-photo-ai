import Link from "@/components/i18n/LocalizedLink";
import { getTranslations } from "next-intl/server";

type TrendingAnnouncementBarProps = {
  vibes: { id: string; name: string }[];
};

const fallbackVibes = [
  { id: "butter-yellow-picnic", name: "Butter Yellow Picnic" },
  { id: "paprika-plaid-autumn", name: "Paprika Plaid Autumn" },
  { id: "summerween-pumpkin-glow", name: "Summerween Pumpkin Glow" },
  { id: "storybook-forest-family-adventure", name: "Storybook Forest" },
  { id: "y3k-chrome-family-future", name: "Y3K Chrome Future" },
  { id: "polka-dot-porch-party", name: "Polka Dot Porch Party" },
];

export default async function TrendingAnnouncementBar({ vibes }: TrendingAnnouncementBarProps) {
  const t = await getTranslations("Landing.TrendingBar");
  const visibleVibes = vibes.length > 0 ? vibes : fallbackVibes;
  const tickerItems = [...visibleVibes, ...visibleVibes];

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--color-line-dark)] bg-[color:var(--color-ink)] text-[color:var(--color-bg)]">
      <Link
        href="/trending"
        className="group flex h-10 items-center overflow-hidden text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm"
        aria-label={t("ariaLabel")}
      >
        <span className="shrink-0 px-4 text-[color:var(--color-butter)] sm:px-6">
          {t("label")} 🔥
        </span>
        <span className="marquee-mask flex min-w-0 flex-1 overflow-hidden">
          <span className="marquee-track flex shrink-0 items-center gap-5 whitespace-nowrap [--marquee-duration:36s]">
            {tickerItems.map((vibe, index) => (
              <span key={`${vibe.id}-${index}`} className="inline-flex items-center gap-5">
                <span className="text-[color:var(--color-bg)]/90 transition-colors group-hover:text-white">
                  {vibe.name}
                </span>
                <span className="text-[color:var(--color-coral)]" aria-hidden>
                  {"\u2022"}
                </span>
              </span>
            ))}
          </span>
        </span>
      </Link>
    </div>
  );
}
