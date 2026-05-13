import Link from "next/link";
import Image from "next/image";

type BrandLogoProps = {
  href?: string;
  label?: string;
  size?: "sm" | "md";
  tone?: "light" | "dark";
  className?: string;
  showLabelOnMobile?: boolean;
};

const markSizes = {
  sm: "h-14 w-auto",
  md: "h-20 w-auto",
};

export default function BrandLogo({
  href,
  label = "FamilyShoot",
  size = "sm",
  tone = "dark",
  className = "",
}: BrandLogoProps) {
  const content = <BrandMark className={markSizes[size]} tone={tone} />;

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center ${className}`} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`} aria-label={label}>
      {content}
    </div>
  );
}

export function BrandMark({
  className = "h-10 w-auto",
  tone = "dark",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Image
      src="/familyshoot-logo.svg"
      alt=""
      aria-hidden="true"
      width={1122}
      height={1306}
      className={`${className} object-contain ${tone === "light" ? "invert" : ""}`}
      priority
    />
  );
}
