"use client";

import Reveal from "@/components/motion/Reveal";

const faqs = [
  {
    question: "What is an AI family photo generator?",
    answer:
      "It is a way to create a finished family portrait from everyday photos you already have. FamilyShoot uses your uploads as visual references, then turns them into a polished portrait, illustration, or card.",
  },
  {
    question: "Can I make a family portrait from separate photos?",
    answer:
      "Yes. Upload separate photos of each person, child, or selected pet, and FamilyShoot combines them into one natural family portrait. It is built for families who do not have one perfect group photo.",
  },
  {
    question: "Can I add a pet or someone missing from the original photo?",
    answer:
      "Yes. Add them to your roster with their own reference photos, then include them in the shoot. This works well for adding a pet, a child, or a family member who was not in the same picture.",
  },
  {
    question: "Can I make AI holiday cards or Christmas cards?",
    answer:
      "Yes. FamilyShoot includes holiday and occasion card styles for Christmas, Hanukkah, Diwali, Eid, Lunar New Year, Easter, birthdays, new babies, graduations, and more.",
  },
  {
    question: "Can I try it for free?",
    answer:
      "Yes. Your first photoshoot can be created as a watermarked free preview. If you love it, buy credits to unlock that exact photoshoot and remove the watermark.",
  },
  {
    question: "Can I buy FamilyShoot credits as a gift?",
    answer:
      "Yes. Choose Buy as gift on a one-time pack. After checkout, you get a private gift code and redeem link that stay available in your Gifts page.",
  },
  {
    question: "Do you email the gift code to the recipient?",
    answer:
      "Not automatically. To avoid unwanted or abusive email sending, the buyer copies the gift code or redeem link and shares it directly by text, email, or card.",
  },
  {
    question: "How does someone redeem a gift code?",
    answer:
      "They sign in or create an account, open the redeem link, or paste the code on the Gift credits page. The shoots are added to their account once the code is redeemed.",
  },
  {
    question: "Can I get a refund after a shoot is created?",
    answer:
      "Once a paid shoot has been unlocked or created, refunds are not available because the image generation work has already run and compute costs have been paid. If something breaks or your shoot fails, contact us and we will help make it right.",
  },
  {
    question: "How long are my photos stored?",
    answer:
      "Generated photos and reference uploads are kept for 14 days on one-time packs. FamilyShoot Pro shoots stay available for 90 days.",
  },
  {
    question: "What happens to inactive accounts?",
    answer:
      "Accounts with no shoots left may be removed after 30 days of inactivity. We send a reminder email first, so you have a chance to come back, download anything you still need, or add a pack before the account is cleared.",
  },
  {
    question: "Do you use my family photos to train AI models?",
    answer:
      "We do not use your photos to train FamilyShoot. Your uploads are used to create the portraits, cards, refinements, and downloads you request, which means they may be processed by our image-generation providers for that job.",
  },
  {
    question: "Can I delete something sooner?",
    answer:
      "Yes. You can remove reference photos and finished images from your studio wherever the app exposes a delete action. Those files are removed from active app storage.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="max-w-3xl">
            <span className="chip chip-sage">
              <span className="dot dot-sage" />
              FAQ
            </span>
            <h2 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
              A few careful details before you start.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.05}>
              <div className="grid gap-3 py-7 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
                <h3 className="serif text-2xl leading-tight">{faq.question}</h3>
                <p className="text-[0.98rem] leading-relaxed text-[color:var(--color-ink-muted)]">
                  {faq.answer}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
