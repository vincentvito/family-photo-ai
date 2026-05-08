import Link from "next/link";
import Image from "next/image";

type BrandLogoProps = {
  href?: string;
  label?: string;
  size?: "sm" | "md";
  tone?: "light" | "dark";
  className?: string;
};

const markSizes = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
};

const textSizes = {
  sm: "text-2xl",
  md: "text-3xl",
};

export default function BrandLogo({
  href,
  label = "FamilyShoot",
  size = "sm",
  tone = "dark",
  className = "",
}: BrandLogoProps) {
  const familyColor =
    tone === "light" ? "text-[color:var(--color-bg)]" : "text-[color:var(--color-plum)]";
  const shootColor =
    tone === "light" ? "text-[color:var(--color-coral)]" : "text-[color:var(--color-coral)]";
  const content = (
    <>
      <BrandMark className={markSizes[size]} />
      <span className={`serif hidden tracking-tight sm:inline ${textSizes[size]}`}>
        {label === "FamilyShoot" ? (
          <>
            <span className={familyColor}>Family</span>
            <span className={shootColor}>Shoot</span>
          </>
        ) : (
          <span className={familyColor}>{label.replace(" ", "\u00a0")}</span>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center gap-2.5 ${className}`} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label={label}>
      {content}
    </div>
  );
}

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.svg"
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
      className={`${className} object-contain`}
      priority
    />
  );
}
