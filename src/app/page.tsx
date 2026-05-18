import Hero from "@/components/landing/Hero";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Gallery from "@/components/landing/Gallery";
import OccasionCards from "@/components/landing/OccasionCards";
import PassportVisaVibe from "@/components/landing/PassportVisaVibe";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustPrivacy from "@/components/landing/TrustPrivacy";
import GiftCredits from "@/components/landing/GiftCredits";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ unlockGenerationId?: string }>;
}) {
  const { unlockGenerationId } = await searchParams;

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <BeforeAfter />
        <Gallery />
        <OccasionCards />
        <PassportVisaVibe />
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
