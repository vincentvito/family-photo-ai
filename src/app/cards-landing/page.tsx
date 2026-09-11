import type { Metadata } from "next";
import "./landing-cards.css";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { Hero } from "./_components/Hero";
import { CardPicker } from "./_components/CardPicker";
import { GallerySlider } from "./_components/GallerySlider";
import { InContext } from "./_components/InContext";
import { CTABand } from "./_components/CTABand";

export const metadata: Metadata = {
  title: { absolute: "FamilyShoot — AI Family Holiday Cards" },
  description:
    "Create a digital family holiday card from one clear photo per person or pet. Start with a free watermarked preview and pay to unlock the high-resolution file.",
  alternates: { canonical: "https://familyshoot.ai/" },
};

export default function CardFirstLandingPage() {
  return (
    <>
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/cards", label: "Cards" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <div className="fs-card-landing">
        <Hero />
        <CardPicker />
        <GallerySlider />
        <InContext />
        <CTABand />
      </div>
      <Footer />
    </>
  );
}
