import { HolidayCard } from "./HolidayCard";
import { Reveal } from "./Reveal";
import { OCCASIONS, ctaHref } from "./occasions";

const SELFIES = [
  {
    img: "/cards-landing/hero-selfie-dad-airport.jpg",
    cap: "dad_airport.jpg",
    x: -10,
    y: 0,
    r: -8,
  },
  { img: "/cards-landing/hero-selfie-mom-kitchen.jpg", cap: "mom_kitchen.jpg", x: 90, y: 24, r: 5 },
  { img: "/cards-landing/hero-selfie-kid-pjs.jpg", cap: "kid_pjs.jpg", x: 20, y: 130, r: -3 },
  { img: "/cards-landing/hero-selfie-toddler.jpg", cap: "toddler.jpg", x: 130, y: 160, r: 9 },
  { img: "/cards-landing/hero-selfie-dog.jpg", cap: "buddy.jpg", x: -30, y: 230, r: -6 },
] as const;

function SelfieStack() {
  return (
    <div
      className="tilted-stack"
      style={{ position: "relative", height: 460, maxWidth: 340, margin: "0 auto" }}
    >
      {SELFIES.map((p, i) => (
        <figure
          key={p.cap}
          className="polaroid"
          style={{
            position: "absolute",
            width: 160,
            left: p.x,
            top: p.y,
            transform: `rotate(${p.r}deg)`,
            zIndex: i,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.img}
            alt=""
            style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
            loading="eager"
            decoding="async"
          />
          <figcaption
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontStyle: "normal",
              color: "var(--ink-muted)",
            }}
          >
            {p.cap}
          </figcaption>
        </figure>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: -10,
          right: 0,
          background: "var(--ink)",
          color: "#fff",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "7px 12px",
          borderRadius: 9999,
        }}
      >
        5 selfies uploaded
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{ textAlign: "center", padding: "0 8px" }}>
      <div className="flow-arrow" style={{ marginBottom: 14 }}>
        becomes
      </div>
      <svg
        width="120"
        height="32"
        viewBox="0 0 120 32"
        style={{ display: "block", margin: "0 auto", color: "var(--coral)" }}
      >
        <path
          d="M2 16 Q 30 4, 60 16 T 110 16"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 5"
        />
        <path
          d="M104 9 L 113 16 L 104 23"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="small-caps" style={{ marginTop: 14, color: "var(--coral-deep)" }}>
        ~ two minutes
      </div>
    </div>
  );
}

export function Hero() {
  const occ = OCCASIONS[0];
  return (
    <section
      className="warm-noise"
      style={{
        background: "var(--bg)",
        paddingTop: 120,
        paddingBottom: 88,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "76rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <Reveal>
          <div style={{ textAlign: "center", maxWidth: "58rem", margin: "0 auto 40px" }}>
            <div className="small-caps" style={{ color: "var(--coral-deep)", marginBottom: 18 }}>
              AI family holiday card generator
            </div>
            <h1 className="h-hero" style={{ margin: 0 }}>
              Five selfies. One{" "}
              <em className="serif-italic" style={{ color: "var(--coral)" }}>
                card-perfect
              </em>{" "}
              family.
            </h1>
            <p className="body-lg" style={{ margin: "18px auto 0", maxWidth: "36rem" }}>
              Drop in the photos you already have — the one where Dad&apos;s at the airport, the one
              of just the kids in pajamas — and we&apos;ll turn them into a printed-paper holiday
              card in about two minutes.
            </p>
          </div>
        </Reveal>

        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.05fr) auto minmax(0,0.95fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          <Reveal delay={0.06}>
            <SelfieStack />
          </Reveal>
          <Reveal delay={0.12}>
            <FlowArrow />
          </Reveal>
          <Reveal delay={0.18}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <HolidayCard occ={occ} size="lg" priority />
                <div
                  style={{
                    position: "absolute",
                    bottom: -32,
                    left: "50%",
                    transform: "translateX(-50%) rotate(-2deg)",
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    padding: "6px 12px",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    boxShadow: "var(--shadow-sm)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Print-ready 5×7&quot;
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 72,
            flexWrap: "wrap",
          }}
        >
          <a href={ctaHref()} className="btn btn-coral btn-lg spring-press">
            Begin a card
          </a>
          <a href="https://familyshoot.com/#gallery" className="btn btn-ghost btn-lg spring-press">
            See the gallery
          </a>
        </div>
        <div
          className="small-caps"
          style={{ textAlign: "center", marginTop: 22, color: "var(--ink-muted)" }}
        >
          No matching outfits · no studio date · no perfect group shot
        </div>
      </div>
    </section>
  );
}
