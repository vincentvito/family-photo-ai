import Image from "next/image";

export default function ReferencePhotoGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <div
        className={`overflow-hidden rounded-[calc(var(--radius-md)-6px)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-butter)] ${
          compact ? "mx-auto max-w-[260px]" : ""
        }`}
      >
        <Image
          src="/illustrations/reference-photo-framing-guide.png"
          alt="Reference guide showing shoulders visible as best and a tight head-only crop as not ideal."
          width={1792}
          height={1024}
          sizes={compact ? "(max-width: 640px) 260px, 260px" : "(max-width: 640px) 90vw, 720px"}
          className="h-auto w-[150%] max-w-none -translate-x-1/3"
          priority={false}
        />
      </div>
      <div
        className={`grid grid-cols-2 gap-2 text-center font-semibold uppercase ${
          compact
            ? "mx-auto mt-2 max-w-[260px] text-[0.6rem] tracking-[0.08em]"
            : "mt-3 text-[0.68rem] tracking-[0.1em]"
        }`}
      >
        <span className="text-[color:var(--color-sage-deep)]">Best: face and shoulders</span>
        <span className="text-[color:var(--color-coral-deep)]">Avoid: head only</span>
      </div>
      <p
        className={`text-[color:var(--color-ink-muted)] ${
          compact ? "mt-2 text-[0.72rem] leading-snug" : "mt-3 text-sm leading-relaxed"
        }`}
      >
        Use a clear photo where the face is easy to see and the shoulders are visible. A little
        upper body helps the AI understand posture and proportions without needing a full-body crop.
      </p>
    </div>
  );
}
