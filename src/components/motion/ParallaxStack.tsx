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

  return (
    <motion.div
      className="absolute"
      style={{
        x,
        y,
        rotate: item.rotate ?? 0,
        left: `${50 + (item.offsetX ?? 0)}%`,
        top: `${50 + (item.offsetY ?? 0)}%`,
        zIndex: item.zIndex ?? 1,
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{ opacity: 0, y: (item.offsetY ?? 0) + 12, rotate: 0 }}
      animate={{ opacity: 1, y: "-50%", rotate: item.rotate ?? 0 }}
      transition={{
        duration: 0.9,
        delay: 0.1 + (item.zIndex ?? 1) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {item.content}
    </motion.div>
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
