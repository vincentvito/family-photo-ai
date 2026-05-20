import Hero from "@/components/landing/Hero";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Gallery from "@/components/landing/Gallery";
import OccasionCards from "@/components/landing/OccasionCards";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustPrivacy from "@/components/landing/TrustPrivacy";
import GiftCredits from "@/components/landing/GiftCredits";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import TrendingAnnouncementBar from "@/components/landing/TrendingAnnouncementBar";
import { getThemeRanking } from "@/lib/admin-queries";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ unlockGenerationId?: string }>;
}) {
  const [{ unlockGenerationId }, trendingVibes] = await Promise.all([
    searchParams,
    loadTrendingVibeNames(),
  ]);

  return (
    <>
      <TrendingAnnouncementBar vibes={trendingVibes} />
      <Nav topOffsetClass="top-10" />
      <main>
        <Hero />
        <BeforeAfter />
        <Gallery />
        <OccasionCards />
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
