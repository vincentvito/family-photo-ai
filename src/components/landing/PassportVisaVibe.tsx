import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const queue = [
  {
    name: "Ava",
    status: "Active",
    src: "/samples/passport-visa/passport-woman.webp",
  },
  {
    name: "Ben",
    status: "Queued",
    src: "/samples/passport-visa/passport-man.webp",
  },
  {
    name: "Sam",
    status: "Queued",
    src: "/samples/passport-visa/passport-child.webp",
  },
];

export default function PassportVisaVibe() {
  return (
    <section id="passport-visa" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="overflow-hidden rounded-[32px] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-lg)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative overflow-hidden bg-gradient-to-br from-white via-[color:var(--color-bg-tinted-butter)] to-[color:var(--color-bg-tinted-sage)] p-6 sm:p-10">
                <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/70 blur-2xl" />
                <div className="relative mx-auto max-w-md rounded-[28px] border border-white/80 bg-white/62 p-4 shadow-[var(--shadow-lg)] backdrop-blur">
                  <div className="rounded-[24px] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-4">
                    <div className="flex flex-wrap gap-2">
                      {["United Kingdom", "Passport photo", "35 x 45 mm"].map((item, index) => (
                        <span
                          key={item}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            index === 0
                              ? "bg-[color:var(--color-ink)] text-white"
                              : "border border-[color:var(--color-line-strong)] bg-white"
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-[0.62fr_1fr]">
                      <div className="rounded-[20px] bg-[color:var(--color-bg)] p-3">
                        <p className="small-caps text-[color:var(--color-ink-muted)]">
                          Family queue
                        </p>
                        <div className="mt-3 space-y-2">
                          {queue.map((person, index) => (
                            <div
                              key={person.name}
                              className={`flex items-center gap-2 rounded-[16px] px-3 py-2 ${
                                index === 0 ? "bg-[color:var(--color-bg-tinted-sage)]" : "bg-white"
                              }`}
                            >
                              <span className="relative h-8 w-8 overflow-hidden rounded-full bg-white shadow-[var(--shadow-sm)]">
                                <Image
                                  src={person.src}
                                  alt={`${person.name} passport photo preview`}
                                  fill
                                  sizes="32px"
                                  className="object-cover object-top"
                                />
                              </span>
                              <div>
                                <p className="text-sm font-semibold">{person.name}</p>
                                <p className="text-[11px] text-[color:var(--color-ink-muted)]">
                                  {person.status}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[color:var(--color-line-strong)] bg-white p-4 shadow-[var(--shadow-sm)]">
                        <div className="mx-auto max-w-[190px] overflow-hidden rounded-[16px] border border-[color:var(--color-line)] bg-white shadow-inner">
                          <Image
                            src={queue[0].src}
                            alt="Generated UK passport photo preview for Ava"
                            width={420}
                            height={540}
                            sizes="(min-width: 1024px) 190px, 55vw"
                            className="h-auto w-full object-cover"
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          <span className="rounded-full bg-[color:var(--color-ink)] px-3 py-1 text-[11px] font-semibold text-white">
                            White bg
                          </span>
                          <span className="rounded-full bg-[color:var(--color-bg-tinted-butter)] px-3 py-1 text-[11px] font-semibold">
                            4 x 6 sheet
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 lg:p-12">
                <span className="chip chip-sage">
                  <span className="dot dot-sage" />
                  Passport & visa mode
                </span>
                <h2 className="serif mt-5 max-w-2xl text-4xl leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                  A purpose-built document photo flow, not another vibe preset.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-base">
                  Choose the country and document requirements first, queue one family member, and
                  produce official-style white-background previews with exact size chips and
                  printable sheet guidance.
                </p>

                <div className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    [
                      "Country first",
                      "US, UK, Schengen, Canada, India, Australia, China, and Japan presets.",
                    ],
                    [
                      "One-person queue",
                      "Run the official photo workflow member by member for cleaner outputs.",
                    ],
                    [
                      "Official preview",
                      "White-background head-and-shoulders framing instead of lifestyle styling.",
                    ],
                    [
                      "Print-ready chips",
                      "Size, pixel output, and printable sheet notes stay visible.",
                    ],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-4"
                    >
                      <strong className="block text-[color:var(--color-ink)]">{title}</strong>
                      <span className="mt-1 block text-[color:var(--color-ink-muted)]">{body}</span>
                    </div>
                  ))}
                </div>

                <Link href="/passport-visa-photos" className="btn btn-coral mt-8">
                  Explore document photos
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
