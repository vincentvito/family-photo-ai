import Hero from "@/components/landing/Hero";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Gallery from "@/components/landing/Gallery";
import PrintKeepsakes from "@/components/landing/PrintKeepsakes";
import OccasionCards from "@/components/landing/OccasionCards";
import FathersDay from "@/components/landing/FathersDay";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustPrivacy from "@/components/landing/TrustPrivacy";
import GiftCredits from "@/components/landing/GiftCredits";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import TrendingAnnouncementBar from "@/components/landing/TrendingAnnouncementBar";
import { getThemeRanking } from "@/lib/admin-queries";
import { getHomepageThemeRanking } from "@/lib/homepage-theme-ranking";

async function loadTrendingVibeNames() {
  try {
    const rows = await getThemeRanking(8);
    return rows
      .filter((row) => row.category !== "custom" && row.category !== "unknown")
      .map((row) => ({ id: row.themeId, name: row.name }));
  } catch (error) {
    console.error("Unable to load landing trending vibes", error);
    return [];
  }
}

export const dynamic = "force-dynamic";

async function loadFavoriteThemeIds() {
  try {
    const rows = await getHomepageThemeRanking(6);
    return rows.map((row) => row.themeId);
  } catch (error) {
    console.error("Unable to load homepage favorites", error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ unlockGenerationId?: string }>;
}) {
  const [{ unlockGenerationId }, trendingVibes, favoriteThemeIds] = await Promise.all([
    searchParams,
    loadTrendingVibeNames(),
    loadFavoriteThemeIds(),
  ]);

  return (
    <>
      <TrendingAnnouncementBar vibes={trendingVibes} />
      <Nav topOffsetClass="top-10" />
      <main>
        <Hero />
        <BeforeAfter />
        <Gallery favoriteThemeIds={favoriteThemeIds} />
        <PrintKeepsakes />
        <OccasionCards />
        <FathersDay />
        <HowItWorks />
        <TrustPrivacy />
        <GiftCredits />
        <Pricing unlockGenerationId={unlockGenerationId} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
