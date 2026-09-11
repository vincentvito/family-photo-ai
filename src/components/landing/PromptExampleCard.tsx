import Image from "next/image";
import Link from "next/link";
import PromptActions from "@/components/landing/PromptActions";
import { getPromptStudioHref } from "@/lib/theme-links";

type Props = {
  example: {
    id: string;
    title: string;
    image: string;
    alt: string;
    prompt: string;
    tips?: readonly string[];
  };
  styleHref?: string;
  styleLabel?: string;
  number?: number;
  wide?: boolean;
};

export default function PromptExampleCard({
  example,
  styleHref,
  styleLabel,
  number,
  wide = false,
}: Props) {
  return (
    <article
      id={example.id}
      aria-labelledby={`${example.id}-title`}
      className={`scroll-mt-28 overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] ${wide ? "lg:grid lg:grid-cols-2" : ""}`}
    >
      <div
        className={`relative bg-[color:var(--color-bg-tinted-sage)] ${wide ? "aspect-[4/5]" : "aspect-[4/3]"}`}
      >
        <Image
          src={example.image}
          alt={example.alt}
          fill
          sizes="(min-width: 1280px) 560px, (min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
        {number !== undefined && (
          <span className="absolute left-4 top-4 rounded-full bg-[color:var(--color-bg-elevated)]/95 px-3 py-1 font-[var(--font-fraunces)] text-2xl leading-none text-[color:var(--color-coral)] shadow-[var(--shadow-sm)]">
            {number}
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6">
        {styleHref && (
          <Link
            href={styleHref}
            className="text-sm font-semibold text-[color:var(--color-coral)] hover:underline"
          >
            {styleLabel ?? "Explore this style"} →
          </Link>
        )}
        <h3 id={`${example.id}-title`} className="serif mt-3 text-3xl tracking-[-0.02em]">
          {example.title}
        </h3>
        <blockquote className="mt-4 select-text rounded-[var(--radius-lg)] bg-[color:var(--color-bg)] p-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
          {example.prompt}
        </blockquote>
        <PromptActions
          title={example.title}
          prompt={example.prompt}
          createHref={getPromptStudioHref(example.prompt)}
        />
        {example.tips && example.tips.length > 0 && (
          <div className="mt-4 border-t border-[color:var(--color-line)] pt-4">
            <p className="text-sm font-semibold">Make this prompt your own</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              {example.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
