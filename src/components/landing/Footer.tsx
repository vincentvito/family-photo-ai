import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden px-6 py-20 sm:px-8 sm:py-24"
      style={{ background: "linear-gradient(180deg, #2E2239 0%, #231C2B 100%)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo size="md" tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:rgba(251,248,243,0.7)]">
            An AI family photo generator for frame-worthy portraits and holiday cards from the
            photos you already have.
          </p>
          <div className="mt-6">
            <Link href="/studio/roster" className="btn btn-coral btn-sm">
              Start a shoot
            </Link>
          </div>
        </div>

        <div>
          <p className="small-caps text-[color:rgba(251,248,243,0.55)]">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:rgba(251,248,243,0.85)]">
            <li>
              <a href="#gallery" className="hover:text-white transition-colors">
                Gallery
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-white transition-colors">
                How it works
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="small-caps text-[color:rgba(251,248,243,0.55)]">Care</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:rgba(251,248,243,0.85)]">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </li>
            <li>
              <a
                href="mailto:hi@familyphotoshoot.ai"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-[color:rgba(251,248,243,0.1)] pt-8 sm:flex-row sm:items-center">
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">
          © {new Date().getFullYear()} Family Photoshoot — Made with care for families.
        </p>
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">A paid-only family studio.</p>
      </div>
    </footer>
  );
}
