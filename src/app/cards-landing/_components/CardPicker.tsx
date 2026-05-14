"use client";

import { useState } from "react";
import { HolidayCard } from "./HolidayCard";
import { OCCASIONS } from "./occasions";

export function CardPicker() {
  const [activeId, setActiveId] = useState<string>("christmas");
  const occ = OCCASIONS.find((o) => o.id === activeId) ?? OCCASIONS[0];

  return (
    <section
      style={{
        background: "var(--surface)",
        padding: "80px 0 96px",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div style={{ maxWidth: "76rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 44px" }}>
          <div className="small-caps" style={{ color: "var(--ink-muted)", marginBottom: 14 }}>
            Pick the moment
          </div>
          <h2 className="h-section">
            Cards for every{" "}
            <em className="serif-italic" style={{ color: "var(--coral)" }}>
              family holiday
            </em>
            .
          </h2>
          <p className="body-lg" style={{ margin: "18px auto 0", maxWidth: "32rem" }}>
            Tap an occasion. The card preview swaps to the right greeting, palette, and frame
            treatment.
          </p>
        </div>

        <div
          className="picker-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}
            >
              {OCCASIONS.map((o) => {
                const active = activeId === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setActiveId(o.id)}
                    className="spring-press"
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: "var(--radius-lg)",
                      background: active ? o.accentSoft : "var(--bg)",
                      border: "1px solid " + (active ? "transparent" : "var(--line)"),
                      outline: active ? `1.5px solid ${o.accent}` : "none",
                      outlineOffset: -1,
                      transition: "background 200ms, outline-color 200ms",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 9999,
                        background: o.accent,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 500,
                        fontSize: "1.05rem",
                        color: "var(--ink)",
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 22,
                padding: "14px 16px",
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div className="small-caps" style={{ marginBottom: 6 }}>
                Greeting · editable
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "1.4rem",
                  color: occ.accent,
                }}
              >
                {occ.greeting}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "var(--ink-muted)",
                  marginTop: 4,
                }}
              >
                {occ.sub}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: "-40px",
                background: `radial-gradient(circle at 50% 45%, ${occ.accentSoft} 0%, transparent 60%)`,
                transition: "background 400ms",
                pointerEvents: "none",
              }}
            />
            <div
              key={occ.id}
              style={{
                position: "relative",
                transform: "rotate(-2deg)",
                animation: "cardSwap 350ms cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              <HolidayCard occ={occ} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
