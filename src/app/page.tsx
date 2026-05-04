import Hero from "@/components/landing/Hero";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Gallery from "@/components/landing/Gallery";
import OccasionCards from "@/components/landing/OccasionCards";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustPrivacy from "@/components/landing/TrustPrivacy";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { isLaunchGated } from "@/lib/launch-gate";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const gated = isLaunchGated();
  return (
    <>
      <Nav gated={gated} />
      <main>
        <Hero gated={gated} />
        <BeforeAfter />
        <Gallery />
        <OccasionCards gated={gated} />
        <HowItWorks />
        <TrustPrivacy />
        <Pricing gated={gated} />
      </main>
      <Footer gated={gated} />
    </>
  );
}
