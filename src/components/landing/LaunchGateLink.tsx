"use client";

import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  gated: boolean;
  gatedLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Renders the existing CTA when the launch gate is off; when it's on, swaps
 * the label to "Coming soon" and turns the element into a non-interactive,
 * dimmed span styled with the same button classes. The /sign-in route stays
 * reachable by URL so the owner can still get in.
 */
export default function LaunchGateLink({
  href,
  className,
  children,
  gated,
  gatedLabel = "Coming soon",
  onClick,
}: Props) {
  if (gated) {
    return (
      <span
        aria-disabled="true"
        className={className}
        style={{ opacity: 0.55, cursor: "not-allowed", pointerEvents: "none" }}
      >
        {gatedLabel}
      </span>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
