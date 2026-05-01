"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type Props = {
  count?: number;
  trigger?: boolean;
  className?: string;
};

const colors = ["#F26B4A", "#8AAE9B", "#FFD27A", "#4A3557", "#FFE3D6"];

export default function Confetti({ count = 14, trigger = true, className }: Props) {
  const reduce = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        x: (randomUnit(i, 1) - 0.5) * 260,
        y: -(80 + randomUnit(i, 2) * 180),
        rotate: (randomUnit(i, 3) - 0.5) * 520,
        size: 6 + randomUnit(i, 4) * 6,
        delay: randomUnit(i, 5) * 0.18,
        shape: i % 3,
      })),
    [count]
  );

  if (!trigger || reduce) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-visible ${className ?? ""}`} aria-hidden>
      <div className="absolute left-1/2 top-1/2">
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, rotate: p.rotate }}
            transition={{
              duration: 1.2,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.1, 0.75, 1],
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.shape === 0 ? p.size : p.size * 0.45,
              borderRadius: p.shape === 2 ? 999 : 2,
              background: p.color,
              left: 0,
              top: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function randomUnit(index: number, salt: number) {
  const value = Math.sin((index + 1) * (salt + 11) * 9301) * 10000;
  return value - Math.floor(value);
}
