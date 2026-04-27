import Link from "next/link";
import Hero from "@/components/landing/Hero";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Gallery from "@/components/landing/Gallery";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustPrivacy from "@/components/landing/TrustPrivacy";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <BeforeAfter />
        <Gallery />
        <HowItWorks />
        <TrustPrivacy />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
