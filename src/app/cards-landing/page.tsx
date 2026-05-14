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
  title: "FamilyShoot — AI Family Holiday Cards",
  description:
    "Five selfies in, one printed-paper holiday card out. Drop in the photos you already have and we will turn them into a card-perfect family in about two minutes.",
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
