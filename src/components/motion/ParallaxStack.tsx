"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type StackItem = {
  content: ReactNode;
  depth?: number;
  rotate?: number;
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
};

type Props = {
  items: StackItem[];
  className?: string;
};

function ParallaxItem({
  item,
  mx,
  my,
}: {
  item: StackItem;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const depth = item.depth ?? 10;
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);

  // Outer wrapper handles centering only — pure static CSS, correct from SSR.
  // Inner motion layer owns the entrance fade and parallax so neither can
  // clobber the -50% centering translate during hydration.
  return (
    <div
      className="absolute"
      style={{
        left: `${50 + (item.offsetX ?? 0)}%`,
        top: `${50 + (item.offsetY ?? 0)}%`,
        zIndex: item.zIndex ?? 1,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        style={{ x, y, rotate: item.rotate ?? 0 }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.7,
          delay: 0.1 + (item.zIndex ?? 1) * 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {item.content}
      </motion.div>
    </div>
  );
}

export default function ParallaxStack({ items, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const mx = useSpring(rawX, { stiffness: 90, damping: 20 });
  const my = useSpring(rawY, { stiffness: 90, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(nx);
    rawY.set(ny);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative ${className ?? ""}`}
    >
      {items.map((item, i) => (
        <ParallaxItem key={i} item={item} mx={mx} my={my} />
      ))}
    </div>
  );
}
