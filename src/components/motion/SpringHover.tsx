"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  scale?: number;
  lift?: number;
  rotate?: number;
  className?: string;
  as?: "div" | "button" | "a";
};

export default function SpringHover({
  children,
  scale = 1.02,
  lift = 4,
  rotate = 0,
  className,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={
        reduce
          ? undefined
          : { scale, y: -lift, rotate, transition: { type: "spring", stiffness: 320, damping: 22 } }
      }
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
