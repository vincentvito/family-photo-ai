"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type StackItem = {
  content: ReactNode;
  label?: string;
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
  index,
  activeIndex,
  mx,
  my,
  onSelect,
}: {
  item: StackItem;
  index: number;
  activeIndex: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  onSelect: (index: number) => void;
}) {
  const depth = item.depth ?? 10;
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  const isSelected = activeIndex === index;
  const zIndex = isSelected ? 20 : (item.zIndex ?? 1);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(index);
  }

  // Outer wrapper handles centering only — pure static CSS, correct from SSR.
  // Inner motion layer owns the entrance fade and parallax so neither can
  // clobber the -50% centering translate during hydration.
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Bring ${item.label ?? "photo"} forward`}
      onClick={() => onSelect(index)}
      onKeyDown={onKeyDown}
      className="absolute cursor-pointer rounded-[var(--radius-lg)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(242,107,74,0.35)]"
      style={{
        left: `${50 + (item.offsetX ?? 0)}%`,
        top: `${50 + (item.offsetY ?? 0)}%`,
        zIndex,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        style={{ x, y, rotate: isSelected ? 0 : (item.rotate ?? 0) }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: isSelected ? 1.03 : 1 }}
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
  const defaultActiveIndex = Math.max(
    0,
    items.findIndex(
      (item) => (item.zIndex ?? 1) === Math.max(...items.map((candidate) => candidate.zIndex ?? 1)),
    ),
  );
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

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
        <ParallaxItem
          key={i}
          item={item}
          index={i}
          activeIndex={activeIndex}
          mx={mx}
          my={my}
          onSelect={setActiveIndex}
        />
      ))}
    </div>
  );
}
