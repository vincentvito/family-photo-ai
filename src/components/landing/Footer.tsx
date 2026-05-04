import LaunchGateLink from "./LaunchGateLink";

export default function Footer({ gated = false }: { gated?: boolean }) {
  return (
    <footer
      className="relative overflow-hidden px-6 py-20 sm:px-8 sm:py-24"
      style={{ background: "linear-gradient(180deg, #2E2239 0%, #231C2B 100%)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full bg-[color:var(--color-coral)]"
                aria-hidden
              />
              <span className="relative text-[10px] font-bold tracking-[0.18em] text-white">
                FP
              </span>
            </span>
            <p className="serif text-2xl text-[color:var(--color-bg)]">Family Photoshoot</p>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:rgba(251,248,243,0.7)]">
            Frame-worthy family portraits from the photos you already have. Made with care for
            families, by a small team of two.
          </p>
          <div className="mt-6">
            <LaunchGateLink href="/studio/roster" gated={gated} className="btn btn-coral btn-sm">
              Start a shoot
            </LaunchGateLink>
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
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">A private, paid-only studio.</p>
      </div>
    </footer>
  );
}
