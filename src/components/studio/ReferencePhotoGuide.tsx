import Image from "next/image";

export default function ReferencePhotoGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-3 shadow-[var(--shadow-sm)]">
      <div className="overflow-hidden rounded-[calc(var(--radius-md)-6px)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-butter)]">
        <Image
          src="/illustrations/reference-photo-framing-guide.png"
          alt="Reference guide showing shoulders visible as best and a tight head-only crop as not ideal."
          width={1792}
          height={1024}
          sizes={compact ? "(max-width: 640px) 90vw, 560px" : "(max-width: 640px) 90vw, 720px"}
          className="h-auto w-[150%] max-w-none -translate-x-1/3"
          priority={false}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.1em]">
        <span className="text-[color:var(--color-sage-deep)]">Best: face and shoulders</span>
        <span className="text-[color:var(--color-coral-deep)]">Avoid: head only</span>
      </div>
      <p
        className={`mt-3 text-[color:var(--color-ink-muted)] ${
          compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"
        }`}
      >
        Use a clear photo where the face is easy to see and the shoulders are visible. A little
        upper body helps the AI understand posture and proportions without needing a full-body crop.
      </p>
    </div>
  );
}
